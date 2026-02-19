const crypto = require('crypto');

/**
 * Генератор уникальных токенов для NFC-карт
 */
class TokenGenerator {
  /**
   * Генерирует 32-символьный hex токен
   * @returns {string} Уникальный токен
   */
  static generateToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Проверяет валидность токена
   * @param {string} token - Токен для проверки
   * @returns {boolean} true если токен валиден
   */
  static validateToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }
    // Проверяем что токен - 32 символа hex
    return /^[a-f0-9]{32}$/.test(token);
  }
}

module.exports = TokenGenerator;
