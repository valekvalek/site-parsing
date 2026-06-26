import http from 'http';
import fs from 'fs';
import path from 'path';
import { sources, OUTPUT_DIR } from './config.js';
import { fetchLots } from './fetcher.js';
import { fetchBitrixLots } from './fetcherBitrix.js';
import { normalizeAll } from './normalizer.js';
import { normalizeBitrixLots } from './normalizerBitrix.js';
import { buildYandexXml } from './xmlBuilder.js';
import { buildCianXml } from './xmlBuilderCian.js';

const PORT = process.env.PORT || 3000;
const UPDATE_INTERVAL_MS = 2 * 60 * 60 * 1000;

async function updateFeeds() {
  console.log(`[${new Date().toLocaleString('ru')}] Обновление фидов...`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const allLots = [];

  for (const source of sources) {
    if (!source.slug) continue;

    let normalized = [];

    try {
      if (source.type === 'bitrix') {
        const raw = await fetchBitrixLots(source.site);
        normalized = normalizeBitrixLots(raw, source.site, source.project);
      } else {
        if (!source.projectId) continue;
        const raw = await fetchLots(source.api, source.projectId);
        normalized = normalizeAll(raw, source.site, source.project, source.lat ?? null, source.lng ?? null);
      }

      const slug = source.slug;

      fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.json`),     JSON.stringify(normalized, null, 2), 'utf-8');
      fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.xml`),      buildYandexXml(normalized), 'utf-8');
      fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}-cian.xml`), buildCianXml(normalized),   'utf-8');

      console.log(`  ✓ ${source.project}: ${normalized.length} лотов`);
      allLots.push(...normalized);
    } catch (err) {
      console.error(`  ✗ ${source.project}: ${err.message}`);
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'feed.json'),     JSON.stringify(allLots, null, 2), 'utf-8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'feed.xml'),      buildYandexXml(allLots), 'utf-8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'feed-cian.xml'), buildCianXml(allLots),   'utf-8');

  console.log(`  ✓ Объединённый: ${allLots.length} лотов`);
}

const ROUTES = {
  // Yandex XML
  '/feed':              'feed.xml',
  '/feed.xml':          'feed.xml',
  '/feed.json':         'feed.json',
  '/marusino':          'legendamarusino.xml',
  '/marusino.xml':      'legendamarusino.xml',
  '/korenevo':          'legendakorenevo.xml',
  '/korenevo.xml':      'legendakorenevo.xml',
  // CIAN-like XML
  '/feed-cian':         'feed-cian.xml',
  '/feed-cian.xml':     'feed-cian.xml',
  '/marusino-cian':     'legendamarusino-cian.xml',
  '/marusino-cian.xml': 'legendamarusino-cian.xml',
  '/korenevo-cian':     'legendakorenevo-cian.xml',
  '/korenevo-cian.xml': 'legendakorenevo-cian.xml',
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/') {
    const lastUpdated = fs.existsSync(path.join(OUTPUT_DIR, 'feed.xml'))
      ? fs.statSync(path.join(OUTPUT_DIR, 'feed.xml')).mtime.toLocaleString('ru')
      : 'ещё не создан';
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end([
      '=== Feed Server ===',
      '',
      '--- Yandex XML ---',
      '/feed              -> feed.xml (объединённый)',
      '/marusino          -> legendamarusino.xml',
      '/korenevo          -> legendakorenevo.xml',
      '/feed.json         -> feed.json',
      '',
      '--- CIAN-like XML ---',
      '/feed-cian         -> feed-cian.xml (объединённый)',
      '/marusino-cian     -> legendamarusino-cian.xml',
      '/korenevo-cian     -> legendakorenevo-cian.xml',
      '',
      `Последнее обновление: ${lastUpdated}`,
    ].join('\n'));
    return;
  }

  const filename = ROUTES[url];
  if (!filename) { res.writeHead(404); res.end('404 Not Found'); return; }

  const filePath = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(filePath)) { res.writeHead(503); res.end('Фид ещё не сформирован.'); return; }

  const contentType = filename.endsWith('.json')
    ? 'application/json; charset=utf-8'
    : 'application/xml; charset=utf-8';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
  console.log(`[${new Date().toLocaleString('ru')}] GET ${url} -> ${filename}`);
});

updateFeeds().then(() => {
  setInterval(updateFeeds, UPDATE_INTERVAL_MS);
  server.listen(PORT, () => {
    console.log(`Сервер: http://localhost:${PORT}`);
  });
});
