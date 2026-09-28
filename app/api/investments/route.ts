import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { 
  getUserById, 
  updateUser, 
  getInvestmentsByUserId, 
  createInvestment, 
  createTransaction 
} from '@/lib/db/database';
import { Investment, Currency } from '@/lib/db/types';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const investments = await getInvestmentsByUserId(user.userId);
    return NextResponse.json({ investments });
  } catch (error) {
    console.error('Get investments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
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
    const { type, symbol, amount, currency, quantity } = body;

    if (!type || !symbol || !amount || !currency) {
      return NextResponse.json(
        { error: 'Type, symbol, amount, and currency are required' },
        { status: 400 }
      );
    }

    const investmentAmount = Number(amount);
    if (investmentAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const userData = await getUserById(user.userId);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize user balances
    const userBalances = userData.balances && userData.balances.length > 0
      ? userData.balances
      : [{ currency: 'USD' as Currency, amount: userData.balance || 0 }];

    const balanceIndex = userBalances.findIndex(b => b.currency === currency);
    const currentBalance = balanceIndex >= 0 
      ? userBalances[balanceIndex].amount 
      : (currency === 'USD' ? (userData.balance || 0) : 0);

    if (currentBalance < investmentAmount) {
      return NextResponse.json(
        { error: `Insufficient ${currency} balance. You need ${investmentAmount.toFixed(2)} ${currency} but only have ${currentBalance.toFixed(2)} ${currency}.` },
        { status: 400 }
      );
    }

    // Deduct from balance
    const balanceAfter = currentBalance - investmentAmount;
    const updatedBalances = balanceIndex >= 0
      ? userBalances.map((b, idx) => idx === balanceIndex ? { ...b, amount: balanceAfter } : b)
      : [...userBalances, { currency: currency as Currency, amount: balanceAfter }];

    // Persist user balance in MongoDB
    await updateUser(userData.id, {
      balances: updatedBalances,
      balance: currency === 'USD' ? balanceAfter : userData.balance
    });

    // Mock prices for different investment types
    const getMockPrice = (t: string, s: string) => {
      if (t === 'stock') {
        const prices: { [key: string]: number } = {
          'AAPL': 180.50, 'GOOGL': 140.25, 'MSFT': 380.75,
          'AMZN': 145.30, 'TSLA': 245.60, 'META': 350.20,
        };
        return prices[s] || 100;
      } else if (t === 'bond') {
        return 1000;
      }
      return 50;
    };

    const purchasePrice = getMockPrice(type, symbol);
    const purchasedQuantity = quantity || investmentAmount / purchasePrice;

    const investment: Investment = {
      id: crypto.randomUUID(),
      userId: user.userId,
      type,
      symbol,
      quantity: purchasedQuantity,
      purchasePrice,
      currentPrice: purchasePrice,
      purchaseAmount: investmentAmount,
      currentValue: investmentAmount,
      currency: currency as Currency,
      status: 'active',
      purchasedAt: new Date().toISOString(),
    };

    await createInvestment(investment);

    // Create transaction in MongoDB
    await createTransaction({
      id: crypto.randomUUID(),
      userId: user.userId,
      type: 'INVESTMENT_BUY' as any,
      amount: -investmentAmount,
      currency: currency as Currency,
      description: `Stock/ETF Purchase: ${purchasedQuantity.toFixed(2)} shares of ${symbol}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      investment,
      newBalance: balanceAfter,
    });
  } catch (error) {
    console.error('Create investment error:', error);
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    );
  }
}
