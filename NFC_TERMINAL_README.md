# 💳 NFC Terminal System для Тестового Банка

Полноценная система NFC-терминала, состоящая из:
- **Сервер:** Node.js + Express + MongoDB
- **Клиент:** Android-приложение на Kotlin с поддержкой NFC

---

## 📋 Содержание

- [Обзор системы](#обзор-системы)
- [Архитектура](#архитектура)
- [Установка и настройка сервера](#установка-и-настройка-сервера)
- [Сборка Android-приложения](#сборка-android-приложения)
- [Работа с NFC метками](#работа-с-nfc-метками)
- [API документация](#api-документация)
- [Примеры использования](#примеры-использования)
- [Тестирование](#тестирование)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Обзор системы

Система представляет собой NFC-терминал для обработки бесконтактных платежей с использованием токенов NFC-карт.

### Основные возможности:

✅ Хранение карт с уникальными токенами в MongoDB  
✅ Обработка платежей через NFC  
✅ История транзакций  
✅ Проверка баланса и активности карты  
✅ API для интеграции с Android-терминалом  
✅ Безопасность: API ключи, валидация, rate limiting  

---

## 🏗️ Архитектура

### Принцип работы:

```
┌─────────────┐      NFC      ┌──────────────┐
│  NFC Метка  │  ──────────>  │   Android    │
│  (Токен)    │               │   Terminal   │
└─────────────┘               └──────┬───────┘
                                     │ HTTP API
                                     │ (token + amount)
                                     ▼
                              ┌──────────────┐
                              │   Node.js    │
                              │   Server     │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   MongoDB    │
                              │  (Cards +    │
                              │ Transactions)│
                              └──────────────┘
```

### Структура данных:

**Cards Collection:**
```json
{
  "token": "a1b2c3d4...",     // 32-символьный hex токен
  "owner": "Иван Иванов",     // Владелец карты
  "balance": 50000,           // Баланс в копейках (500 руб)
  "active": true,             // Активна ли карта
  "createdAt": "2024-01-01"
}
```

**Transactions Collection:**
```json
{
  "cardToken": "a1b2c3d4...",
  "amount": 5000,              // Сумма в копейках (50 руб)
  "date": "2024-01-01T12:00:00",
  "terminalId": "terminal-001",
  "status": "success"          // success | failed | declined
}
```

---

## 🚀 Установка и настройка сервера

### Требования:

- Node.js 18+ 
- MongoDB 6.0+ (локально или MongoDB Atlas)
- npm или yarn

### Шаг 1: Установка зависимостей

```bash
cd server
npm install
```

### Шаг 2: Настройка MongoDB

#### Вариант A: Локальная установка

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Запуск
mongod
```

#### Вариант B: MongoDB Atlas (облако)

1. Создайте аккаунт на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте новый кластер (бесплатный tier M0)
3. Получите строку подключения:
   - Нажмите "Connect" → "Connect your application"
   - Скопируйте строку подключения
   - Замените `<password>` на ваш пароль

#### Вариант C: Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Шаг 3: Конфигурация .env

Создайте файл `.env` в папке `server/`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/nfc-terminal
# или для Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nfc-terminal

# Сервер
PORT=3001
NODE_ENV=development

# Безопасность (ОБЯЗАТЕЛЬНО измените в production!)
API_KEY=your-secret-api-key-change-this-in-production

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Шаг 4: Создание тестовых данных

```bash
npm run seed
```

Скрипт создаст 5 тестовых карт с разными балансами. **Сохраните токены карт!**

### Шаг 5: Запуск сервера

```bash
# Режим разработки (с автоперезагрузкой)
npm run dev

# Режим production
npm start
```

Сервер запустится на `http://localhost:3001`

### Проверка работы сервера:

```bash
curl http://localhost:3001/health
```

Ожидаемый ответ:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 📱 Сборка Android-приложения

### Требования:

- Android Studio Arctic Fox или новее
- Android SDK 24+ (Android 7.0)
- Kotlin 1.9+
- Устройство с NFC или эмулятор

### Шаг 1: Открыть проект

1. Запустите Android Studio
2. File → Open → выберите папку `/android`
3. Дождитесь синхронизации Gradle

### Шаг 2: Настройка Server URL

По умолчанию приложение использует:
- `http://10.0.2.2:3001` для эмулятора Android
- Для реального устройства укажите IP адрес вашего компьютера

**Найти IP адрес:**

```bash
# Linux/macOS
ifconfig | grep "inet "

# Windows
ipconfig
```

### Шаг 3: Сборка APK

```bash
# Debug версия
./gradlew assembleDebug

# Release версия (подписанная)
./gradlew assembleRelease
```

APK будет находиться в `app/build/outputs/apk/`

### Шаг 4: Установка на устройство

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Шаг 5: Настройка приложения

1. Запустите приложение
2. Нажмите "⚙️ Настройки"
3. Введите:
   - **API ключ:** ваш ключ из `.env` сервера
   - **URL сервера:** `http://YOUR_IP:3001`
4. Нажмите "Сохранить"

---

## 🏷️ Работа с NFC метками

### Подходящие NFC метки:

- **NTAG213/215/216** (рекомендуется)
- **MIFARE Classic 1K**
- **MIFARE Ultralight**

Купить можно на AliExpress, Amazon или в местных магазинах электроники.

### Запись токена на NFC метку

#### Способ 1: NFC Tools (Android/iOS)

1. Установите [NFC Tools](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc) из Google Play
2. Запустите приложение
3. Перейдите на вкладку **"WRITE"**
4. Нажмите **"Add a record"**
5. Выберите **"Text"**
6. Вставьте токен карты (32-символьный hex, например: `a1b2c3d4e5f6...`)
7. Нажмите **"OK"**
8. Нажмите **"Write"** и приложите NFC метку

#### Способ 2: NXP TagWriter (Android)

1. Установите NXP TagWriter
2. Выберите **"Write tags"**
3. **"New dataset"** → **"Text"**
4. Введите токен
5. **"Write"**

#### Способ 3: Программная запись (для разработчиков)

Можно создать отдельное Android-приложение для записи токенов:

```kotlin
val message = NdefMessage(
    arrayOf(
        NdefRecord.createTextRecord("en", token)
    )
)

ndef.connect()
ndef.writeNdefMessage(message)
ndef.close()
```

### Формат токена:

- **Длина:** 32 символа
- **Формат:** Hexadecimal (0-9, a-f)
- **Пример:** `a1b2c3d4e5f678901234567890abcdef`

### Получение токенов карт:

После запуска `npm run seed` токены будут выведены в консоль. Также можно получить через API:

```bash
curl -X GET http://localhost:3001/api/cards \
  -H "X-API-Key: your-api-key"
```

---

## 📡 API документация

### Базовый URL
```
http://localhost:3001/api
```

### Аутентификация

Все запросы требуют заголовок:
```
X-API-Key: your-api-key
```

---

### 1. Создать новую карту

**POST** `/api/cards`

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Body:**
```json
{
  "owner": "Иван Иванов",
  "balance": 50000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Карта успешно создана",
  "data": {
    "token": "a1b2c3d4e5f678901234567890abcdef",
    "owner": "Иван Иванов",
    "balance": 50000,
    "active": true,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 2. Получить все карты

**GET** `/api/cards`

**Headers:**
```
X-API-Key: your-api-key
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "token": "a1b2c3d4...",
      "owner": "Иван Иванов",
      "balance": 50000,
      "active": true,
      "createdAt": "2024-01-01"
    }
  ]
}
```

---

### 3. Получить карту по токену

**GET** `/api/cards/:token`

**Headers:**
```
X-API-Key: your-api-key
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "owner": "Иван Иванов",
    "balance": 50000,
    "active": true,
    "createdAt": "2024-01-01"
  }
}
```

---

### 4. Обработать платеж

**POST** `/api/pay`

**Headers:**
```
X-API-Key: your-api-key
X-Terminal-Id: terminal-001
Content-Type: application/json
```

**Body:**
```json
{
  "token": "a1b2c3d4e5f678901234567890abcdef",
  "amount": 5000,
  "terminalId": "terminal-001"
}
```

**Response (200) - Успех:**
```json
{
  "success": true,
  "message": "Платеж успешно обработан",
  "data": {
    "transactionId": "...",
    "amount": 5000,
    "newBalance": 45000,
    "date": "2024-01-01T12:00:00.000Z"
  }
}
```

**Response (400) - Недостаточно средств:**
```json
{
  "success": false,
  "error": "Недостаточно средств",
  "currentBalance": 1000,
  "required": 5000
}
```

**Response (403) - Карта заблокирована:**
```json
{
  "success": false,
  "error": "Карта заблокирована"
}
```

**Response (404) - Карта не найдена:**
```json
{
  "success": false,
  "error": "Карта не найдена"
}
```

---

### 5. Получить транзакции карты

**GET** `/api/pay/transactions/:token`

**Headers:**
```
X-API-Key: your-api-key
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "cardToken": "a1b2c3d4...",
      "amount": 5000,
      "date": "2024-01-01T12:00:00.000Z",
      "terminalId": "terminal-001",
      "status": "success"
    }
  ]
}
```

---

### 6. Статистика терминала

**GET** `/api/pay/terminal/:terminalId/stats`

**Headers:**
```
X-API-Key: your-api-key
```

**Response (200):**
```json
{
  "success": true,
  "terminalId": "terminal-001",
  "data": [
    {
      "_id": "success",
      "count": 150,
      "totalAmount": 750000
    },
    {
      "_id": "declined",
      "count": 5,
      "totalAmount": 25000
    }
  ]
}
```

---

### 7. Обновить статус карты

**PATCH** `/api/cards/:token/status`

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Body:**
```json
{
  "active": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Карта деактивирована",
  "data": {
    "token": "a1b2c3d4...",
    "owner": "Иван Иванов",
    "balance": 45000,
    "active": false
  }
}
```

---

## 💡 Примеры использования

### Создание карты

```bash
curl -X POST http://localhost:3001/api/cards \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-change-this-in-production" \
  -d '{
    "owner": "Тестовый Пользователь",
    "balance": 100000
  }'
