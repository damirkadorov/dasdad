import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { 
  getUserById, 
  updateUser, 
  getSavingsAccountsByUserId, 
  createSavingsAccount, 
  createTransaction 
} from '@/lib/db/database';
import { SavingsAccount, Currency } from '@/lib/db/types';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savingsAccounts = await getSavingsAccountsByUserId(user.userId);
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
    const { name, currency, initialDeposit = 0, interestRate, termMonths } = body;

    if (!name || !currency) {
      return NextResponse.json(
        { error: 'Name and currency are required' },
        { status: 400 }
      );
    }

    const deposit = Number(initialDeposit);
    if (deposit < 0) {
      return NextResponse.json(
        { error: 'Initial deposit cannot be negative' },
        { status: 400 }
      );
    }

    const userData = await getUserById(user.userId);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize balances
    const userBalances = userData.balances && userData.balances.length > 0
      ? userData.balances
      : [{ currency: 'USD' as Currency, amount: userData.balance || 0 }];

    const balanceIndex = userBalances.findIndex(b => b.currency === currency);
    const currentBalance = balanceIndex >= 0 
      ? userBalances[balanceIndex].amount 
      : (currency === 'USD' ? (userData.balance || 0) : 0);

    if (deposit > 0 && currentBalance < deposit) {
      return NextResponse.json(
        { error: `Insufficient ${currency} balance. You need ${deposit.toFixed(2)} ${currency} but only have ${currentBalance.toFixed(2)} ${currency}.` },
        { status: 400 }
      );
    }

    let updatedBalances = userBalances;
    let newBal = currentBalance;

    if (deposit > 0) {
      newBal = currentBalance - deposit;
      updatedBalances = balanceIndex >= 0
        ? userBalances.map((b, idx) => idx === balanceIndex ? { ...b, amount: newBal } : b)
        : [...userBalances, { currency: currency as Currency, amount: newBal }];

      await updateUser(userData.id, {
        balances: updatedBalances,
        balance: currency === 'USD' ? newBal : userData.balance
      });
    }

    const savingsAccount: SavingsAccount = {
      id: crypto.randomUUID(),
      userId: user.userId,
      name,
      currency: currency as Currency,
      balance: deposit,
      interestRate: interestRate || 3.5,
      termMonths: termMonths || 12,
      status: 'active',
      createdAt: new Date().toISOString(),
      maturityDate: termMonths 
        ? new Date(Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    };

    await createSavingsAccount(savingsAccount);

    if (deposit > 0) {
      await createTransaction({
        id: crypto.randomUUID(),
        userId: user.userId,
        type: 'SAVINGS_DEPOSIT' as any,
        amount: -deposit,
        currency: currency as Currency,
        description: `Deposit to high-yield savings: ${name}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      savingsAccount,
      newBalance: newBal
    });
  } catch (error) {
    console.error('Create savings account error:', error);
    return NextResponse.json(
      { error: 'Failed to create savings account' },
      { status: 500 }
    );
  }
}
