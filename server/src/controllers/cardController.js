const Card = require('../models/Card');
const TokenGenerator = require('../utils/tokenGenerator');
const Joi = require('joi');

/**
 * Схема валидации для создания карты
 */
const createCardSchema = Joi.object({
  owner: Joi.string().required().trim().min(2).max(100),
  balance: Joi.number().integer().min(0).default(0)
});

/**
 * Получить все карты
 */
const getAllCards = async (req, res, next) => {
  try {
    const cards = await Card.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: cards.length,
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получить карту по токену
 */
const getCardByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Валидация токена
    if (!TokenGenerator.validateToken(token)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат токена'
      });
    }

    const card = await Card.findOne({ token });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Карта не найдена'
      });
    }

    res.json({
      success: true,
      data: {
        owner: card.owner,
        balance: card.balance,
        active: card.active,
        createdAt: card.createdAt
        // Не возвращаем токен в целях безопасности (если запрос не от терминала)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Создать новую карту
 */
const createCard = async (req, res, next) => {
  try {
    // Валидация входных данных
    const { error, value } = createCardSchema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    // Генерация уникального токена
    let token;
    let tokenExists = true;
    
    // Генерируем токен пока не получим уникальный
    while (tokenExists) {
      token = TokenGenerator.generateToken();
      tokenExists = await Card.findOne({ token });
    }

    // Создание карты
    const card = await Card.create({
      token,
      owner: value.owner,
      balance: value.balance
    });

    console.log(`Создана новая карта для ${card.owner}, токен: ${token}`);

    res.status(201).json({
      success: true,
      message: 'Карта успешно создана',
      data: {
        token: card.token,
        owner: card.owner,
        balance: card.balance,
        active: card.active,
        createdAt: card.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновить статус карты (активировать/деактивировать)
 */
const updateCardStatus = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Поле active должно быть boolean'
      });
    }

    const card = await Card.findOneAndUpdate(
      { token },
      { active },
      { new: true, runValidators: true }
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Карта не найдена'
      });
    }

    console.log(`Карта ${token} ${active ? 'активирована' : 'деактивирована'}`);

    res.json({
      success: true,
      message: `Карта ${active ? 'активирована' : 'деактивирована'}`,
      data: card
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCards,
  getCardByToken,
  createCard,
  updateCardStatus
};
