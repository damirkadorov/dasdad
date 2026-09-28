import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { 
  getUserById, 
  getCreditCardsByUserId, 
  createCreditCard 
} from '@/lib/db/database';
import { CreditCard, Currency } from '@/lib/db/types';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creditCards = await getCreditCardsByUserId(user.userId);
    return NextResponse.json({ creditCards });
  } catch (error) {
    console.error('Get credit cards error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardType, currency, requestedLimit } = body;

    if (!cardType || !currency) {
      return NextResponse.json(
        { error: 'Card type and currency are required' },
        { status: 400 }
      );
    }

    const userData = await getUserById(user.userId);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check existing credit cards limit (max 3) from MongoDB
    const existingCards = await getCreditCardsByUserId(user.userId);
    if (existingCards.length >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 credit cards allowed' },
        { status: 400 }
      );
    }

    // Calculate credit limit based on requested amount
    const creditLimit = requestedLimit || 5000;
    const apr = 18.9; // Annual Percentage Rate

    // Generate NovaPay card number using Luhn algorithm (starts with 72)
    const generateCardNumber = () => {
      let cardNumber = '72';
      for (let i = 0; i < 13; i++) {
        cardNumber += Math.floor(Math.random() * 10);
      }
      let sum = 0;
      let shouldDouble = true;
      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      return cardNumber + checkDigit;
    };

    const creditCard: CreditCard = {
      id: crypto.randomUUID(),
      userId: user.userId,
      cardNumber: generateCardNumber(),
      cardType: 'NovaPay Credit',
      currency: currency as Currency,
      creditLimit,
      availableCredit: creditLimit,
      usedCredit: 0,
      apr,
      minimumPayment: 0,
      statementBalance: 0,
      nextStatementDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentDueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      rewards: 0,
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      expiryDate: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear() + 5).slice(-2)}`,
      createdAt: new Date().toISOString(),
    };

    await createCreditCard(creditCard);

    return NextResponse.json({ success: true, creditCard });
  } catch (error) {
    console.error('Create credit card error:', error);
    return NextResponse.json(
      { error: 'Failed to create credit card' },
      { status: 500 }
    );
  }
}
