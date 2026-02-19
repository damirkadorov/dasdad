/**
 * Глобальный обработчик ошибок
 */
const errorHandler = (err, req, res, next) => {
  console.error('Ошибка:', err);

  // Ошибки валидации Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Ошибка валидации',
      details: errors
    });
  }

  // Ошибки дубликата MongoDB
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Карта с таким токеном уже существует'
    });
  }

  // Ошибки Joi валидации
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Ошибка валидации данных',
      details: err.details.map(d => d.message)
    });
  }

  // Общая ошибка сервера
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Внутренняя ошибка сервера' 
      : err.message
  });
};

/**
 * Обработчик для несуществующих маршрутов
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден'
  });
};

module.exports = {
  errorHandler,
  notFound
};
