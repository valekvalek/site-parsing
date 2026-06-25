import axios from 'axios';
import { load } from 'cheerio';

const AJAX_URL = 'https://afi-park.ru/bitrix/components/bitrix/catalog/ajax.php';

// Фиксированные параметры из Payload
const FIXED_PARAMS = new URLSearchParams({
  siteId: 's1',
  template: '.default.52a798462cbe9d9f13a98d9fe7e61a683fe21e81a7df6e4bfa971017a6c3cc74',
  parameters: 'YTo4OTp7czoxNToiQUNUSU9OX1ZBUklBQkxFIjtzOjY6ImFjdGlvbiI7czoxMzoiQUREX1BJQ1RfUFJPUCI7czoxOiItIjtzOjI0OiJBRERfUFJPUEVSVElFU19UT19CQVNLRVQiO3M6MToiWSI7czoxODoiQUREX1NFQ1RJT05TX0NIQUlOIjtzOjE6Ik4iO3M6OToiQUpBWF9NT0RFIjtzOjE6Ik4iO3M6MjI6IkFKQVhfT1BUSU9OX0FERElUSU9OQUwiO3M6MDoiIjtzOjE5OiJBSkFYX09QVElPTl9ISVNUT1JZIjtzOjE6Ik4iO3M6MTY6IkFKQVhfT1BUSU9OX0pVTVAiO3M6MToiTiI7czoxNzoiQUpBWF9PUFRJT05fU1RZTEUiO3M6MToiWSI7czoxNjoiQkFDS0dST1VORF9JTUFHRSI7czoxOiItIjtzOjEwOiJCQVNLRVRfVVJMIjtzOjIwOiIvcGVyc29uYWwvYmFza2V0LnBocCI7czoxMzoiQlJPV1NFUl9USVRMRSI7czoxOiItIjtzOjEyOiJDQUNIRV9GSUxURVIiO3M6MToiTiI7czoxMjoiQ0FDSEVfR1JPVVBTIjtzOjE6IlkiO3M6MTA6IkNBQ0hFX1RJTUUiO3M6ODoiMzYwMDAwMDAiO3M6MTA6IkNBQ0hFX1RZUEUiO3M6MToiQSI7czoxNToiQ09NUEFUSUJMRV9NT0RFIjtzOjE6Ik4iO3M6MjA6IkNPTVBPU0lURV9GUkFNRV9NT0RFIjtzOjE6IkEiO3M6MjA6IkNPTVBPU0lURV9GUkFNRV9UWVBFIjtzOjQ6IkFVVE8iO3M6MTA6IkRFVEFJTF9VUkwiO3M6MDoiIjtzOjI4OiJESVNBQkxFX0lOSVRfSlNfSU5fQ09NUE9ORU5UIjtzOjE6Ik4iO3M6MjA6IkRJU1BMQVlfQk9UVE9NX1BBR0VSIjtzOjE6Ik4iO3M6MTU6IkRJU1BMQVlfQ09NUEFSRSI7czoxOiJOIjtzOjE3OiJESVNQTEFZX1RPUF9QQUdFUiI7czoxOiJOIjtzOjE4OiJFTEVNRU5UX1NPUlRfRklFTEQiO3M6MTk6IlBST1BFUlRZX1BSSUNFX1NBTEUiO3M6MTk6IkVMRU1FTlRfU09SVF9GSUVMRDIiO3M6MjoiaWQiO3M6MTg6IkVMRU1FTlRfU09SVF9PUkRFUiI7czozOiJBU0MiO3M6MTk6IkVMRU1FTlRfU09SVF9PUkRFUjIiO3M6NDoiZGVzYyI7czoxNToiRU5MQVJHRV9QUk9EVUNUIjtzOjY6IlNUUklDVCI7czoxMToiRklMVEVSX05BTUUiO3M6OToiYXJyRmlsdGVyIjtzOjk6IklCTE9DS19JRCI7czoxOiI2IjtzOjExOiJJQkxPQ0tfVFlQRSI7czo2OiJyZWFsdHkiO3M6MTk6IklOQ0xVREVfU1VCU0VDVElPTlMiO3M6MToiWSI7czoxMDoiTEFCRUxfUFJPUCI7YTowOnt9czo5OiJMQVpZX0xPQUQiO3M6MToiWSI7czoxODoiTElORV9FTEVNRU5UX0NPVU5UIjtzOjE6IjMiO3M6MTQ6IkxPQURfT05fU0NST0xMIjtzOjE6Ik4iO3M6MTE6Ik1FU1NBR0VfNDA0IjtzOjA6IiI7czoyMjoiTUVTU19CVE5fQUREX1RPX0JBU0tFVCI7czoxNzoi0JIg0LrQvtGA0LfQuNC90YMiO3M6MTI6Ik1FU1NfQlROX0JVWSI7czoxMjoi0JrRg9C/0LjRgtGMIjtzOjE1OiJNRVNTX0JUTl9ERVRBSUwiO3M6MTg6ItCf0L7QtNGA0L7QsdC90LXQtSI7czoxODoiTUVTU19CVE5fTEFaWV9MT0FEIjtzOjIzOiLQn9C+0LrQsNC30LDRgtGMINC10YnRkSI7czoxODoiTUVTU19CVE5fU1VCU0NSSUJFIjtzOjIyOiLQn9C+0LTQv9C40YHQsNGC0YzRgdGPIjtzOjE4OiJNRVNTX05PVF9BVkFJTEFCTEUiO3M6MjQ6ItCd0LXRgiDQsiDQvdCw0LvQuNGH0LjQuCI7czoyNjoiTUVTU19OT1RfQVZBSUxBQkxFX1NFUlZJQ0UiO3M6MjA6ItCd0LXQtNC+0YHRgtGD0L/QvdC+IjtzOjE2OiJNRVRBX0RFU0NSSVBUSU9OIjtzOjE6Ii0iO3M6MTM6Ik1FVEFfS0VZV09SRFMiO3M6MToiLSI7czoxMjoiT0ZGRVJTX0xJTUlUIjtzOjE6IjUiO3M6MjI6IlBBR0VSX0JBU0VfTElOS19FTkFCTEUiO3M6MToiTiI7czoyMDoiUEFHRVJfREVTQ19OVU1CRVJJTkciO3M6MToiTiI7czozMToiUEFHRVJfREVTQ19OVU1CRVJJTkdfQ0FDSEVfVElNRSI7czo1OiIzNjAwMCI7czoxNDoiUEFHRVJfU0hPV19BTEwiO3M6MToiTiI7czoxNzoiUEFHRVJfU0hPV19BTFdBWVMiO3M6MToiTiI7czoxNDoiUEFHRVJfVEVNUExBVEUiO3M6ODoiLmRlZmF1bHQiO3M6MTE6IlBBR0VSX1RJVExFIjtzOjEyOiLQotC+0LLQsNGA0YsiO3M6MTg6IlBBR0VfRUxFTUVOVF9DT1VOVCI7czoyOiIxMiI7czoyNjoiUEFSVElBTF9QUk9EVUNUX1BST1BFUlRJRVMiO3M6MToiTiI7czoxMDoiUFJJQ0VfQ09ERSI7YTowOnt9czoxNzoiUFJJQ0VfVkFUX0lOQ0xVREUiO3M6MToiWSI7czoyMDoiUFJPRFVDVF9CTE9DS1NfT1JERVIiO3M6NDY6InByaWNlLHByb3BzLHNrdSxxdWFudGl0eUxpbWl0LHF1YW50aXR5LGJ1dHRvbnMiO3M6MTk6IlBST0RVQ1RfSURfVkFSSUFCTEUiO3M6MjoiaWQiO3M6MjI6IlBST0RVQ1RfUFJPUFNfVkFSSUFCTEUiO3M6NDoicHJvcCI7czoyNToiUFJPRFVDVF9RVUFOVElUWV9WQVJJQUJMRSI7czo4OiJxdWFudGl0eSI7czoyMDoiUFJPRFVDVF9ST1dfVkFSSUFOVFMiO3M6MTk5OiJbeydWQVJJQU5UJzonMicsJ0JJR19EQVRBJzpmYWxzZX0seydWQVJJQU5UJzonMicsJ0JJR19EQVRBJzpmYWxzZX0seydWQVJJQU5UJzonMicsJ0JJR19EQVRBJzpmYWxzZX0seydWQVJJQU5UJzonMicsJ0JJR19EQVRBJzpmYWxzZX0seydWQVJJQU5UJzonMicsJ0JJR19EQVRBJzpmYWxzZX0seydWQVJJQU5UJzonMicsJ0JJR19EQVRBJzpmYWxzZX1dIjtzOjEyOiJTRUNUSU9OX0NPREUiO3M6MDoiIjtzOjEwOiJTRUNUSU9OX0lEIjtzOjA6IiI7czoxOToiU0VDVElPTl9JRF9WQVJJQUJMRSI7czoxMDoiU0VDVElPTl9JRCI7czoxMToiU0VDVElPTl9VUkwiO3M6MDoiIjtzOjE5OiJTRUNUSU9OX1VTRVJfRklFTERTIjthOjI6e2k6MDtzOjA6IiI7aToxO3M6MDoiIjt9czo4OiJTRUZfTU9ERSI7czoxOiJOIjtzOjE3OiJTRVRfQlJPV1NFUl9USVRMRSI7czoxOiJZIjtzOjE3OiJTRVRfTEFTVF9NT0RJRklFRCI7czoxOiJOIjtzOjIwOiJTRVRfTUVUQV9ERVNDUklQVElPTiI7czoxOiJZIjtzOjE3OiJTRVRfTUVUQV9LRVlXT1JEUyI7czoxOiJZIjtzOjE0OiJTRVRfU1RBVFVTXzQwNCI7czoxOiJOIjtzOjk6IlNFVF9USVRMRSI7czoxOiJZIjtzOjg6IlNIT1dfNDA0IjtzOjE6Ik4iO3M6MTk6IlNIT1dfQUxMX1dPX1NFQ1RJT04iO3M6MToiTiI7czoxNjoiU0hPV19QUklDRV9DT1VOVCI7czoxOiIxIjtzOjExOiJTSE9XX1NMSURFUiI7czoxOiJZIjtzOjE1OiJTTElERVJfSU5URVJWQUwiO3M6NDoiMzAwMCI7czoxNToiU0xJREVSX1BST0dSRVNTIjtzOjE6Ik4iO3M6MTQ6IlRFTVBMQVRFX1RIRU1FIjtzOjQ6ImJsdWUiO3M6MjI6IlVTRV9FTkhBTkNFRF9FQ09NTUVSQ0UiO3M6MToiTiI7czoyNDoiVVNFX01BSU5fRUxFTUVOVF9TRUNUSU9OIjtzOjE6Ik4iO3M6MTU6IlVTRV9QUklDRV9DT1VOVCI7czoxOiJOIjtzOjIwOiJVU0VfUFJPRFVDVF9RVUFOVElUWSI7czoxOiJOIjtzOjE3OiJDVVJSRU5UX0JBU0VfUEFHRSI7czo3OiIvcGFyYW0vIjtzOjEzOiJHTE9CQUxfRklMVEVSIjthOjU6e3M6MTI6Ij1QUk9QRVJUWV8yNiI7YToyOntpOjA7czoxOiIwIjtpOjE7czoxOiIxIjt9czoxMzoiPjxQUk9QRVJUWV8yMyI7YToyOntpOjA7czo4OiIxODEyODA0OSI7aToxO3M6ODoiNDM3NjQ5ODMiO31zOjEzOiI+PFBST1BFUlRZXzI0IjthOjI6e2k6MDtzOjk6IjM2NTA0MS4yOCI7aToxO3M6OToiNjk2NTMzLjA5Ijt9czoxMzoiPjxQUk9QRVJUWV8yMSI7YToyOntpOjA7czo0OiIyOC41IjtpOjE7czo0OiI5Ny4yIjt9czoxMzoiPjxQUk9QRVJUWV8yMCI7YToyOntpOjA7czoxOiIyIjtpOjE7czoyOiIyNSI7fX19.226952ea3c772536ef7941e2f17d83c1d2f2564b8d27f89289f9004b5abe1e02',
  action: 'showMore',
});

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,*/*',
  'Accept-Language': 'ru-RU,ru;q=0.9',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://afi-park.ru/param/',
};

/**
 * Парсит HTML-ответ и возвращает массив лотов
 */
