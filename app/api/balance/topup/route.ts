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

    // Initialize balances if not present
    const userBalances = user.balances || [{ currency: 'USD', amount: user.balance || 0 }];
    const currencyBalance = userBalances.find(b => b.currency === currency);
    const balanceBefore = currencyBalance ? currencyBalance.amount : 0;
    const balanceAfter = balanceBefore + amount;

    // Update or add balance for the specified currency
    let updatedBalances;
    if (currencyBalance) {
      updatedBalances = userBalances.map(b => 
        b.currency === currency ? { ...b, amount: balanceAfter } : b
      );
    } else {
      updatedBalances = [...userBalances, { currency: currency as Currency, amount: balanceAfter }];
    }

    // Update user balance in MongoDB
    const updatedUser = await updateUser(user.id, { 
      balances: updatedBalances,
      balance: currency === 'USD' ? balanceAfter : user.balance // Update legacy balance if USD
    });
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
        currency,
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
