# 💳 Next.js Banking & Crypto Exchange Demo

A full-featured multi-currency banking and cryptocurrency exchange application built with Next.js 14+, inspired by modern fintech apps like Revolut. This is a **DEMO application** with fake money for demonstration and learning purposes only.

![Demo App](https://img.shields.io/badge/Demo-App-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwind-css)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

## ⚠️ Important Notice

**This is a DEMO application for educational purposes only. All money is fake, and no real payments are processed.**

## ✨ Features

### 🔐 Authentication & Security
- User registration and login with email notifications
- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- Form validation and error handling
- Secure password reset functionality

### 💰 Multi-Currency Banking
- **7 supported currencies**: USD, EUR, GBP, CHF, JPY, CAD, AUD
- Real-time currency conversion
- Multi-currency balance management
- IBAN generation for international transfers
- Bank account creation with BIC codes
- Cross-currency transfers between users

### 💳 Virtual & Physical Cards
- Create up to 5 cards per user
- **NovaPay network cards** (all cards start with "7")
- Two card types: **NovaPay** and **NovaPay+**
- **Virtual** and **Physical** card options
- Multi-currency card support
- Realistic card number generation (Luhn algorithm)
- Card freezing and unfreezing
- Detailed card information view

### ₿ Cryptocurrency Exchange
- **8 supported cryptocurrencies**: BTC, ETH, USDT, BNB, XRP, ADA, SOL, DOGE
- Buy and sell crypto with any fiat currency
- Real-time price tracking (mock data)
- Crypto wallet management with unique addresses
- Portfolio tracking and visualization
- Transaction fees (1% on trades)
- Trade history

### 📊 Portfolio & Analytics
- Combined fiat + crypto portfolio view
- Real-time portfolio valuation
- Interactive pie charts (Recharts)
- Asset distribution visualization
- Portfolio performance tracking

### 🔄 Currency & Crypto Converter
- Convert between any fiat currencies
- Convert between fiat and cryptocurrencies
- Convert between different cryptocurrencies
- Real-time exchange rates
- Live conversion preview

### 💸 Payments & Transfers
- Send money to other users by username or email
- Multi-currency transfers
- NFC / Tap to Pay simulation
- Real-time balance updates
- Email notifications for all transactions

### 🚀 Payment Gateway API (NEW!)
- **Complete payment integration API** for external websites
- RESTful API with API key authentication
- CORS-enabled for cross-origin requests
- Webhook notifications for payment events
- Secure payment processing page
- Support for all 7 currencies
- 2.5% transaction fee
- Full API documentation included
- JavaScript, PHP, Python integration examples
- Test mode with fake payments

**Integrate payments into your website in minutes!** See [PAYMENT_API.md](PAYMENT_API.md) for full documentation.

### 📈 Transaction History
- Complete transaction history with filtering
- Multiple transaction types: Top Up, Send, Receive, NFC, Crypto Buy/Sell, IBAN Transfer
- Transaction statistics
- Date and time stamps
- Currency and crypto amount display

### 📧 Email Notifications
- Welcome email on registration
- Transfer notifications (sent/received)
- Crypto trade confirmations
- Password reset emails
- SMTP integration (Always Data compatible)

### 🎨 Modern UI/UX
- Clean, modern design inspired by fintech apps
- Purple-blue and orange-pink gradients
- Glass morphism effects
- Smooth animations and transitions
- Mobile-first responsive design
- Dark mode support throughout

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB Atlas (NoSQL cloud database)
- **Authentication:** JWT with httpOnly cookies
- **Password Hashing:** bcryptjs
- **Email:** Nodemailer (SMTP)
- **Charts:** Recharts
- **UUID Generation:** uuid v13

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/damirkadorov/dasdad.git
   cd dasdad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and update the values:
   ```env
   # MongoDB Atlas Connection String
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

   # JWT Secret (use a strong random string in production)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **MongoDB Setup:**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string from the "Connect" button
   - Replace `username`, `password`, and `cluster` in the connection string
   - Whitelist your IP address or use 0.0.0.0/0 for development

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Vercel

This application is ready for deployment to Vercel:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (add `JWT_SECRET`)
   - Deploy!

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add `MONGODB_URI` with your MongoDB Atlas connection string
   - Add `JWT_SECRET` with a strong random value
   - Add `NEXT_PUBLIC_APP_URL` with your production URL

## 📁 Project Structure

```
dasdad/
├── app/                      # Next.js 14 App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── balance/         # Balance management
│   │   ├── cards/           # Card operations
│   │   ├── payments/        # Payment processing
│   │   ├── transactions/    # Transaction history
│   │   └── user/            # User profile
│   ├── dashboard/           # Dashboard page
│   ├── cards/               # Cards pages
│   ├── payments/            # Payments page
│   ├── transactions/        # Transactions page
│   ├── profile/             # Profile page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # UI components (Button, Input)
│   ├── cards/               # Card components
│   ├── transactions/        # Transaction components
│   └── layout/              # Layout components
├── lib/                     # Utility functions
│   ├── auth/                # Authentication utilities
│   ├── db/                  # Database operations (MongoDB)
│   └── utils/               # Helper functions
└── public/                  # Static assets
```

## 🎯 Usage

### Creating an Account

1. Navigate to `/register`
2. Enter email, username, and password
3. Password must be at least 8 characters with uppercase, lowercase, and numbers
4. Click "Create Account"

### Logging In

1. Navigate to `/login`
2. Enter your email and password
3. Click "Sign In"

### Adding Funds

1. Go to Dashboard
2. Click "Top Up Balance"
3. Enter amount (fake money)
4. Your balance updates instantly

### Creating Virtual Cards

1. Navigate to Cards section
2. Click "Create New Card"
3. Choose NovaPay or NovaPay+ card type
4. Card is generated with realistic details (card number starts with 7)

### Making Payments

**NFC Payment:**
1. Go to Payments
2. Select "NFC Payment" tab
3. Enter amount
4. Click "Tap to Pay"
5. Watch the animation!

**Send Money:**
1. Go to Payments
2. Select "Send Money" tab
3. Enter recipient's username or email
4. Enter amount
5. Click "Send Money"

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT authentication with httpOnly cookies
- Input validation on all forms
- CORS protection
- SQL injection prevention (no SQL used)
- XSS protection through React
- Balance validation before transactions

## 🧪 Testing

Create test users to try money transfers:

```bash
# User 1
Email: alice@example.com
Username: alice
Password: Test1234

# User 2
Email: bob@example.com
Username: bob
Password: Test1234
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/user/profile` - Get user profile

### Balance Endpoints

- `POST /api/balance/topup` - Add funds to balance

### Card Endpoints

- `GET /api/cards` - Get all user cards
- `POST /api/cards` - Create new card
- `GET /api/cards/[id]` - Get card details
- `PATCH /api/cards/[id]` - Update card status (freeze/unfreeze)
- `DELETE /api/cards/[id]` - Delete card

### Payment Endpoints

- `POST /api/payments/send` - Send money to another user
- `POST /api/payments/nfc` - Process NFC payment

### Transaction Endpoints

- `GET /api/transactions` - Get all user transactions

## 🐛 Known Limitations

- No real payment processing (demo app with fake money)
- No email verification
- No password reset functionality
- No 2FA authentication

## 🤝 Contributing

This is a demo project, but contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - feel free to use this project for learning and demonstration purposes.

## 👨‍💻 Author

Created as a demonstration of modern web development practices with Next.js 14, TypeScript, and Tailwind CSS.

## 🙏 Acknowledgments

- Design inspiration from Revolut
- Built with Next.js, TypeScript, and Tailwind CSS
- Icons and animations using CSS and SVG

---

**Remember:** This is a DEMO application with FAKE MONEY. Do not use for real financial transactions! 💰🎮

## 🚀 New Features in v2.0

### Multi-Currency Support
- **7 fiat currencies** with real-time conversion
- IBAN generation for international banking
- Multi-currency cards
- Cross-currency transfers

### Cryptocurrency Exchange
- **8 major cryptocurrencies** 
- Buy/Sell trading engine
- Wallet management with unique addresses
- Portfolio tracking with charts
- 1% transaction fees on trades

### Payment Gateway API (v2.1) 🆕
- **Complete payment integration API** for external websites and marketplaces
- RESTful API with secure API key authentication
- CORS support for cross-domain requests
- Real-time webhook notifications
- Hosted payment page with secure card processing
- Multi-currency support (7 currencies)
- 2.5% transaction fee per payment
- Full API documentation with code examples
- Integration examples in JavaScript, PHP, Python
- Developer dashboard for API key management

### Enhanced Features
- Email notifications via SMTP
- Currency and crypto converter
- Physical and virtual card options
- Portfolio analytics with charts
- Unified dashboard

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (sends welcome email)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/user/profile` - Get user profile

### Banking
- `POST /api/balance/topup` - Add funds (multi-currency)
- `GET /api/bank-accounts` - Get all bank accounts
- `POST /api/bank-accounts` - Create IBAN bank account

### Cards
- `GET /api/cards` - Get all user cards
- `POST /api/cards` - Create new card (virtual/physical, multi-currency)
- `GET /api/cards/[id]` - Get card details
- `PATCH /api/cards/[id]` - Update card status
- `DELETE /api/cards/[id]` - Delete card

### Payments
- `POST /api/payments/send` - Send money (multi-currency)
- `POST /api/payments/nfc` - Process NFC payment

### Payment Gateway API (External Integration)
- `POST /api/payment-gateway/payments` - Initialize payment (requires API key)
- `GET /api/payment-gateway/payments?paymentId={id}` - Check payment status (requires API key)
- `GET /api/payment-gateway/keys` - Get user's API keys
- `POST /api/payment-gateway/keys` - Create new API key
- `PATCH /api/payment-gateway/keys` - Update API key status
- `GET /api/payment-gateway/process/[id]` - Get payment details for payment page
- `POST /api/payment-gateway/process/[id]` - Process payment with card

See [PAYMENT_API.md](PAYMENT_API.md) for complete API documentation and integration examples.

### Cryptocurrency
- `GET /api/crypto/wallets` - Get all crypto wallets
- `POST /api/crypto/wallets` - Create new crypto wallet
- `POST /api/crypto/trade` - Buy or sell crypto
- `GET /api/crypto/portfolio` - Get portfolio with analytics
- `GET /api/crypto/trades` - Get trade history

### Utilities
- `GET /api/transactions` - Get transaction history
- `GET /api/convert?from=BTC&to=USD&amount=1` - Currency/crypto conversion

## 💱 Supported Currencies & Cryptocurrencies

### Fiat Currencies (7)
- 🇺🇸 USD - US Dollar
- 🇪🇺 EUR - Euro
- 🇬🇧 GBP - British Pound
- 🇨🇭 CHF - Swiss Franc
- 🇯🇵 JPY - Japanese Yen
- 🇨🇦 CAD - Canadian Dollar
- 🇦🇺 AUD - Australian Dollar

### Cryptocurrencies (8)
- ₿ BTC - Bitcoin
- Ξ ETH - Ethereum
- ₮ USDT - Tether
- 🔸 BNB - Binance Coin
- ⚡ XRP - Ripple
- ₳ ADA - Cardano
- ◎ SOL - Solana
- Ð DOGE - Dogecoin

## 📧 Email Configuration

The app supports SMTP email notifications. Configure your SMTP settings in `.env.local`:

```env
# Always Data SMTP (or any SMTP provider)
SMTP_HOST=smtp-dasdad.alwaysdata.net
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@dasdad.app
```

**Sent Emails:**
- Welcome email on registration
- Transfer notifications (sent/received)
- Crypto trade confirmations
- Password reset links

## 🎯 Usage Examples

### Creating a Multi-Currency Card

1. Navigate to Cards section
2. Click "Create New Card"
3. Select **Virtual** or **Physical**
4. Choose card type (NovaPay or NovaPay+)
5. Select currency (USD, EUR, GBP, etc.)
6. Card is generated with realistic details (card number starts with 7)

### Trading Cryptocurrency

1. Go to Trading page
2. Select **Buy** or **Sell** tab
3. Choose cryptocurrency (BTC, ETH, etc.)
4. Select payment currency
5. Enter amount
6. Review conversion and 1% fee
7. Confirm trade
8. Receive email confirmation

### Creating an IBAN Account

1. Go to Profile or Dashboard
2. Click "Create Bank Account"
3. Select currency
4. Enter account holder name
5. IBAN and BIC are automatically generated

### Viewing Portfolio

1. Navigate to Portfolio page
2. See all crypto holdings with current values
3. View portfolio distribution chart
4. Check trade history
5. Use built-in currency converter

## 🔧 Development

### Running Tests
```bash
# Currently no automated tests - add your own!
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 🌐 Environment Variables

Required environment variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dasdad

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SMTP (optional - for email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
```

## 🐛 Known Limitations

- **Demo app with fake money** - no real payment processing
- Mock cryptocurrency prices (not real-time API)
- Email notifications require SMTP configuration
- No real IBAN validation with banking systems
- No 2FA authentication (yet)
- No KYC verification (demo purposes)

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT authentication with httpOnly cookies
- Input validation on all forms
- CORS protection
- XSS protection through React
- Balance validation before transactions
- Secure cookie settings (httpOnly, sameSite, secure in production)
- CodeQL security scanning (0 vulnerabilities)

## 📦 Database Schema

### Users Collection
```typescript
{
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  balance: number; // Legacy USD balance
  balances: CurrencyBalance[]; // Multi-currency
  cryptoWallets: CryptoWallet[]; // Crypto holdings
  bankAccountIds: string[]; // IBAN accounts
  preferredCurrency: Currency;
  createdAt: string;
}
```

### Crypto Wallet Structure
```typescript
{
  cryptoType: 'BTC' | 'ETH' | 'USDT' | ...;
  address: string; // Unique wallet address
  balance: number;
  createdAt: string;
}
```

### Bank Account Structure
```typescript
{
  id: string;
  userId: string;
  iban: string; // Generated IBAN
  bic: string; // Bank Identifier Code
  currency: Currency;
  accountHolder: string;
  status: 'active' | 'closed';
  createdAt: string;
}
```

## 🎓 Learning Resources

This project demonstrates:
1. Next.js 16 App Router with TypeScript
2. MongoDB integration with serverless functions
3. JWT authentication with cookies
4. Multi-currency financial applications
5. Cryptocurrency trading simulation
6. Email notifications with SMTP
7. Chart visualization with Recharts
8. Responsive design with Tailwind CSS
9. IBAN generation algorithms
10. Currency conversion systems
11. **RESTful API design with authentication**
12. **Payment gateway integration**
13. **Webhook implementation**
14. **CORS configuration for external APIs**

## 💻 Payment Gateway Integration

### For Developers: Integrate Payments Into Your Website

This application includes a complete **Payment Gateway API** that you can integrate into any external website or marketplace.

#### Quick Start

1. **Get API Key**
   - Log in to the application
   - Navigate to `/developer` page
   - Create a new API key
   - Copy your API key (starts with `pk_`)

2. **Test Integration**
   - Open `/public/integration-example.html` in your browser
   - Enter your API key
   - Test creating a payment
   - Complete payment on the hosted payment page

3. **Integrate Into Your Website**
   ```javascript
   // Initialize a payment
   const response = await fetch('YOUR_APP_URL/api/payment-gateway/payments', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-API-Key': 'pk_your_api_key_here'
     },
     body: JSON.stringify({
       amount: 100,
       currency: 'USD',
       description: 'Order #12345',
       successUrl: 'https://yoursite.com/success',
       webhookUrl: 'https://yoursite.com/webhook'
     })
   });
   
   const data = await response.json();
   
   // Redirect customer to payment page
   window.location.href = data.paymentUrl;
   ```

4. **Receive Webhook Notifications**
   ```javascript
   app.post('/webhook', (req, res) => {
     const { event, paymentId, amount } = req.body;
     
     if (event === 'payment.completed') {
       // Process the order
       fulfillOrder(paymentId);
     }
     
     res.status(200).send('OK');
   });
   ```

#### Features

✅ Simple REST API with API key authentication  
✅ Hosted secure payment page  
✅ Multi-currency support (7 currencies)  
✅ Real-time webhook notifications  
✅ CORS enabled for external websites  
✅ Transaction fee: 2.5%  
✅ Full documentation with code examples  

#### Resources

- **Full API Documentation:** [PAYMENT_API.md](PAYMENT_API.md)
- **Developer Dashboard:** `/developer` page
- **Integration Example:** `/public/integration-example.html`
- **Supported Languages:** JavaScript, PHP, Python, and more

This makes it easy to add payment processing to any website, marketplace, or application!

## 🤝 Contributing

Contributions are welcome! This is primarily a learning/demo project, but feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use this project for learning and demonstration purposes.

## ⚠️ Disclaimer

**IMPORTANT:** This is a DEMO application for educational purposes only. 

- All money is FAKE
- Cryptocurrency prices are MOCK data
- Do NOT use for real financial transactions
- No real payment processing
- No connection to actual banking systems
- IBANs are generated for demo purposes only

## 🙏 Acknowledgments

- Design inspiration from Revolut and modern fintech apps
- Built with Next.js, TypeScript, and Tailwind CSS
- Charts powered by Recharts
- Icons and animations using CSS and SVG
- MongoDB Atlas for cloud database

---

**Built with ❤️ for learning and demonstration purposes** 

🚀 Ready to deploy on Vercel!
