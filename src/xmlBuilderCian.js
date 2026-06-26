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

    obj.ele('Category').txt('newBuildingFlatSale');
    obj.ele('ExternalId').txt(String(lot.internalId));

    if (lot.description) {
      obj.ele('Description').txt(lot.description);
    }

    obj.ele('Status').txt(lot.status);

    if (lot.url) {
      obj.ele('Url').txt(lot.url);
    }

    if (lot.lat && lot.lng) {
      const coords = obj.ele('Coordinates');
      coords.ele('Lat').txt(String(lot.lat));
      coords.ele('Lng').txt(String(lot.lng));
    }

    if (lot.rooms !== null && lot.rooms !== undefined) {
      obj.ele('FlatRoomsCount').txt(String(lot.rooms));
    }

    obj.ele('TotalArea').txt(String(lot.area));

    if (lot.livingArea) {
      obj.ele('LivingArea').txt(String(lot.livingArea));
    }

    if (lot.kitchenArea) {
      obj.ele('KitchenArea').txt(String(lot.kitchenArea));
    }

    if (lot.floor !== null && lot.floor !== undefined) {
      obj.ele('FloorNumber').txt(String(lot.floor));
    }

    if (lot.ceilingHeight) {
      obj.ele('CeilingHeight').txt(String(lot.ceilingHeight));
    }

    obj.ele('HasBalcony').txt(lot.hasBalcony ? 'true' : 'false');

    if (lot.finishing) {
      obj.ele('FinishingType').txt(lot.finishing);
    }

    if (lot.mortgagePayment) {
      obj.ele('MortgagePayment').txt(String(lot.mortgagePayment));
    }

    // Блок ЖК — Id обязателен для внешних систем
    const jk = obj.ele('JKSchema');
    if (lot.projectId) {
      jk.ele('Id').txt(String(lot.projectId));
    }
    jk.ele('Name').txt(lot.projectName || '');

    const house = jk.ele('House');
    house.ele('Name').txt(lot.building || '');

    const flat = house.ele('Flat');
    if (lot.lotNumber) flat.ele('FlatNumber').txt(String(lot.lotNumber));
    if (lot.section)   flat.ele('SectionNumber').txt(String(lot.section));

    const building = obj.ele('Building');
    building.ele('Name').txt(lot.building || '');
    if (lot.completion) {
      building.ele('Deadline').txt(lot.completion);
    }

    if (lot.planImage) {
      const layout = obj.ele('LayoutPhoto');
      layout.ele('FullUrl').txt(lot.planImage);
      layout.ele('PhotoType').txt('realtyObjectLayoutPhoto');
    }

    if (lot.image) {
      const photos = obj.ele('Photos');
      const schema = photos.ele('PhotoSchema');
      schema.ele('FullUrl').txt(lot.image);
      schema.ele('PhotoType').txt('realtyObjectPhoto');
    }

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
