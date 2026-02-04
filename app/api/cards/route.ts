import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getCardsByUserId, createCard } from '@/lib/db/database';
import { generateCardNumber, generateCVV, generateExpiryDate } from '@/lib/utils/helpers';

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
    const { cardType } = body;

    // Validate card type
    if (!cardType || !['visa', 'mastercard'].includes(cardType)) {
      return NextResponse.json(
        { error: 'Invalid card type. Must be "visa" or "mastercard"' },
        { status: 400 }
      );
    }

    // Generate card details
    const cardNumber = generateCardNumber(cardType as 'visa' | 'mastercard');
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();

    // Create card in MongoDB
    const newCard = await createCard({
      id: uuidv4(),
      userId: user!.userId,
      cardNumber,
      expiryDate,
      cvv,
      cardType: cardType as 'visa' | 'mastercard',
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
