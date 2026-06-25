/**
 * Нормализация лотов AFI Park (уже парсинутых из HTML)
 */
export function normalizeBitrixLots(items, site, project) {
  return items.map((item, i) => ({
    internalId:     item.id || `afipark-${i}`,
    projectName:    project,
    url:            item.url || site,
    price:          item.price,
    oldPrice:       null,
    rooms:          item.rooms,
    area:           item.area,
    livingArea:     null,
    kitchenArea:    null,
    floor:          item.floor,
    section:        '',
    building:       '',
    status:         item.status || 'available',
    planImage:      item.image || '',
    image:          item.image || '',
    completion:     '',
    article:        '',
    lotNumber:      String(item.id || ''),
    ceilingHeight:  null,
    hasBalcony:     false,
    finishing:      'no',
    mortgagePayment: null,
    description:
      `${project}. ` +
      (item.rooms ? `${item.rooms}-комнатная квартира ` : '') +
      `${item.area} м²` +
      (item.floor ? `, этаж ${item.floor}` : '') + '.'
  }));
}
