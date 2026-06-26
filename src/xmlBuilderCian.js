import { create } from 'xmlbuilder2';

/**
 * Генерирует CIAN-like XML фид для внутреннего использования.
 * Структура основана на формате ЦИАН, но без обязательных полей
 * (телефон, адрес, CplModeration) — только то, что есть в real-estates.
 *
 * @param {Array} lots — нормализованные лоты
 * @returns {string} — XML строка
 */
export function buildCianXml(lots) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('feed');

  root.ele('feed_version').txt('2');
  root.ele('generated').txt(new Date().toISOString());

  for (const lot of lots) {
    const obj = root.ele('object');

    // Категория
    obj.ele('Category').txt('newBuildingFlatSale');

    // Внешний ID квартиры
    obj.ele('ExternalId').txt(String(lot.internalId));

    // Описание
    if (lot.description) {
      obj.ele('Description').txt(lot.description);
    }

    // Статус (available / reserved / sold)
    obj.ele('Status').txt(lot.status);

    // URL страницы квартиры
    if (lot.url) {
      obj.ele('Url').txt(lot.url);
    }

    // Координаты (если пришли из API)
    if (lot.lat && lot.lng) {
      const coords = obj.ele('Coordinates');
      coords.ele('Lat').txt(String(lot.lat));
      coords.ele('Lng').txt(String(lot.lng));
    }

    // Количество комнат (0 = студия)
    if (lot.rooms !== null && lot.rooms !== undefined) {
      obj.ele('FlatRoomsCount').txt(String(lot.rooms));
    }

    // Площади
    obj.ele('TotalArea').txt(String(lot.area));

    if (lot.livingArea) {
      obj.ele('LivingArea').txt(String(lot.livingArea));
    }

    if (lot.kitchenArea) {
      obj.ele('KitchenArea').txt(String(lot.kitchenArea));
    }

    // Этаж
    if (lot.floor !== null && lot.floor !== undefined) {
      obj.ele('FloorNumber').txt(String(lot.floor));
    }

    // Высота потолков
    if (lot.ceilingHeight) {
      obj.ele('CeilingHeight').txt(String(lot.ceilingHeight));
    }

    // Балкон
    obj.ele('HasBalcony').txt(lot.hasBalcony ? 'true' : 'false');

    // Отделка
    if (lot.finishing) {
      obj.ele('FinishingType').txt(lot.finishing);
    }

    // Ипотечный платёж
    if (lot.mortgagePayment) {
      obj.ele('MortgagePayment').txt(String(lot.mortgagePayment));
    }

    // Блок ЖК / корпуса / квартиры
    const jk = obj.ele('JKSchema');
    jk.ele('Name').txt(lot.projectName || '');

    const house = jk.ele('House');
    house.ele('Name').txt(lot.building || '');

    const flat = house.ele('Flat');
    if (lot.lotNumber) flat.ele('FlatNumber').txt(String(lot.lotNumber));
    if (lot.section) flat.ele('SectionNumber').txt(String(lot.section));

    // Здание
    const building = obj.ele('Building');
    building.ele('Name').txt(lot.building || '');
    if (lot.completion) {
      building.ele('Deadline').txt(lot.completion);
    }

    // Планировка (план квартиры)
    if (lot.planImage) {
      const layout = obj.ele('LayoutPhoto');
      layout.ele('FullUrl').txt(lot.planImage);
      layout.ele('PhotoType').txt('realtyObjectLayoutPhoto');
    }

    // Фотографии
    if (lot.image) {
      const photos = obj.ele('Photos');
      const schema = photos.ele('PhotoSchema');
      schema.ele('FullUrl').txt(lot.image);
      schema.ele('PhotoType').txt('realtyObjectPhoto');
    }

    // Условия продажи
    const bargain = obj.ele('BargainTerms');
    bargain.ele('Price').txt(String(lot.price));
    bargain.ele('Currency').txt('rur');

    if (lot.oldPrice) {
      bargain.ele('OldPrice').txt(String(lot.oldPrice));
    }

    if (lot.mortgagePayment) {
      bargain.ele('MortgageAllowed').txt('true');
    }
  }

  return root.end({ prettyPrint: true });
}
