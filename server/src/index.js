require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { apiKeyAuth } = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Импорт маршрутов
const cardRoutes = require('./routes/cardRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Подключение к БД
connectDB();

// Middleware для безопасности
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
};
app.use(cors(corsOptions));

// Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    success: false,
    error: 'Слишком много запросов, попробуйте позже'
  }
});
app.use('/api/', limiter);

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NFC Terminal Server API',
    version: '1.0.0',
    endpoints: {
      cards: '/api/cards',
      payment: '/api/pay'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API маршруты (все требуют API ключ)
app.use('/api/cards', apiKeyAuth, cardRoutes);
app.use('/api/pay', apiKeyAuth, paymentRoutes);

// Обработка несуществующих маршрутов
app.use(notFound);

// Глобальный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}\n`);
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (err) => {
  console.error('Необработанная ошибка Promise:', err);
  process.exit(1);
});
