/**
 * Migration script: adding unique tokens to all cards
 * Usage: node scripts/add-tokens-to-cards.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'dasdad';

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

async function migrateCards() {
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const cardsCollection = db.collection('cards');
    
    const cardsWithoutToken = await cardsCollection.find({ 
      token: { $exists: false } 
    }).toArray();
    
    console.log(`📋 Found ${cardsWithoutToken.length} cards without token`);
    
    if (cardsWithoutToken.length === 0) {
      console.log('✨ All cards already have tokens!');
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
      
      console.log(`✅ Card ${card.cardNumber || card.id} -> token: ${token}`);
    }
    
    console.log(`\n🎉 Successfully added tokens for ${cardsWithoutToken.length} cards!`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

migrateCards();
