const mongoose = require('mongoose');

/**
 * Модель карты NFC
 */
const cardSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: /^[a-f0-9]{32}$/
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Индекс для быстрого поиска по токену
cardSchema.index({ token: 1 });

// Метод для форматирования баланса (копейки -> рубли)
cardSchema.methods.getFormattedBalance = function() {
  return (this.balance / 100).toFixed(2);
};

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
