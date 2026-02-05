import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/database';
import { Currency } from '@/lib/db/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const merchantId = decoded.userId;
    
    // Get request data
    const { cardNumber, expiryDate, cvv, amount, currency, description } = await request.json();

    // Validate inputs
    if (!cardNumber || !expiryDate || !cvv || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Find the card in the database
    const card = db.getCards().find(c => 
      c.cardNumber === cardNumber && 
      c.expiryDate === expiryDate && 
      c.cvv === cvv &&
      c.status === 'active'
    );

    if (!card) {
      return NextResponse.json(
        { error: 'Invalid card details or card is not active' },
        { status: 404 }
      );
    }

    // Get the card owner
    const cardOwner = db.getUsers().find(u => u.id === card.userId);
    
    if (!cardOwner) {
      return NextResponse.json(
        { error: 'Card owner not found' },
        { status: 404 }
      );
    }

    // Check if merchant is trying to charge their own card
    if (cardOwner.id === merchantId) {
      return NextResponse.json(
        { error: 'Cannot charge your own card' },
        { status: 400 }
      );
    }

    // Find the balance for the card's currency
    const cardOwnerBalance = cardOwner.balances?.find(b => b.currency === (currency || 'USD'));
    
    if (!cardOwnerBalance || cardOwnerBalance.amount < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance on card' },
        { status: 400 }
      );
    }

    // Get merchant
    const merchant = db.getUsers().find(u => u.id === merchantId);
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // Deduct from card owner
    db.updateUserBalance(cardOwner.id, -amount, currency || 'USD');

    // Add to merchant
    db.updateUserBalance(merchant.id, amount, currency || 'USD');

    // Create transaction for card owner (debit)
    const cardOwnerTransaction = db.createTransaction({
      userId: cardOwner.id,
      type: 'nfc_payment',
      amount: -amount,
      currency: currency || 'USD',
      description: description || `POS payment to ${merchant.username}`,
      status: 'completed',
      recipientId: merchant.id
    });

    // Create transaction for merchant (credit)
    const merchantTransaction = db.createTransaction({
      userId: merchant.id,
      type: 'receive',
      amount: amount,
      currency: currency || 'USD',
      description: description || `POS payment from ${cardOwner.username}`,
      status: 'completed',
      senderId: cardOwner.id,
      cardId: card.id
    });

    return NextResponse.json({
      success: true,
      message: 'Payment successful',
      amount,
      currency: currency || 'USD',
      cardLast4: cardNumber.slice(-4),
      transactionId: merchantTransaction.id,
      description: description || `POS payment from ${cardOwner.username}`,
      merchantBalance: merchant.balances?.find(b => b.currency === (currency || 'USD'))?.amount || 0
    });
  } catch (error) {
    console.error('POS charge error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
