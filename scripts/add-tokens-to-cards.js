/**
 * Миграционный скрипт: добавление уникальных токенов ко всем картам
 * Запуск: node scripts/add-tokens-to-cards.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI;

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

async function migrateCards() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Подключено к MongoDB');
    
    const db = client.db('dasdad');
    const cardsCollection = db.collection('cards');
    
    const cardsWithoutToken = await cardsCollection.find({ 
      token: { $exists: false } 
    }).toArray();
    
    console.log(`📋 Найдено ${cardsWithoutToken.length} карт без токена`);
    
    if (cardsWithoutToken.length === 0) {
      console.log('✨ Все карты уже имеют токены!');
      return;
    }
    
    const existingTokens = new Set(
      (await cardsCollection.find({ token: { $exists: true } }).toArray())
        .map(card => card.token)
    );
    
    for (const card of cardsWithoutToken) {
      let token;
      do {
        token = generateToken();
      } while (existingTokens.has(token));
      
      existingTokens.add(token);
      
      await cardsCollection.updateOne(
        { _id: card._id },
        { $set: { token } }
      );
      
      console.log(`✅ Карта ${card.cardNumber || card.id} -> токен: ${token}`);
    }
    
    console.log(`\n🎉 Успешно добавлены токены для ${cardsWithoutToken.length} карт!`);
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
  } finally {
    await client.close();
    console.log('\n👋 Отключено от MongoDB');
  }
}

migrateCards();