function parseHtml(html, site) {
  const $ = load(html);
  const lots = [];

  // Каждая карточка квартиры
  $('.catalog-item, .flat-item, [class*="flat"], [class*="apartment"], [class*="lot"]').each((_, el) => {
    const $el = $(el);

    // Попытка вытащить данные из data-атрибутов (Bitrix часто кладёт всё там)
    const dataRaw = $el.attr('data-params') || $el.attr('data-item') || '{}';
    let data = {};
    try { data = JSON.parse(dataRaw); } catch {}

    const priceText = $el.find('[class*="price"]').first().text().replace(/\D/g, '');
    const areaText  = $el.find('[class*="area"]').first().text().replace(',', '.').match(/[\d.]+/)?.[0];
    const floorText = $el.find('[class*="floor"]').first().text().match(/\d+/)?.[0];
    const roomsText = $el.find('[class*="room"]').first().text().match(/\d+/)?.[0];
    const href      = $el.find('a').first().attr('href');
    const img       = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
    const id        = $el.attr('data-id') || $el.attr('id') || data.ID || data.id;

    const price = Number(priceText);
    const area  = Number(areaText);
    if (!price || !area) return; // пропускаем неполные

    lots.push({
      id:    id || `afipark-${lots.length + 1}`,
      price,
      area,
      floor:  floorText ? Number(floorText) : null,
      rooms:  roomsText ? Number(roomsText) : null,
      url:    href ? new URL(href, site).toString() : `${site}/param/`,
      image:  img  ? new URL(img,  site).toString() : '',
      status: 'available',
    });
  });

  return lots;
}

