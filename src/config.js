export const sources = [
  {
    api: 'https://legendamarusino.ru/api/realty-filter/custom/real-estates',
    site: 'https://legendamarusino.ru',
    project: 'ЖК "Легенда Марусино"',
    slug: 'legendamarusino',
    projectId: 'a5f9b6b9-037d-4cd8-981c-cbd55e93a5c0'
  },
  {
    api: 'https://legendakorenevo.ru/api/realty-filter/custom/real-estates',
    site: 'https://legendakorenevo.ru',
    project: 'ЖК "Легенда Коренёво"',
    slug: 'legendakorenevo',
    projectId: '61b193a5-aa22-4f3a-bf22-216ebc5648b1'
  }
];

// Статусы лотов, которые НЕ включаем в фид
export const EXCLUDED_STATUSES = ['sold'];

// Сколько лотов запрашивать за один запрос
export const PAGE_LIMIT = 100;

// Папка для результатов
export const OUTPUT_DIR = './output';
