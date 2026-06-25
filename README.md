# site-parsing

Парсер квартир **ЖК Легенда Марусино** и **ЖК Легенда Коренёво** с генерацией единого Yandex Realty XML-фида.

## Установка

```bash
npm install
```

## Запуск

```bash
npm start
```

После выполнения в папке `output/` появятся:
- `feed.xml` — готовый Yandex Realty фид
- `feed.json` — исходные данные в JSON (для отладки)

## Структура проекта

```
src/
  index.js          — точка входа, запускает парсинг и сборку XML
  fetcher.js        — загрузка данных из API
  normalizer.js     — нормализация полей квартиры
  xmlBuilder.js     — генерация Yandex Realty XML
output/             — сгенерированные файлы (gitignored)
```

## Источники данных

| ЖК | API |
|---|---|
| Легенда Марусино | `https://legendamarusino.ru/api/realty-filter/custom/real-estates` |
| Легенда Коренёво | `https://legendakorenevo.ru/api/realty-filter/custom/real-estates` |

## Формат фида

XML соответствует схеме [Yandex Realty Feed](https://yandex.ru/support/realty/requirements/requirements-feed.html).
