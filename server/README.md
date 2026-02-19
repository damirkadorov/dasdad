# NFC Terminal Server

REST API сервер для обработки NFC платежей.

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env

# Запуск MongoDB (если локально)
# docker run -d -p 27017:27017 --name mongodb mongo:latest

# Создание тестовых данных
npm run seed

# Запуск сервера (режим разработки)
npm run dev

# Запуск сервера (production)
npm start
```

## Переменные окружения

- `MONGODB_URI` - Строка подключения к MongoDB
- `PORT` - Порт сервера (по умолчанию 3001)
- `API_KEY` - Секретный ключ для API
- `ALLOWED_ORIGINS` - Разрешенные CORS origins

## API Endpoints

### Карты
- `GET /api/cards` - Получить все карты
- `POST /api/cards` - Создать карту
- `GET /api/cards/:token` - Получить карту по токену
- `PATCH /api/cards/:token/status` - Обновить статус карты

### Платежи
- `POST /api/pay` - Обработать платеж
- `GET /api/pay/transactions/:token` - История транзакций
- `GET /api/pay/terminal/:id/stats` - Статистика терминала

### Служебные
- `GET /health` - Проверка здоровья сервера

## Безопасность

Все API endpoints требуют заголовок:
```
X-API-Key: your-api-key
```

Платежи также требуют:
```
X-Terminal-Id: terminal-id
```

## Разработка

```bash
# Установка nodemon для автоперезагрузки
npm install -g nodemon

# Запуск в режиме разработки
npm run dev
```

## Production

```bash
# Установка PM2
npm install -g pm2

# Запуск с PM2
pm2 start src/index.js --name nfc-terminal-server

# Мониторинг
pm2 monit

# Логи
pm2 logs nfc-terminal-server
```

Подробная документация в `/NFC_TERMINAL_README.md`
