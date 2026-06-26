import fs from 'fs';
import path from 'path';
import { sources, OUTPUT_DIR } from './config.js';
import { fetchLots } from './fetcher.js';
import { fetchBitrixLots } from './fetcherBitrix.js';
import { normalizeAll } from './normalizer.js';
import { normalizeBitrixLots } from './normalizerBitrix.js';
import { buildYandexXml } from './xmlBuilder.js';
import { buildCianXml } from './xmlBuilderCian.js';

async function run() {
  console.log('\n=== Запуск парсера ===\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allLots = [];

  for (const source of sources) {
    if (!source.slug) {
      console.warn(`  ПРОПУСК: нет slug для ${source.project}`);
      continue;
    }

    let normalized = [];

    if (source.type === 'bitrix') {
      const raw = await fetchBitrixLots(source.site);
      normalized = normalizeBitrixLots(raw, source.site, source.project);
    } else {
      if (!source.projectId) {
        console.warn(`  ПРОПУСК: нет projectId для ${source.project}`);
        continue;
      }
      const raw = await fetchLots(source.api, source.projectId);
      normalized = normalizeAll(raw, source.site, source.project);
    }

    console.log(`  ${source.project} [${source.slug}]: ${normalized.length} лотов`);

    // JSON срез проекта
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${source.slug}.json`),
      JSON.stringify(normalized, null, 2),
      'utf-8'
    );

    // Yandex XML срез проекта
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${source.slug}.xml`),
      buildYandexXml(normalized),
      'utf-8'
    );

    // CIAN-like XML срез проекта
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${source.slug}-cian.xml`),
      buildCianXml(normalized),
      'utf-8'
    );

    allLots.push(...normalized);
  }

  console.log(`\nВсего лотов: ${allLots.length}`);

  // Сводные фиды по всем проектам
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'feed.json'),
    JSON.stringify(allLots, null, 2),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'feed.xml'),
    buildYandexXml(allLots),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'feed-cian.xml'),
    buildCianXml(allLots),
    'utf-8'
  );

  console.log('\n=== Готово ===\n');
}

run().catch(err => {
  console.error('Критическая ошибка:', err.message);
  process.exit(1);
});
