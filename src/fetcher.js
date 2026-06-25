import axios from 'axios';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ru-RU,ru;q=0.9'
};

/**
 * Загружает массив квартир из API
 * @param {string} apiUrl
 * @returns {Promise<Array>}
 */
export async function fetchLots(apiUrl) {
  console.log(`Fetching: ${apiUrl}`);
  try {
    const { data } = await axios.get(apiUrl, {
      headers: HEADERS,
      timeout: 15000
    });
    const lots = Array.isArray(data) ? data : [];
    console.log(`  -> Получено лотов: ${lots.length}`);
    return lots;
  } catch (err) {
    console.error(`  -> Ошибка загрузки ${apiUrl}: ${err.message}`);
    return [];
  }
}
