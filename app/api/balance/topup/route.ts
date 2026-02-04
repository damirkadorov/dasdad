import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser, createTransaction } from '@/lib/db/database';
import { Currency } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { amount, currency = 'USD' } = body;

    // Validate amount
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

    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + amount;

    // Update user balance in MongoDB
    const updatedUser = await updateUser(user.id, { balance: balanceAfter });
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      );
    }

    // Create transaction record in MongoDB
    await createTransaction({
      id: uuidv4(),
      userId: user.id,
      type: 'top_up',
      amount,
      currency: currency as Currency,
      balanceBefore,
      balanceAfter,
      fee: 0,
      description: `Balance top-up (${currency})`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      {
        message: 'Balance topped up successfully',
        balance: balanceAfter,
        transaction: {
          amount,
          currency,
          balanceBefore,
          balanceAfter,
          type: 'top_up'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Top-up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
