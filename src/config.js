export const sources = [
  {
    type: 'json',
    api: 'https://legendamarusino.ru/api/realty-filter/custom/real-estates',
    site: 'https://legendamarusino.ru',
    project: 'ЖК "Легенда Марусино"',
    slug: 'legendamarusino',
    projectId: 'a5f9b6b9-037d-4cd8-981c-cbd55e93a5c0'
  },
  {
    type: 'json',
    api: 'https://legendakorenevo.ru/api/realty-filter/custom/real-estates',
    site: 'https://legendakorenevo.ru',
    project: 'ЖК "Легенда Коренёво"',
    slug: 'legendakorenevo',
    projectId: '61b193a5-aa22-4f3a-bf22-216ebc5648b1'
  },
  {
    type: 'bitrix',
    site: 'https://afi-park.ru',
    project: 'ЖК "AFI Park"',
    slug: 'afipark'
  }
];

export const EXCLUDED_STATUSES = ['sold'];
export const PAGE_LIMIT = 100;
export const OUTPUT_DIR = './output';
