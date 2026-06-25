import fs from 'fs';
import path from 'path';
import { sources, OUTPUT_DIR } from './config.js';
import { fetchLots } from './fetcher.js';
import { normalizeAll } from './normalizer.js';
import { buildYandexXml } from './xmlBuilder.js';

async function run() {
  console.log('\n=== Запуск парсера ===\n');

  const allLots = [];

  for (const source of sources) {
    if (!source.projectId) {
      console.warn(`  ПРОПУСК: не задан projectId для ${source.project}`);
      continue;
    }

    const raw = await fetchLots(source.api, source.projectId);
    const normalized = normalizeAll(raw, source.site, source.project);
    console.log(`  Нормализовано лотов из ${source.project}: ${normalized.length}`);
    allLots.push(...normalized);
  }

  console.log(`\nВсего лотов для фида: ${allLots.length}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Сохраняем JSON для отладки
  const jsonPath = path.join(OUTPUT_DIR, 'feed.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allLots, null, 2), 'utf-8');
  console.log(`JSON сохранен: ${jsonPath}`);

  // Генерируем и сохраняем XML
  const xml = buildYandexXml(allLots);
  const xmlPath = path.join(OUTPUT_DIR, 'feed.xml');
  fs.writeFileSync(xmlPath, xml, 'utf-8');
  console.log(`XML фид сохранен: ${xmlPath}`);

  console.log('\n=== Готово ===\n');
}

run().catch(err => {
  console.error('Критическая ошибка:', err.message);
  process.exit(1);
});