```

### Оплата

```bash
curl -X POST http://localhost:3001/api/pay \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-change-this-in-production" \
  -H "X-Terminal-Id: terminal-001" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "amount": 5000,
    "terminalId": "terminal-001"
  }'
```

### Проверка баланса

```bash
curl -X GET http://localhost:3001/api/cards/YOUR_TOKEN_HERE \
  -H "X-API-Key: your-secret-api-key-change-this-in-production"
```

---

## 🧪 Тестирование

### Сценарии тестирования:

#### 1. Успешный платеж

1. Создайте тестовую карту с балансом 10000 (100 руб)
2. Запишите токен на NFC метку
3. В Android-приложении введите сумму 50 руб
4. Приложите NFC метку
5. Проверьте, что платеж прошел успешно

#### 2. Недостаточно средств

1. Используйте карту с балансом 1000 (10 руб)
2. Попробуйте оплатить 50 руб
3. Проверьте ошибку "Недостаточно средств"

#### 3. Заблокированная карта

1. Заблокируйте карту через API:
```bash
curl -X PATCH http://localhost:3001/api/cards/TOKEN/status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"active": false}'
```
2. Попробуйте оплатить
3. Проверьте ошибку "Карта заблокирована"

#### 4. Неверный токен

1. Используйте NFC метку с неправильным токеном
2. Проверьте ошибку "Карта не найдена"

### Автоматическое тестирование API

Создайте файл `test-api.sh`:

```bash
#!/bin/bash

