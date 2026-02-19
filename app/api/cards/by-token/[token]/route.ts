import { NextRequest, NextResponse } from 'next/server';
import { getCardsCollection } from '@/lib/db/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Validate token format (32 hex characters)
    if (!token || !/^[a-f0-9]{32}$/.test(token)) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }
    
    const cards = await getCardsCollection();
    const card = await cards.findOne({ token });
    
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }
    
    // Validate card has required fields
    if (!card.cardNumber) {
      console.error('Card missing cardNumber field:', card.id);
      return NextResponse.json(
        { error: 'Invalid card data' },
        { status: 500 }
      );
    }
    
    // Return limited data (without CVV and full card number for security)
    return NextResponse.json({
      success: true,
      data: {
        id: card.id,
        userId: card.userId,
        cardType: card.cardType,
        cardFormat: card.cardFormat,
        currency: card.currency,
        status: card.status,
        lastFourDigits: card.cardNumber.replace(/\s/g, '').slice(-4)
      }
    });
    
  } catch (error) {
    console.error('Get card by token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
