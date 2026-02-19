/**
 * Middleware для проверки API ключа
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API ключ не предоставлен'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Неверный API ключ'
    });
  }

  next();
};

/**
 * Middleware для проверки Terminal ID
 */
const terminalIdCheck = (req, res, next) => {
  const terminalId = req.headers['x-terminal-id'];
  
  if (!terminalId) {
    return res.status(400).json({
      success: false,
      error: 'Terminal ID не предоставлен'
    });
  }

  // Добавляем terminalId в объект запроса
  req.terminalId = terminalId;
  next();
};

module.exports = {
  apiKeyAuth,
  terminalIdCheck
};