API_KEY="your-secret-api-key-change-this-in-production"
BASE_URL="http://localhost:3001"

echo "🧪 Тестирование API..."

# Тест 1: Health check
echo "\n1. Health check..."
curl -s $BASE_URL/health | jq

# Тест 2: Создание карты
echo "\n2. Создание карты..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/cards \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"owner": "Test User", "balance": 50000}')

echo $RESPONSE | jq
TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# Тест 3: Получение карты
echo "\n3. Получение карты..."
curl -s $BASE_URL/api/cards/$TOKEN \
  -H "X-API-Key: $API_KEY" | jq

# Тест 4: Платеж
echo "\n4. Платеж..."
curl -s -X POST $BASE_URL/api/pay \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Terminal-Id: test-terminal" \
  -d "{\"token\": \"$TOKEN\", \"amount\": 5000, \"terminalId\": \"test-terminal\"}" | jq

echo "\n✅ Тестирование завершено"
```

Запуск:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 🔧 Troubleshooting

### Проблема: MongoDB не запускается

**Решение:**
```bash
# Проверить статус
sudo systemctl status mongodb

# Перезапустить
sudo systemctl restart mongodb

# Проверить логи
sudo tail -f /var/log/mongodb/mongod.log
```

### Проблема: Ошибка подключения к серверу из Android

**Решения:**

1. **Для эмулятора:** используйте `http://10.0.2.2:3001`
2. **Для реального устройства:** 
   - Убедитесь, что телефон и компьютер в одной сети
   - Используйте IP адрес компьютера (не localhost)
   - Проверьте firewall

3. **Проверка подключения:**
```bash
# На Android устройстве через браузер
http://YOUR_IP:3001/health
```

### Проблема: NFC не работает

**Решения:**

1. Проверьте, что NFC включен в настройках
2. Убедитесь, что NFC метка правильно записана
3. Проверьте формат токена (32 hex символа)
4. Попробуйте другую NFC метку

### Проблема: Ошибка 401 (Unauthorized)

**Решение:**
- Проверьте API ключ в настройках приложения
- Убедитесь, что он совпадает с ключом в `.env` сервера

### Проблема: Ошибка CORS

**Решение:**
Добавьте URL Android-приложения в `ALLOWED_ORIGINS` в `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://10.0.2.2:3001
```

### Проблема: Gradle sync failed

**Решение:**
```bash
# Очистить кэш
./gradlew clean

# Обновить Gradle wrapper
./gradlew wrapper --gradle-version 8.2
```

---

## 🔒 Безопасность

### Рекомендации для production:

1. **Измените API ключ** на случайную строку длиной 64+ символа
2. **Используйте HTTPS** для API сервера
3. **Добавьте SSL/TLS** сертификаты
4. **Ограничьте CORS** только доверенными источниками
5. **Используйте environment variables** для секретов
6. **Включите логирование** всех транзакций
7. **Настройте мониторинг** (например, PM2 для Node.js)
8. **Регулярно обновляйте** зависимости

### Генерация безопасного API ключа:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 Мониторинг

### PM2 (для production):

```bash
# Установка
npm install -g pm2

# Запуск
pm2 start src/index.js --name nfc-terminal-server

# Мониторинг
pm2 monit

# Логи
pm2 logs nfc-terminal-server

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

---

## 📝 Структура проекта

```
dasdad/
├── server/                    # Node.js сервер
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js         # Подключение MongoDB
│   │   ├── models/
│   │   │   ├── Card.js       # Модель карты
│   │   │   └── Transaction.js # Модель транзакции
│   │   ├── controllers/
│   │   │   ├── cardController.js
│   │   │   └── paymentController.js
│   │   ├── routes/
│   │   │   ├── cardRoutes.js
│   │   │   └── paymentRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   ├── tokenGenerator.js
│   │   │   └── seed.js       # Создание тестовых данных
│   │   └── index.js          # Точка входа
│   ├── package.json
│   └── .env.example
│
├── android/                   # Android приложение
│   ├── app/
│   │   ├── build.gradle.kts
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/testbank/terminal/
│   │       │   ├── MainActivity.kt
│   │       │   ├── api/
│   │       │   │   └── ApiService.kt
│   │       │   ├── models/
│   │       │   │   └── Models.kt
│   │       │   └── utils/
│   │       │       └── SecureStorage.kt
│   │       └── res/
│   │           ├── layout/
│   │           │   ├── activity_main.xml
│   │           │   └── dialog_settings.xml
│   │           └── values/
│   │               └── strings.xml
│   └── build.gradle.kts
│
└── NFC_TERMINAL_README.md     # Эта документация
```

---

## 🎓 Дополнительные материалы

### Документация:

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Android NFC Guide](https://developer.android.com/guide/topics/connectivity/nfc)
- [Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-overview.html)

### Полезные ссылки:

- [NFC Forum](https://nfc-forum.org/)
- [NDEF Specification](https://nfc-forum.org/our-work/specification-releases/)

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте раздел [Troubleshooting](#troubleshooting)
2. Проверьте логи сервера: `pm2 logs` или консоль
3. Проверьте логи Android: `adb logcat`
4. Создайте issue в репозитории

---

## ⚠️ Disclaimer

Это **демонстрационный проект** для образовательных целей. 

- Не используйте в production без дополнительных мер безопасности
- Все данные тестовые
- Нет реальной обработки платежей

---

## 📄 Лицензия

MIT License

---

**🚀 Система готова к использованию!**

Для быстрого старта:
1. `cd server && npm install && npm run seed && npm run dev`
2. Откройте Android Studio и соберите приложение
3. Запишите токен на NFC метку
4. Наслаждайтесь бесконтактными платежами! 💳
