# Lingoung Android + NFC POS

The Capacitor Android app lives in `mobile/android` and opens the production Next.js application from Vercel. Package ID: `com.lingoung.bank`.

## What is implemented

- Capacitor 8 Android shell.
- Native NFC reader mode for Lingoung Business POS.
- Android Host Card Emulation (HCE) for a customer's Lingoung phone.
- One-time server authorizations that expire after 90 seconds.
- Customer-defined maximum amount and currency.
- Atomic token claiming to prevent replay.
- Personal-account debit and business-account settlement with transaction records.

This is a **closed-loop Lingoung payment network**. It moves balances held inside Lingoung. It is not certified EMV acquiring and cannot charge arbitrary Visa/Mastercard cards. Accepting external bank cards requires an acquiring processor, PCI DSS controls, EMV certification, and the relevant card-scheme agreements.

## Build requirements

- Android Studio (current stable)
- Android SDK 36
- JDK 17 or 21 (JDK 25 is currently incompatible with the generated Gradle build)
- NFC-capable Android device, API 26+

## Setup

```bash
npm install
npm run android:prepare
npm run android:sync
npm run android:open
```

`npm install` now restores the Gradle wrapper automatically. If Android Studio
was opened before running it, close the project, run the commands above, and
open `mobile/android` again.

## Fixing Gradle sync

In Android Studio open **Settings → Build, Execution, Deployment → Build Tools
→ Gradle** and set **Gradle JDK** to **Embedded JDK 21**. Do not use JDK 25:
Gradle 8.14 currently fails with `Unsupported class file major version 69`.

If a build runs for more than a few minutes without new output:

```bash
cd mobile/android
./gradlew --stop
cd ../..
npm run android:prepare
npm run android:sync
```

Then use **File → Sync Project with Gradle Files**. The first successful sync
downloads the Android Gradle Plugin and can take several minutes, but it should
continue printing download or task progress.

Build a debug APK in Android Studio, or with a compatible JDK:

```bash
cd mobile/android
./gradlew assembleDebug
```

## Test flow

1. Install the same Android app on a customer phone and a merchant phone.
2. Customer signs into a personal Lingoung account and opens an active card.
3. Customer enters the maximum approved amount and taps **Enable NFC**.
4. Merchant signs into a business Lingoung account, opens **POS Terminal**, enters the amount, and taps **Start NFC payment**.
5. Hold the phones back-to-back until the POS confirms settlement.

The server token expires in 90 seconds and can be redeemed only once. The merchant amount must not exceed the customer's approved limit.
