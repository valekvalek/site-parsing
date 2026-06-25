import fs from 'fs';
import path from 'path';
import { sources, OUTPUT_DIR } from './config.js';
import { fetchLots } from './fetcher.js';
import { normalizeAll } from './normalizer.js';
import { buildYandexXml } from './xmlBuilder.js';

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

    // slug берём прямо из config.js (source.slug)
    const slug = source.slug;
    console.log(`  ${source.project} [${slug}]: ${normalized.length} лотов`);

    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.json`), JSON.stringify(normalized, null, 2), 'utf-8');
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.xml`), buildYandexXml(normalized), 'utf-8');

    allLots.push(...normalized);
  }

  console.log(`\nВсего лотов в объединённом фиде: ${allLots.length}`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'feed.json'), JSON.stringify(allLots, null, 2), 'utf-8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'feed.xml'), buildYandexXml(allLots), 'utf-8');

  console.log('\n=== Готово ===\n');
}

run().catch(err => {
  console.error('Критическая ошибка:', err.message);
  process.exit(1);
});
