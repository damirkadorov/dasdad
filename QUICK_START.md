# 🚀 Быстрый старт NFC Terminal System

Это краткое руководство для быстрого запуска системы. Для полной документации смотрите [NFC_TERMINAL_README.md](NFC_TERMINAL_README.md).

## ⚡ За 5 минут

### 1. Запуск сервера (терминал 1)

```bash
# Перейти в папку сервера
cd server

# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env

# Запустить MongoDB (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Создать тестовые данные
npm run seed

# Запустить сервер
npm run dev
```

Сервер запустится на `http://localhost:3001`

### 2. Открыть API Tester (терминал 2)

Откройте в браузере:
```
server/api-tester.html
```

Или запустите:
```bash
cd server
python3 -m http.server 8000
# Откройте http://localhost:8000/api-tester.html
```

### 3. Тестирование API

В API Tester:
1. Нажмите "Создать карту"
2. Скопируйте токен из ответа
3. Вставьте токен в поле "Токен карты"
4. Введите сумму платежа
5. Нажмите "Обработать платеж"

### 4. Android приложение

```bash
# Открыть в Android Studio
cd android
# File → Open → выбрать папку android

# Или собрать APK
./gradlew assembleDebug

# Установить на устройство
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 📝 Токены для тестирования

После `npm run seed` вы получите 5 тестовых карт с токенами. Запишите один токен на NFC метку:

1. Установите [NFC Tools](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc)
2. Write → Add record → Text → вставьте токен
3. Write → приложите NFC метку

## 🧪 Быстрое тестирование

Запустите автоматические тесты:
```bash
cd server
chmod +x test-api.sh
./test-api.sh
```

## ✅ Проверка работы

1. ✅ Сервер запущен: `curl http://localhost:3001/health`
2. ✅ API работает: откройте `api-tester.html`
3. ✅ Android собран: APK в `android/app/build/outputs/apk/`
4. ✅ Тесты пройдены: `./test-api.sh` все зеленое

## 📚 Документация

- **Полная документация:** [NFC_TERMINAL_README.md](NFC_TERMINAL_README.md)
- **Сервер README:** [server/README.md](server/README.md)
- **Android README:** [android/README.md](android/README.md)

## 🆘 Проблемы?

1. **MongoDB не запускается:** Проверьте Docker или используйте MongoDB Atlas
2. **Android не собирается:** Обновите Android Studio и Gradle
3. **API возвращает 401:** Проверьте API ключ в настройках

Полный раздел Troubleshooting в [NFC_TERMINAL_README.md](NFC_TERMINAL_README.md#troubleshooting)

## 🎯 Что дальше?

1. Изучите [API документацию](NFC_TERMINAL_README.md#api-документация)
2. Создайте свои карты через API
3. Запишите токены на NFC метки
4. Протестируйте платежи с Android приложением
5. Настройте production окружение

---

**🚀 Готово! Наслаждайтесь бесконтактными платежами!** 💳
