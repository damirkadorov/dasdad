import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser, createTransaction, getCardById } from '@/lib/db/database';

export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { amount, cardId, description } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be greater than 0' },
        { status: 400 }
      );
    }

    // Get user
    const user = getUserById(authUser!.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Verify card if provided
    if (cardId) {
      const card = getCardById(cardId);
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

    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore - amount;

    // Update user balance
    updateUser(user.id, { balance: balanceAfter });

    // Create transaction record
    createTransaction({
      id: uuidv4(),
      userId: user.id,
      type: 'nfc_payment',
      amount: -amount,
      balanceBefore,
      balanceAfter,
      cardId,
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
