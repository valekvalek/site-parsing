export const sources = [
  {
    api: 'https://legendamarusino.ru/api/realty-filter/custom/real-estates',
    site: 'https://legendamarusino.ru',
    project: 'ЖК "Легенда Марусино"'
  },
  {
    api: 'https://legendakorenevo.ru/api/realty-filter/custom/real-estates',
    site: 'https://legendakorenevo.ru',
    project: 'ЖК "Легенда Коренёво"'
  }
];

// Статусы лотов, которые НЕ включаем в фид
export const EXCLUDED_STATUSES = ['sold'];

// Папка для результатов
export const OUTPUT_DIR = './output';
