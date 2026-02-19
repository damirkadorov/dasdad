# 🎨 Архитектура системы NFC Terminal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NFC TERMINAL SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────┐                                    ┌──────────────────┐
│   NFC Card/Tag    │                                    │  MongoDB Cloud   │
│   ┌───────────┐   │                                    │  ┌────────────┐  │
│   │  Token:   │   │                                    │  │   Cards    │  │
│   │ a1b2c3d4  │   │                                    │  │            │  │
│   │   (32hex) │   │                                    │  │  - token   │  │
│   └───────────┘   │                                    │  │  - owner   │  │
└─────────┬─────────┘                                    │  │  - balance │  │
          │ NFC Read                                     │  │  - active  │  │
          ▼                                              │  └────────────┘  │
┌───────────────────┐                                    │  ┌────────────┐  │
│  Android Terminal │                                    │  │Transactions│  │
│  ┌─────────────┐  │                                    │  │            │  │
│  │ MainActivity│  │                                    │  │  - token   │  │
│  │             │  │     HTTPS/HTTP API                 │  │  - amount  │  │
│  │  [Amount]   │◄─┼───────────────────────────────────►│  │  - status  │  │
│  │  [Pay Btn]  │  │     POST /api/pay                  │  │  - termId  │  │
│  │  [Status]   │  │     {token, amount, terminalId}    │  └────────────┘  │
│  └─────────────┘  │                                    └──────────────────┘
│  ┌─────────────┐  │                                              ▲
│  │ NfcReader   │  │                                              │
│  │ ApiService  │  │                                              │
│  │SecureStorage│  │                                              │
│  └─────────────┘  │                                              │
└─────────┬─────────┘                                              │
          │                                                        │
          │ HTTP/HTTPS                                             │
          │ Headers:                                               │
          │  - X-API-Key                                           │
          │  - X-Terminal-Id                                       │
          ▼                                                        │
┌───────────────────────────────────────────────────────┐          │
│          Node.js + Express Server                     │          │
│  ┌─────────────────────────────────────────────────┐  │          │
│  │         Routes Layer                             │  │          │
│  │  /api/cards      /api/pay                       │  │          │
│  └─────────────────────────────────────────────────┘  │          │
│  ┌─────────────────────────────────────────────────┐  │          │
│  │         Middleware Layer                         │  │          │
│  │  - apiKeyAuth    - terminalIdCheck              │  │          │
│  │  - rateLimiter   - errorHandler                 │  │          │
│  │  - helmet        - cors                          │  │          │
│  └─────────────────────────────────────────────────┘  │          │
│  ┌─────────────────────────────────────────────────┐  │          │
│  │         Controllers Layer                        │  │          │
│  │  - cardController    - paymentController        │  │          │
│  │    • createCard        • processPayment         │  │          │
│  │    • getAllCards       • getTransactions        │  │          │
│  │    • getCardByToken    • getStats               │  │          │
│  └─────────────────────────────────────────────────┘  │          │
│  ┌─────────────────────────────────────────────────┐  │          │
│  │         Models Layer                             │  │          │
│  │  - Card Model         - Transaction Model       │  │          │
│  │    (Mongoose Schema)   (Mongoose Schema)        │  │          │
│  └─────────────────────────────────────────────────┘  │          │
│  ┌─────────────────────────────────────────────────┐  │          │
│  │         Utilities                                │  │          │
│  │  - tokenGenerator  - seed.js                    │  │          │
│  └─────────────────────────────────────────────────┘  │          │
└───────────────────────────┬───────────────────────────┘          │
                            │                                      │
                            └──────────────────────────────────────┘
                            Mongoose ODM Connection


════════════════════════════════════════════════════════════════════════════

                           FLOW ДИАГРАММА ПЛАТЕЖА

┌────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐    ┌──────────┐
│  User  │    │   NFC   │    │ Android  │    │ Server │    │ MongoDB  │
└───┬────┘    └────┬────┘    └────┬─────┘    └───┬────┘    └────┬─────┘
    │              │              │              │              │
    │ 1. Enter amt │              │              │              │
    ├─────────────►│              │              │              │
    │              │              │              │              │
    │ 2. Tap card  │              │              │              │
    ├─────────────►│              │              │              │
    │              │              │              │              │
    │              │ 3. Read token│              │              │
    │              ├─────────────►│              │              │
    │              │              │              │              │
    │              │              │ 4. POST /api/pay           │
    │              │              ├─────────────►│              │
    │              │              │  {token,amt} │              │
    │              │              │              │              │
    │              │              │              │ 5. Find card │
    │              │              │              ├─────────────►│
    │              │              │              │              │
    │              │              │              │ 6. Card data │
    │              │              │              │◄─────────────┤
    │              │              │              │              │
    │              │              │              │ 7. Check:    │
    │              │              │              │  - exists?   │
    │              │              │              │  - active?   │
    │              │              │              │  - balance?  │
    │              │              │              │              │
    │              │              │              │ 8. Deduct    │
    │              │              │              ├─────────────►│
    │              │              │              │              │
    │              │              │              │ 9. Create TX │
    │              │              │              ├─────────────►│
    │              │              │              │              │
    │              │              │ 10. Success  │              │
    │              │              │◄─────────────┤              │
    │              │              │  {new bal}   │              │
    │              │              │              │              │
    │              │ 11. Show ✅  │              │              │
    │◄─────────────┴──────────────┤              │              │
    │   "Success! Balance: 450₽" │              │              │
    │              │              │              │              │
    ▼              ▼              ▼              ▼              ▼


