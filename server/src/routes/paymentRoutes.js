const express = require('express');
const router = express.Router();
const {
  processPayment,
  getTransactionsByToken,
  getTerminalStats
} = require('../controllers/paymentController');
const { terminalIdCheck } = require('../middleware/auth');

// Обработка платежа (требует Terminal ID в заголовке)
router.post('/', terminalIdCheck, processPayment);

// Получить транзакции по токену карты
router.get('/transactions/:token', getTransactionsByToken);

// Получить статистику по терминалу
router.get('/terminal/:terminalId/stats', getTerminalStats);

module.exports = router;
