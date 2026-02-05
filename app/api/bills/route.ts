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
    const bills = db.bills?.filter((bill) => bill.userId === user.userId) || [];

    return NextResponse.json({ bills });
  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
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
    const { billId, amount } = body;

    if (!billId) {
      return NextResponse.json(
        { error: 'Bill ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const userData = db.users.find((u) => u.id === user.userId);
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bill = db.bills?.find((b) => b.id === billId && b.userId === user.userId);
    
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (bill.status === 'paid') {
      return NextResponse.json({ error: 'Bill already paid' }, { status: 400 });
    }

    const paymentAmount = amount || bill.amount;

    // Check balance
    const balanceIndex = userData.balances?.findIndex(b => b.currency === bill.currency) ?? -1;
    const currentBalance = balanceIndex >= 0 ? userData.balances![balanceIndex].amount : 0;

    if (currentBalance < paymentAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Deduct from balance
    if (balanceIndex >= 0) {
      userData.balances![balanceIndex].amount -= paymentAmount;
    }

    // Update bill
    bill.status = 'paid';
    bill.paidAt = new Date().toISOString();

    // Create transaction
    const transaction = {
      id: crypto.randomUUID(),
      userId: user.userId,
      type: 'BILL_PAYMENT' as const,
      amount: -paymentAmount,
      currency: bill.currency,
      billId: bill.id,
      billType: bill.type,
      timestamp: new Date().toISOString(),
    };

    if (!db.transactions) db.transactions = [];
    db.transactions.push(transaction);

    return NextResponse.json({
      success: true,
      bill,
      transaction,
      newBalance: balanceIndex >= 0 ? userData.balances![balanceIndex].amount : 0,
    });
  } catch (error) {
    console.error('Pay bill error:', error);
    return NextResponse.json(
      { error: 'Failed to pay bill' },
      { status: 500 }
    );
  }
}
