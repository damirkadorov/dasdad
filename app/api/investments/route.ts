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
    const investments = db.investments?.filter((inv) => inv.userId === user.userId) || [];

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

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const db = getDb();
    const userData = db.users.find((u) => u.id === user.userId);
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check balance
    const balanceIndex = userData.balances?.findIndex(b => b.currency === currency) ?? -1;
    const currentBalance = balanceIndex >= 0 ? userData.balances![balanceIndex].amount : 0;

    if (currentBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Deduct from balance
    if (balanceIndex >= 0) {
      userData.balances![balanceIndex].amount -= amount;
    }

    // Mock prices for different investment types
    const getMockPrice = (type: string, symbol: string) => {
      if (type === 'stock') {
        const prices: { [key: string]: number } = {
          'AAPL': 180.50, 'GOOGL': 140.25, 'MSFT': 380.75,
          'AMZN': 145.30, 'TSLA': 245.60, 'META': 350.20,
        };
        return prices[symbol] || 100;
      } else if (type === 'bond') {
        return 1000; // Par value
      }
      return 50;
    };

    const purchasePrice = getMockPrice(type, symbol);
    const purchasedQuantity = quantity || amount / purchasePrice;

    const investment = {
      id: crypto.randomUUID(),
      userId: user.userId,
      type, // 'stock', 'bond', 'etf'
      symbol,
      quantity: purchasedQuantity,
      purchasePrice,
      currentPrice: purchasePrice,
      purchaseAmount: amount,
      currentValue: amount,
      currency,
      status: 'active' as const,
      purchasedAt: new Date().toISOString(),
    };

    if (!db.investments) db.investments = [];
    db.investments.push(investment);

    // Create transaction
    const transaction = {
      id: crypto.randomUUID(),
      userId: user.userId,
      type: 'INVESTMENT_BUY' as const,
      amount: -amount,
      currency,
      investmentId: investment.id,
      investmentType: type,
      symbol,
      timestamp: new Date().toISOString(),
    };

    if (!db.transactions) db.transactions = [];
    db.transactions.push(transaction);

    return NextResponse.json({
      success: true,
      investment,
      newBalance: balanceIndex >= 0 ? userData.balances![balanceIndex].amount : 0,
    });
  } catch (error) {
    console.error('Create investment error:', error);
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    );
  }
}