/**
 * Загружает все лоты AFI Park через Bitrix ajax.php
 */
export async function fetchBitrixLots(site) {
  const allLots = [];
  let page = 1;
  const MAX_PAGES = 50;

  while (page <= MAX_PAGES) {
    const body = new URLSearchParams(FIXED_PARAMS);
    body.set('PAGEN_1', String(page));

    try {
      const { data } = await axios.post(AJAX_URL, body.toString(), {
        headers: HEADERS,
        timeout: 20000,
      });

      // Ответ может быть JSON { html: "..." } или чистым HTML
      const html = typeof data === 'object' ? (data.html || data.content || '') : data;

      if (!html || html.trim().length < 100) {
        console.log(`  AFI Park: пустой ответ на стр. ${page}, остановка`);
        break;
      }

      const lots = parseHtml(html, site);
      if (lots.length === 0) {
        console.log(`  AFI Park: нет лотов на стр. ${page}, остановка`);
        break;
      }

      console.log(`  AFI Park: стр. ${page} → ${lots.length} лотов (всего: ${allLots.length + lots.length})`);
      allLots.push(...lots);
      page++;

      // небольшая пауза между запросами
      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.error(`  AFI Park ошибка (стр. ${page}): ${err.message}`);
      break;
    }
  }

  console.log(`  AFI Park итого: ${allLots.length} лотов`);
  return allLots;
}
