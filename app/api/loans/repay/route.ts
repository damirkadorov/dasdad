import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { loanId, amount, currency } = body;

    if (!loanId || !amount) {
      return NextResponse.json(
        { error: 'Loan ID and amount are required' },
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

    const loan = db.loans?.find((l) => l.id === loanId && l.userId === user.userId);
    
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'active') {
      return NextResponse.json({ error: 'Loan is not active' }, { status: 400 });
    }

    // Check balance
    const balanceIndex = userData.balances?.findIndex(b => b.currency === loan.currency) ?? -1;
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

    // Update loan
    loan.remainingAmount -= amount;
    
    if (loan.remainingAmount <= 0) {
      loan.status = 'paid';
      loan.paidAt = new Date().toISOString();
    } else {
      // Update next payment due date
      loan.nextPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Create transaction
    const transaction = {
      id: crypto.randomUUID(),
      userId: user.userId,
      type: 'LOAN_PAYMENT' as const,
      amount: -amount,
      currency: loan.currency,
      loanId: loan.id,
      timestamp: new Date().toISOString(),
    };

    if (!db.transactions) db.transactions = [];
    db.transactions.push(transaction);

    return NextResponse.json({
      success: true,
      loan,
      transaction,
      newBalance: balanceIndex >= 0 ? userData.balances![balanceIndex].amount : 0,
    });
  } catch (error) {
    console.error('Loan repayment error:', error);
    return NextResponse.json(
      { error: 'Failed to process loan repayment' },
      { status: 500 }
    );
  }
}
