import fs from 'fs';
import path from 'path';
import { sources, OUTPUT_DIR } from './config.js';
import { fetchLots } from './fetcher.js';
import { normalizeAll } from './normalizer.js';
import { buildYandexXml } from './xmlBuilder.js';

/**
 * Транслитерирует название проекта в безопасное имя файла
 * 'ЖК "Легенда Марусино"' -> 'legendamarusino'
 */
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

async function run() {
  console.log('\n=== Запуск парсера ===\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allLots = [];

  for (const source of sources) {
    if (!source.projectId) {
      console.warn(`  ПРОПУСК: не задан projectId для ${source.project}`);
      continue;
    }

    const raw = await fetchLots(source.api, source.projectId);
    const normalized = normalizeAll(raw, source.site, source.project);
    console.log(`  Нормализовано лотов из ${source.project}: ${normalized.length}`);

    // --- Отдельный XML и JSON по каждому ЖК ---
    const slug = toFilename(source.project);

    const projectJsonPath = path.join(OUTPUT_DIR, `${slug}.json`);
    fs.writeFileSync(projectJsonPath, JSON.stringify(normalized, null, 2), 'utf-8');
    console.log(`  JSON сохранен:  ${projectJsonPath}`);

    const projectXmlPath = path.join(OUTPUT_DIR, `${slug}.xml`);
    fs.writeFileSync(projectXmlPath, buildYandexXml(normalized), 'utf-8');
    console.log(`  XML сохранен:   ${projectXmlPath}`);

    allLots.push(...normalized);
  }

  // --- Объединённый фид из всех ЖК ---
  console.log(`\nВсего лотов в объединённом фиде: ${allLots.length}`);

  const combinedJsonPath = path.join(OUTPUT_DIR, 'feed.json');
  fs.writeFileSync(combinedJsonPath, JSON.stringify(allLots, null, 2), 'utf-8');
  console.log(`JSON объединённый сохранен: ${combinedJsonPath}`);

  const combinedXmlPath = path.join(OUTPUT_DIR, 'feed.xml');
  fs.writeFileSync(combinedXmlPath, buildYandexXml(allLots), 'utf-8');
  console.log(`XML объединённый сохранён: ${combinedXmlPath}`);

  console.log('\n=== Готово ===\n');
}

run().catch(err => {
  console.error('Критическая ошибка:', err.message);
  process.exit(1);
});
