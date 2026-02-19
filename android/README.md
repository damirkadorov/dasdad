# NFC Terminal Android App

Android приложение для NFC терминала оплаты.

## Требования

- Android Studio Arctic Fox или новее
- Android SDK 24+ (Android 7.0)
- Kotlin 1.9+
- Устройство с NFC

## Сборка

1. Откройте проект в Android Studio
2. Синхронизируйте Gradle
3. Соберите проект: Build → Make Project
4. Запустите на устройстве или эмуляторе

## Сборка APK

```bash
# Debug
./gradlew assembleDebug

# Release
./gradlew assembleRelease
```

APK находится в `app/build/outputs/apk/`

## Установка

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Настройка

При первом запуске:

1. Нажмите "⚙️ Настройки"
2. Введите API ключ из сервера
3. Введите URL сервера:
   - Для эмулятора: `http://10.0.2.2:3001`
   - Для реального устройства: `http://YOUR_IP:3001`
4. Сохраните настройки

## Использование

1. Введите сумму платежа (в рублях)
2. Нажмите "Оплатить"
3. Приложите NFC карту с записанным токеном
4. Дождитесь подтверждения

## Разрешения

- `android.permission.NFC` - Чтение NFC меток
- `android.permission.INTERNET` - Связь с сервером

## Структура

- `MainActivity.kt` - Главный экран терминала
- `ApiService.kt` - HTTP клиент для API
- `SecureStorage.kt` - Безопасное хранение настроек
- `Models.kt` - Модели данных

## Логи

Просмотр логов:
```bash
adb logcat | grep NFC
```

Подробная документация в `/NFC_TERMINAL_README.md`
