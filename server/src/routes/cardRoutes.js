const express = require('express');
const router = express.Router();
const {
  getAllCards,
  getCardByToken,
  createCard,
  updateCardStatus
} = require('../controllers/cardController');

// Получить все карты
router.get('/', getAllCards);

// Создать новую карту
router.post('/', createCard);

// Получить карту по токену
router.get('/:token', getCardByToken);

// Обновить статус карты
router.patch('/:token/status', updateCardStatus);

module.exports = router;
