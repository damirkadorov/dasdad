# 💳 Revolut-Style Demo Payment App

A full-featured gaming payment application built with Next.js 14+, inspired by Revolut's design. This is a **DEMO application** with fake money for demonstration and learning purposes only.

![Demo App](https://img.shields.io/badge/Demo-App-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwind-css)

## ⚠️ Important Notice

**This is a DEMO application for educational purposes only. All money is fake, and no real payments are processed.**

## ✨ Features

### 🔐 Authentication & Security
- User registration and login
- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- Form validation and error handling

### 💰 Balance Management
- Starting balance of $0
- Easy top-up with fake money
- Real-time balance updates
- Transaction history tracking

### 💳 Virtual Cards
- Create up to 5 virtual cards per user
- Support for Visa and Mastercard
- Realistic card number generation (Luhn algorithm)
- Card freezing and unfreezing
- Card deletion
- Detailed card information view

### 📱 NFC / Tap to Pay
- Simulated NFC payment experience
- Animated payment confirmation
- Amount validation
- Balance checking

### 💸 Send & Receive Money
- Send money to other users by username or email
- Receive money from other users
- Real-time balance updates
- Transaction notifications

### 📊 Transaction History
- Complete transaction history
- Transaction type filtering (Top Up, Send, Receive, NFC)
- Transaction statistics
- Date and time stamps

### 🎨 Modern UI/UX
- Revolut-inspired design
- Purple-blue and orange-pink gradients
- Glass morphism effects
- Smooth animations and transitions
- Mobile-first responsive design
- Dark mode support

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** JSON files (simple file-based storage)
- **Authentication:** JWT with httpOnly cookies
- **Password Hashing:** bcryptjs
- **UUID Generation:** uuid

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
   # JWT Secret (use a strong random string in production)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

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
│   ├── db/                  # Database operations
│   └── utils/               # Helper functions
├── data/                    # JSON database (created at runtime)
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
3. Choose Visa or Mastercard
4. Card is generated with realistic details

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

- Uses JSON file storage (not suitable for production at scale)
- No real payment processing
- No email verification
- No password reset functionality
- No 2FA authentication
- Database is not optimized for concurrent access

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
