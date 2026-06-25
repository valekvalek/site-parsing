import http from 'http';
import fs from 'fs';
import path from 'path';
import { sources, OUTPUT_DIR, PAGE_LIMIT } from './config.js';
import { fetchLots } from './fetcher.js';
import { normalizeAll } from './normalizer.js';
import { buildYandexXml } from './xmlBuilder.js';

const PORT = process.env.PORT || 3000;

// Обновлять фид каждые N минут
 const UPDATE_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 часа

// Транслитерация названия проекта в имя файла
function toFilename(projectName) {
  return projectName
    .toLowerCase()
    .replace(/[жк\s"'«»]+/g, '')
    .replace(/[^a-zа-я0-9]/g, '')
    .replace(/легенда/, 'legenda')
    .replace(/марусино/, 'marusino')
    .replace(/коренёво|коренево/, 'korenevo')
    || 'project';
}

// Генерирует и сохраняет все фиды
async function updateFeeds() {
  console.log(`[${new Date().toLocaleString('ru')}] Обновление фидов...`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allLots = [];

  for (const source of sources) {
    if (!source.projectId) continue;

    try {
      const raw = await fetchLots(source.api, source.projectId);
      const normalized = normalizeAll(raw, source.site, source.project);
      const slug = toFilename(source.project);

      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${slug}.xml`),
        buildYandexXml(normalized),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${slug}.json`),
        JSON.stringify(normalized, null, 2),
        'utf-8'
      );

      console.log(`  ✓ ${source.project}: ${normalized.length} лотов → ${slug}.xml`);
      allLots.push(...normalized);
    } catch (err) {
      console.error(`  ✗ ${source.project}: ${err.message}`);
    }
  }

  // Объединённый фид
  fs.writeFileSync(path.join(OUTPUT_DIR, 'feed.xml'), buildYandexXml(allLots), 'utf-8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'feed.json'), JSON.stringify(allLots, null, 2), 'utf-8');
  console.log(`  ✓ Объединённый фид: ${allLots.length} лотов → feed.xml`);
  console.log(`  Следующее обновление через ${UPDATE_INTERVAL_MS / 60000} мин.`);
}

// Маршруты → файлы
const ROUTES = {
  '/feed':            'feed.xml',
  '/feed.xml':        'feed.xml',
  '/feed.json':       'feed.json',
  '/marusino':        'legendamarusino.xml',
  '/marusino.xml':    'legendamarusino.xml',
  '/korenevo':        'legendakorenevo.xml',
  '/korenevo.xml':    'legendakorenevo.xml',
};

// HTTP-сервер
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Главная страница со списком маршрутов
  if (url === '/') {
    const lastUpdated = fs.existsSync(path.join(OUTPUT_DIR, 'feed.xml'))
      ? fs.statSync(path.join(OUTPUT_DIR, 'feed.xml')).mtime.toLocaleString('ru')
      : 'ещё не создан';

    const body = [
      '=== Feed Server ===',
      '',
      'Доступные урлы:',
      `  /feed         -> feed.xml (объединённый)`,
      `  /marusino     -> legendamarusino.xml`,
      `  /korenevo     -> legendakorenevo.xml`,
      `  /feed.json    -> feed.json`,
      '',
      `Последнее обновление: ${lastUpdated}`,
      `Интервал обновления: ${UPDATE_INTERVAL_MS / 60000} мин.`,
    ].join('\n');

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(body);
    return;
  }

  const filename = ROUTES[url];
  if (!filename) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const filePath = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Фид ещё не сформирован. Подождите несколько секунд.');
    return;
  }

  const isJson = filename.endsWith('.json');
  const contentType = isJson ? 'application/json; charset=utf-8' : 'application/xml; charset=utf-8';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);

  console.log(`[${new Date().toLocaleString('ru')}] GET ${url} -> ${filename}`);
});

// Старт: сразу сформировать фиды, затем по расписанию
updateFeeds().then(() => {
  setInterval(updateFeeds, UPDATE_INTERVAL_MS);

  server.listen(PORT, () => {
    console.log(`
Сервер запущен: http://localhost:${PORT}

Доступные URL:
  http://localhost:${PORT}/feed         -> объединённый фид
  http://localhost:${PORT}/marusino     -> Только Марусино
  http://localhost:${PORT}/korenevo     -> Только Коренёво
  http://localhost:${PORT}/feed.json    -> JSON
    `);
  });
});
