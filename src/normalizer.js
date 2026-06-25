import { EXCLUDED_STATUSES } from './config.js';

/**
 * Строит абсолютный URL к медиафайлу
 */
function absoluteUrl(site, path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return new URL(path, site).toString();
}

/**
 * Нормализует статус лота
 */
function normalizeStatus(status) {
  if (!status) return 'available';
  const map = {
    free: 'available',
    booked: 'reserved',
    reserved: 'reserved',
    sold: 'sold'
  };
  return map[status] || status;
}

/**
 * Нормализует один объект квартиры из API
 * @param {Object} item — сырой объект из API
 * @param {string} site — базовый URL сайта (для формирования ссылок)
 * @param {string} fallbackProject — название ЖК если нет в данных
 * @returns {Object|null} — нормализованный объект или null если нужно пропустить
 */
export function normalizeLot(item, site, fallbackProject) {
  const status = normalizeStatus(item.status);

  // Пропускаем проданные и лоты без цены/площади
  if (EXCLUDED_STATUSES.includes(status)) return null;
  if (!item.price || !item.total_area) return null;
  if (!item.slug) return null;

  const rooms = item.rooms ?? null;
  const roomsTitle = rooms === 0 ? 'Студия' : `${rooms}-комнатная квартира`;

  const planImage = absoluteUrl(site, item.plan);
  const firstImage =
    item.images?.length ? absoluteUrl(site, item.images[0]) : planImage;

  return {
    internalId: item.id,
    projectName: item.project_name || fallbackProject,
    url: `${site}/flats/${item.slug}`,
    price: item.price,
    oldPrice: item.old_price || null,
    rooms,
    area: item.total_area,
    livingArea: item.living_area || null,
    kitchenArea: item.kitchen_area || null,
    floor: item.floor_number ? Number(item.floor_number) : null,
    section: item.section_number || '',
    building: item.building_number || '',
    status,
    planImage,
    image: firstImage,
    completion: item.completion_title || '',
    article: item.article || '',
    lotNumber: item.number || String(item.int_number || ''),
    ceilingHeight: item.ceiling_height || null,
    hasBalcony: item.has_balcony || false,
    finishing: item.finishing_type || 'no',
    mortgagePayment: item.mortgage_payment || null,
    description:
      `${item.project_name || fallbackProject}. ` +
      `${roomsTitle} ${item.total_area} м², ` +
      `этаж ${item.floor_number}, ` +
      `секция ${item.section_number}, ` +
      `корпус ${item.building_number}. ` +
      `Срок сдачи: ${item.completion_title || 'уточняйте'}.`
  };
}

/**
 * Нормализует массив лотов из одного источника и фильтрует null
 */
export function normalizeAll(items, site, fallbackProject) {
  return items
    .map(item => normalizeLot(item, site, fallbackProject))
    .filter(Boolean);
}
