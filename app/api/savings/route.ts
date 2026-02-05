import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const savingsAccounts = db.savingsAccounts?.filter((acc) => acc.userId === user.userId) || [];

    return NextResponse.json({ savingsAccounts });
  } catch (error) {
    console.error('Get savings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch savings accounts' },
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
    const { name, currency, initialDeposit, interestRate, termMonths } = body;

    if (!name || !currency || initialDeposit === undefined) {
      return NextResponse.json(
        { error: 'Name, currency, and initial deposit are required' },
        { status: 400 }
      );
    }

    if (initialDeposit < 0) {
      return NextResponse.json(
        { error: 'Initial deposit cannot be negative' },
        { status: 400 }
      );
    }

    const db = getDb();
    const userData = db.users.find((u) => u.id === user.userId);
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has sufficient balance
    if (initialDeposit > 0) {
      const balanceIndex = userData.balances?.findIndex(b => b.currency === currency) ?? -1;
      const currentBalance = balanceIndex >= 0 ? userData.balances![balanceIndex].amount : 0;

      if (currentBalance < initialDeposit) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Deduct from balance
      if (balanceIndex >= 0) {
        userData.balances![balanceIndex].amount -= initialDeposit;
      }
    }

    const savingsAccount = {
      id: crypto.randomUUID(),
      userId: user.userId,
      name,
      currency,
      balance: initialDeposit,
      interestRate: interestRate || 3.5,
      termMonths: termMonths || 12,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      maturityDate: termMonths 
        ? new Date(Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    };

    if (!db.savingsAccounts) db.savingsAccounts = [];
    db.savingsAccounts.push(savingsAccount);

    if (initialDeposit > 0) {
      const transaction = {
        id: crypto.randomUUID(),
        userId: user.userId,
        type: 'SAVINGS_DEPOSIT' as const,
        amount: -initialDeposit,
        currency,
        savingsAccountId: savingsAccount.id,
        timestamp: new Date().toISOString(),
      };

      if (!db.transactions) db.transactions = [];
      db.transactions.push(transaction);
    }

    return NextResponse.json({ success: true, savingsAccount });
  } catch (error) {
    console.error('Create savings account error:', error);
    return NextResponse.json(
      { error: 'Failed to create savings account' },
      { status: 500 }
    );
  }
}
