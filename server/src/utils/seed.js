require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../models/Card');
const Transaction = require('../models/Transaction');
const TokenGenerator = require('./tokenGenerator');

/**
 * Скрипт для создания тестовых данных
 */
async function seed() {
  try {
    // Подключение к БД
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключено к MongoDB');

    // Очистка существующих данных
    await Card.deleteMany({});
    await Transaction.deleteMany({});
    console.log('🗑️  Старые данные удалены');

    // Создание тестовых карт
    const testCards = [
      {
        token: TokenGenerator.generateToken(),
        owner: 'Иван Иванов',
        balance: 50000, // 500 руб
        active: true
      },
      {
        token: TokenGenerator.generateToken(),
        owner: 'Мария Петрова',
        balance: 100000, // 1000 руб
        active: true
      },
      {
        token: TokenGenerator.generateToken(),
        owner: 'Петр Сидоров',
        balance: 25000, // 250 руб
        active: true
      },
      {
        token: TokenGenerator.generateToken(),
        owner: 'Анна Смирнова',
        balance: 75000, // 750 руб
        active: false // Заблокированная карта для тестирования
      },
      {
        token: TokenGenerator.generateToken(),
        owner: 'Сергей Козлов',
        balance: 1000, // 10 руб - низкий баланс для тестирования
        active: true
      }
    ];

    const cards = await Card.insertMany(testCards);
    console.log(`✅ Создано ${cards.length} тестовых карт:`);
    
    cards.forEach(card => {
      console.log(`   📇 ${card.owner}: токен=${card.token}, баланс=${(card.balance/100).toFixed(2)} руб, активна=${card.active}`);
    });

    // Создание тестовых транзакций
    const testTransactions = [
      {
        cardToken: cards[0].token,
        amount: 5000,
        terminalId: 'terminal-001',
        status: 'success',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 дня назад
      },
      {
        cardToken: cards[0].token,
        amount: 3000,
        terminalId: 'terminal-002',
        status: 'success',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 день назад
      },
      {
        cardToken: cards[1].token,
        amount: 10000,
        terminalId: 'terminal-001',
        status: 'success',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 часа назад
      },
      {
        cardToken: cards[3].token,
        amount: 2000,
        terminalId: 'terminal-003',
        status: 'declined',
        errorMessage: 'Карта заблокирована',
        date: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 час назад
      }
    ];

    const transactions = await Transaction.insertMany(testTransactions);
    console.log(`✅ Создано ${transactions.length} тестовых транзакций`);

    console.log('\n🎉 Инициализация завершена успешно!');
    console.log('\n📝 Сохраните токены карт для тестирования:');
    console.log('=' .repeat(80));
    cards.forEach((card, index) => {
      console.log(`\nКарта ${index + 1}: ${card.owner}`);
      console.log(`Токен: ${card.token}`);
      console.log(`Баланс: ${(card.balance/100).toFixed(2)} руб`);
      console.log(`Статус: ${card.active ? '✅ Активна' : '❌ Заблокирована'}`);
    });
    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Отключено от MongoDB');
    process.exit(0);
  }
}

// Запуск seed
seed();
