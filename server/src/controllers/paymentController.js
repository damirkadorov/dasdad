const Card = require('../models/Card');
const Transaction = require('../models/Transaction');
const TokenGenerator = require('../utils/tokenGenerator');
const Joi = require('joi');

/**
 * Схема валидации для платежа
 */
const paymentSchema = Joi.object({
  token: Joi.string().required().regex(/^[a-f0-9]{32}$/),
  amount: Joi.number().integer().min(1).required(),
  terminalId: Joi.string().required().trim()
});

/**
 * Обработка платежа
 */
const processPayment = async (req, res, next) => {
  try {
    // Валидация входных данных
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const { token, amount, terminalId } = value;

    console.log(`Попытка платежа: карта=${token}, сумма=${amount}, терминал=${terminalId}`);

    // Поиск карты
    const card = await Card.findOne({ token });

    // Проверка существования карты
    if (!card) {
      await Transaction.create({
        cardToken: token,
        amount,
        terminalId,
        status: 'failed',
        errorMessage: 'Карта не найдена'
      });

      return res.status(404).json({
        success: false,
        error: 'Карта не найдена'
      });
    }

    // Проверка активности карты
    if (!card.active) {
      await Transaction.create({
        cardToken: token,
        amount,
        terminalId,
        status: 'declined',
        errorMessage: 'Карта заблокирована'
      });

      return res.status(403).json({
        success: false,
        error: 'Карта заблокирована'
      });
    }

    // Проверка баланса
    if (card.balance < amount) {
      await Transaction.create({
        cardToken: token,
        amount,
        terminalId,
        status: 'declined',
        errorMessage: 'Недостаточно средств'
      });

      return res.status(400).json({
        success: false,
        error: 'Недостаточно средств',
        currentBalance: card.balance,
        required: amount
      });
    }

    // Списание средств
    card.balance -= amount;
    await card.save();

    // Создание успешной транзакции
    const transaction = await Transaction.create({
      cardToken: token,
      amount,
      terminalId,
      status: 'success'
    });

    console.log(`Успешный платеж: ${amount} коп., новый баланс: ${card.balance} коп.`);

    res.json({
      success: true,
      message: 'Платеж успешно обработан',
      data: {
        transactionId: transaction._id,
        amount,
        newBalance: card.balance,
        date: transaction.date
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получить историю транзакций по токену карты
 */
const getTransactionsByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Валидация токена
    if (!TokenGenerator.validateToken(token)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат токена'
      });
    }

    const transactions = await Transaction.find({ cardToken: token })
      .sort({ date: -1 })
      .limit(50); // Ограничиваем последними 50 транзакциями

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получить статистику по терминалу
 */
const getTerminalStats = async (req, res, next) => {
  try {
    const { terminalId } = req.params;

    const stats = await Transaction.aggregate([
      { $match: { terminalId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      terminalId,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getTransactionsByToken,
  getTerminalStats
};
