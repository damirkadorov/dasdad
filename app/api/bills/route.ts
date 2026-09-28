import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { 
  getUserById, 
  updateUser, 
  getBillsByUserId, 
  getBillById, 
  updateBill, 
  createBill, 
  createTransaction 
} from '@/lib/db/database';
import { Bill, Currency } from '@/lib/db/types';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let bills = await getBillsByUserId(user.userId);

    // Seed realistic bills if user has none yet
    if (bills.length === 0) {
      const initialBills: Bill[] = [
        {
          id: crypto.randomUUID(),
          userId: user.userId,
          title: 'Cloud VPS Infrastructure',
          provider: 'DigitalOcean / AWS',
          type: 'utility',
          amount: 45.00,
          currency: 'USD',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          userId: user.userId,
          title: 'High-Speed Fiber Internet',
          provider: 'Starlink Fiber',
          type: 'internet',
          amount: 60.00,
          currency: 'USD',
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          userId: user.userId,
          title: 'Green Energy Electricity Grid',
          provider: 'NextGen Power Grid',
          type: 'electricity',
          amount: 85.50,
          currency: 'USD',
          dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
      ];

      for (const b of initialBills) {
        await createBill(b);
      }
      bills = initialBills;
    }

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

    const userData = await getUserById(user.userId);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bill = await getBillById(billId);
    if (!bill || bill.userId !== user.userId) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (bill.status === 'paid') {
      return NextResponse.json({ error: 'Bill already paid' }, { status: 400 });
    }

    const paymentAmount = Number(amount || bill.amount);

    // Initialize user balances
    const userBalances = userData.balances && userData.balances.length > 0
      ? userData.balances
      : [{ currency: 'USD' as Currency, amount: userData.balance || 0 }];

    const balanceIndex = userBalances.findIndex(b => b.currency === bill.currency);
    const currentBalance = balanceIndex >= 0 
      ? userBalances[balanceIndex].amount 
      : (bill.currency === 'USD' ? (userData.balance || 0) : 0);

    if (currentBalance < paymentAmount) {
      return NextResponse.json(
        { error: `Insufficient ${bill.currency} balance. You need ${paymentAmount.toFixed(2)} ${bill.currency} but only have ${currentBalance.toFixed(2)} ${bill.currency}.` },
        { status: 400 }
      );
    }

    // Deduct from balance
    const balanceAfter = currentBalance - paymentAmount;
    const updatedBalances = balanceIndex >= 0
      ? userBalances.map((b, idx) => idx === balanceIndex ? { ...b, amount: balanceAfter } : b)
      : [...userBalances, { currency: bill.currency as Currency, amount: balanceAfter }];

    // Persist to MongoDB
    await updateUser(userData.id, {
      balances: updatedBalances,
      balance: bill.currency === 'USD' ? balanceAfter : userData.balance
    });

    // Update bill in MongoDB
    const updatedBill = await updateBill(bill.id, {
      status: 'paid',
      paidAt: new Date().toISOString()
    });

    // Create transaction in MongoDB
    const transaction = await createTransaction({
      id: crypto.randomUUID(),
      userId: user.userId,
      type: 'BILL_PAYMENT' as any,
      amount: -paymentAmount,
      currency: bill.currency,
      description: `Bill Payment - ${bill.title || bill.type}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      bill: updatedBill || { ...bill, status: 'paid', paidAt: new Date().toISOString() },
      transaction,
      newBalance: balanceAfter,
    });
  } catch (error) {
    console.error('Pay bill error:', error);
    return NextResponse.json(
      { error: 'Failed to pay bill' },
      { status: 500 }
    );
  }
}
