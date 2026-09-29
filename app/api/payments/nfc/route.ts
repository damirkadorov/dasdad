import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser, createTransaction, getCardById } from '@/lib/db/database';
import { Currency } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { amount, cardId, description, currency = 'USD' } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be greater than 0' },
        { status: 400 }
      );
    }

    // Get user from MongoDB
    const user = await getUserById(authUser!.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify card if provided (from MongoDB)
    let card = null;
    if (cardId) {
      card = await getCardById(cardId);
      if (!card) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        );
      }

      if (card.userId !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      if (card.status === 'frozen') {
        return NextResponse.json(
          { error: 'Card is frozen' },
          { status: 400 }
        );
      }
    }

    const validCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(currency as Currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    const paymentCurrency: Currency = card ? card.currency : currency as Currency;
    const userBalances = user.balances && user.balances.length > 0
      ? user.balances
      : [{ currency: 'USD' as Currency, amount: user.balance || 0 }];

    const balanceIndex = userBalances.findIndex(b => b.currency === paymentCurrency);
    const balanceBefore = balanceIndex >= 0 
      ? userBalances[balanceIndex].amount 
      : (paymentCurrency === 'USD' ? (user.balance || 0) : 0);

    if (balanceBefore < amount) {
      return NextResponse.json(
        { error: `Insufficient ${paymentCurrency} balance` },
        { status: 400 }
      );
    }

    const balanceAfter = balanceBefore - amount;
    const updatedBalances = balanceIndex >= 0
      ? userBalances.map((b, idx) => idx === balanceIndex ? { ...b, amount: balanceAfter } : b)
      : [...userBalances, { currency: paymentCurrency, amount: balanceAfter }];

    // Update user balance in MongoDB
    await updateUser(user.id, { 
      balances: updatedBalances,
      balance: paymentCurrency === 'USD' ? balanceAfter : user.balance 
    });

    // Create transaction record in MongoDB
    await createTransaction({
      id: uuidv4(),
      userId: user.id,
      type: 'nfc_payment',
      amount: -amount,
      currency: paymentCurrency,
      balanceBefore,
      balanceAfter,
      cardId,
      fee: 0,
      description: description || 'NFC Payment',
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      {
        message: 'NFC payment completed successfully',
        transaction: {
          amount: -amount,
          balanceBefore,
          balanceAfter,
          type: 'nfc_payment'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('NFC payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
