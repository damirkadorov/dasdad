import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getCardsByUserId, createCard } from '@/lib/db/database';
import { generateCardNumber, generateCVV, generateExpiryDate } from '@/lib/utils/helpers';
import { Currency, NovapayCardType } from '@/lib/db/types';

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    // Get cards from MongoDB
    const cards = await getCardsByUserId(user!.userId);

    return NextResponse.json(
      { cards },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    // Check if user has reached the limit of 5 cards (from MongoDB)
    const existingCards = await getCardsByUserId(user!.userId);
    if (existingCards.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum of 5 cards per user reached' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { cardType, cardFormat = 'virtual', currency = 'USD', accountType = 'personal' } = body;

    // Validate card type - NovaPay network cards only
    if (!cardType || !['nova', 'nova-plus'].includes(cardType)) {
      return NextResponse.json(
        { error: 'Invalid card type. Must be "nova" or "nova-plus"' },
        { status: 400 }
      );
    }

    // Validate card format
    if (!['virtual', 'physical'].includes(cardFormat)) {
      return NextResponse.json(
        { error: 'Invalid card format. Must be "virtual" or "physical"' },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(currency as Currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      );
    }

    // Validate account type
    if (!['personal', 'business'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type. Must be "personal" or "business"' },
        { status: 400 }
      );
    }

    // Generate NovaPay card details (all cards start with "7")
    const cardNumber = generateCardNumber(cardType as NovapayCardType);
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();

    // Create card in MongoDB with multi-currency support
    const newCard = await createCard({
      id: uuidv4(),
      userId: user!.userId,
      cardNumber,
      expiryDate,
      cvv,
      cardType: cardType as NovapayCardType,
      cardFormat: cardFormat as 'virtual' | 'physical',
      currency: currency as Currency,
      accountType: accountType as 'personal' | 'business',
      status: 'active',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      {
        message: 'Card created successfully',
        card: newCard
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
