const mongoose = require('mongoose');

/**
 * Модель транзакции
 */
const transactionSchema = new mongoose.Schema({
  cardToken: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  terminalId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'declined'],
    required: true
  },
  errorMessage: {
    type: String
  }
});

// Составной индекс для быстрого поиска транзакций по карте и дате
transactionSchema.index({ cardToken: 1, date: -1 });
transactionSchema.index({ terminalId: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