════════════════════════════════════════════════════════════════════════════

                           SECURITY LAYERS

┌─────────────────────────────────────────────────────────────────────────┐
│                        SECURITY ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Layer 1: Transport Security                                           │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • HTTPS (production)                                              │ │
│  │ • Helmet (HTTP headers)                                           │ │
│  │ • CORS (origin validation)                                        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Layer 2: Authentication & Authorization                               │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • API Key (X-API-Key header)                                      │ │
│  │ • Terminal ID validation (X-Terminal-Id)                          │ │
│  │ • EncryptedSharedPreferences (Android)                            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Layer 3: Rate Limiting & DDoS Protection                             │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • express-rate-limit: 100 req/15min per IP                        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Layer 4: Input Validation                                            │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • Joi schema validation                                           │ │
│  │ • Mongoose schema validation                                      │ │
│  │ • Token format check (32 hex)                                     │ │
│  │ • Amount validation (>0, integer)                                 │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Layer 5: Business Logic Validation                                   │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • Card existence check                                            │ │
│  │ • Card active status check                                        │ │
│  │ • Balance sufficiency check                                       │ │
│  │ • Transaction atomicity                                           │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Layer 6: Error Handling                                              │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • Global error handler                                            │ │
│  │ • No sensitive data in errors                                     │ │
│  │ • Proper HTTP status codes                                        │ │
│  │ • Logging (but not passwords/tokens)                              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘


════════════════════════════════════════════════════════════════════════════

                           DATA MODELS

Card Model (MongoDB):
┌──────────────────────────────────────┐
│ _id:        ObjectId (auto)          │
│ token:      String (32 hex, unique)  │
│ owner:      String (name)            │
│ balance:    Number (kopecks)         │
│ active:     Boolean (default true)   │
│ createdAt:  Date (auto)              │
└──────────────────────────────────────┘
    Indexes: token (unique)

Transaction Model (MongoDB):
┌──────────────────────────────────────┐
│ _id:          ObjectId (auto)        │
│ cardToken:    String (ref to Card)   │
│ amount:       Number (kopecks)       │
│ date:         Date (auto)            │
│ terminalId:   String                 │
│ status:       String (enum)          │
│               - success              │
│               - failed               │
│               - declined             │
│ errorMessage: String (optional)      │
└──────────────────────────────────────┘
    Indexes: 
      - {cardToken: 1, date: -1}
      - {terminalId: 1, date: -1}


════════════════════════════════════════════════════════════════════════════

                           API ENDPOINTS

┌────────────────────────────────────────────────────────────────────────┐
│  METHOD  │  ENDPOINT                    │  AUTH       │  DESCRIPTION   │
├──────────┼──────────────────────────────┼─────────────┼────────────────┤
│  GET     │  /health                     │  None       │  Health check  │
│  POST    │  /api/cards                  │  API Key    │  Create card   │
│  GET     │  /api/cards                  │  API Key    │  List cards    │
│  GET     │  /api/cards/:token           │  API Key    │  Get card info │
│  PATCH   │  /api/cards/:token/status    │  API Key    │  Update status │
│  POST    │  /api/pay                    │  API+Term   │  Process pay   │
│  GET     │  /api/pay/transactions/:tok  │  API Key    │  Get history   │
│  GET     │  /api/pay/terminal/:id/stats │  API Key    │  Get stats     │
└────────────────────────────────────────────────────────────────────────┘

AUTH Legend:
  - API Key:  Requires X-API-Key header
  - API+Term: Requires X-API-Key + X-Terminal-Id headers


════════════════════════════════════════════════════════════════════════════

                          DEPLOYMENT TOPOLOGY

Production Setup:
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐               │
│  │  NGINX   │────────►│  PM2     │────────►│ MongoDB  │               │
│  │  Proxy   │  3001   │ Node.js  │         │  Atlas   │               │
│  │  :80/:443│         │ (cluster)│         │  Cloud   │               │
│  └──────────┘         └──────────┘         └──────────┘               │
│       ▲                    ▲                                           │
│       │                    │                                           │
│   SSL Cert            PM2 Logs &                                       │
│   (Let's Encrypt)     Monitoring                                       │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Android Devices (Global)                                      │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                       │   │
│  │  │ Term │  │ Term │  │ Term │  │ Term │  ...                  │   │
│  │  │  001 │  │  002 │  │  003 │  │  NNN │                       │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘                       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘


════════════════════════════════════════════════════════════════════════════
```
