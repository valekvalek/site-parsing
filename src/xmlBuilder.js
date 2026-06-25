import { create } from 'xmlbuilder2';

/**
 * Генерирует Yandex Realty XML-фид
 * @param {Array} lots — нормализованные лоты
 * @returns {string} — XML строка
 */
export function buildYandexXml(lots) {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('realty-feed', {
    xmlns: 'http://webmaster.yandex.ru/schemas/feed/realty/2010-06'
  });

  for (const lot of lots) {
    const offer = root.ele('offer', { 'internal-id': lot.internalId });

    offer.ele('type').txt('продажа');
    offer.ele('category').txt('квартира');
    offer.ele('url').txt(lot.url);

    // Картинки
    if (lot.image) offer.ele('image').txt(lot.image);
    if (lot.planImage && lot.planImage !== lot.image) {
      offer.ele('image').txt(lot.planImage);
    }

    // Цена
    const price = offer.ele('price');
    price.ele('value').txt(String(lot.price));
    price.ele('currency').txt('RUR');

    // Площади
    const area = offer.ele('area');
    area.ele('value').txt(String(lot.area));
    area.ele('unit').txt('кв. м');

    if (lot.livingArea) {
      const la = offer.ele('living-space');
      la.ele('value').txt(String(lot.livingArea));
      la.ele('unit').txt('кв. м');
    }

    if (lot.kitchenArea) {
      const ka = offer.ele('kitchen-space');
      ka.ele('value').txt(String(lot.kitchenArea));
      ka.ele('unit').txt('кв. м');
    }

    // Комнаты и этаж
    if (lot.rooms !== null) offer.ele('rooms').txt(String(lot.rooms));
    if (lot.floor !== null) offer.ele('floor').txt(String(lot.floor));

    // Высота потолков
    if (lot.ceilingHeight) {
      offer.ele('ceiling-height').txt(String(lot.ceilingHeight));
    }

    // Описание
    offer.ele('description').txt(lot.description);

    // Застройщик
    offer
      .ele('sales-agent')
      .ele('organization')
      .txt(lot.projectName);
  }

  return root.end({ prettyPrint: true });
}
