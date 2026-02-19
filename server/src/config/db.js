const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Подключение к MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Опции подключения
    });

    console.log(`MongoDB подключена: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Ошибка подключения к MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
