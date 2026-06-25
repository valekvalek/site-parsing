export const sources = [
  {
    api: 'https://legendamarusino.ru/api/realty-filter/custom/real-estates',
    site: 'https://legendamarusino.ru',
    project: 'ЖК "Легенда Марусино"',
    projectId: 'a5f9b6b9-037d-4cd8-981c-cbd55e93a5c0'  // из Payload
  },
  {
    api: 'https://legendakorenevo.ru/api/realty-filter/custom/real-estates',
    site: 'https://legendakorenevo.ru',
    project: 'ЖК "Легенда Коренёво"',
    projectId: null  // заполните после проверки Payload у Коренёво
  }
];

// Статусы лотов, которые НЕ включаем в фид
export const EXCLUDED_STATUSES = ['sold'];

// Сколько лотов запрашивать за один запрос
export const PAGE_LIMIT = 100;

// Папка для результатов
export const OUTPUT_DIR = './output';
