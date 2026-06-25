import axios from 'axios';
import { PAGE_LIMIT } from './config.js';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ru-RU,ru;q=0.9',
  'Content-Type': 'application/json'
};

/**
 * Формирует тело POST-запроса для получения всех доступных лотов.
 * Фильтр только по status=free — без ограничений по комнатам и корпусам.
 * @param {string} projectId
 * @param {number} offset
 * @returns {Object}
 */
function buildPayload(projectId, offset) {
  return {
    project_id: projectId,
    filters: [
      {
        id: 'status',
        type: 'system',
        filter_type: 'select',
        value: ['free']
      }
    ],
    limit: PAGE_LIMIT,
    offset,
    order_by: ['price']
  };
}

/**
 * Загружает ВСЕ лоты из API постранично через offset.
 * @param {string} apiUrl
 * @param {string} projectId
 * @returns {Promise<Array>}
 */
export async function fetchLots(apiUrl, projectId) {
  console.log(`Fetching: ${apiUrl}`);

  const allLots = [];
  let offset = 0;

  while (true) {
    try {
      const payload = buildPayload(projectId, offset);
      const { data } = await axios.post(apiUrl, payload, {
        headers: HEADERS,
        timeout: 15000
      });

      // API может вернуть массив напрямую или { items: [...] }
      const page = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];

      if (page.length === 0) break;  // Больше лотов нет

      allLots.push(...page);
      console.log(`  -> offset ${offset}: получено ${page.length} лотов (всего: ${allLots.length})`);

      if (page.length < PAGE_LIMIT) break;  // Последняя страница
      offset += PAGE_LIMIT;

    } catch (err) {
      console.error(`  -> Ошибка загрузки ${apiUrl} (offset ${offset}): ${err.message}`);
      break;
    }
  }

  console.log(`  -> Итого лотов из ${apiUrl}: ${allLots.length}`);
  return allLots;
}
