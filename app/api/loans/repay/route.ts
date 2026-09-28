import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { 
  getUserById, 
  updateUser, 
  getLoanById, 
  updateLoan, 
  createTransaction 
} from '@/lib/db/database';
import { Currency } from '@/lib/db/types';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { loanId, amount } = body;

    if (!loanId || !amount) {
      return NextResponse.json(
        { error: 'Loan ID and amount are required' },
        { status: 400 }
      );
    }

    const repayAmount = Number(amount);
    if (repayAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const userData = await getUserById(user.userId);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const loan = await getLoanById(loanId);
    if (!loan || loan.userId !== user.userId) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'active') {
      return NextResponse.json({ error: 'Loan is not active' }, { status: 400 });
    }

    // Initialize user balances
    const userBalances = userData.balances && userData.balances.length > 0
      ? userData.balances
      : [{ currency: 'USD' as Currency, amount: userData.balance || 0 }];

    const balanceIndex = userBalances.findIndex(b => b.currency === loan.currency);
    const currentBalance = balanceIndex >= 0 
      ? userBalances[balanceIndex].amount 
      : (loan.currency === 'USD' ? (userData.balance || 0) : 0);

    if (currentBalance < repayAmount) {
      return NextResponse.json(
        { error: `Insufficient ${loan.currency} balance. You need ${repayAmount.toFixed(2)} ${loan.currency} but only have ${currentBalance.toFixed(2)} ${loan.currency}.` },
        { status: 400 }
      );
    }

    // Deduct from balance
    const balanceAfter = currentBalance - repayAmount;
    const updatedBalances = balanceIndex >= 0
      ? userBalances.map((b, idx) => idx === balanceIndex ? { ...b, amount: balanceAfter } : b)
      : [...userBalances, { currency: loan.currency as Currency, amount: balanceAfter }];

    // Persist user balance in MongoDB
    await updateUser(userData.id, {
      balances: updatedBalances,
      balance: loan.currency === 'USD' ? balanceAfter : userData.balance
    });

    // Update loan in MongoDB
    const remainingAmount = Math.max(0, loan.remainingAmount - repayAmount);
    const newStatus = remainingAmount <= 0 ? 'paid' : 'active';

    const updatedLoan = await updateLoan(loan.id, {
      remainingAmount,
      status: newStatus,
      paidAt: newStatus === 'paid' ? new Date().toISOString() : undefined,
      nextPaymentDue: newStatus === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    });

    // Create transaction in MongoDB
    const transaction = await createTransaction({
      id: crypto.randomUUID(),
      userId: user.userId,
      type: 'LOAN_PAYMENT' as any,
      amount: -repayAmount,
      currency: loan.currency as Currency,
      description: `Loan Repayment (Remaining: ${remainingAmount.toFixed(2)} ${loan.currency})`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      loan: updatedLoan || { ...loan, remainingAmount, status: newStatus },
      transaction,
      newBalance: balanceAfter,
    });
  } catch (error) {
    console.error('Loan repayment error:', error);
    return NextResponse.json(
      { error: 'Failed to process loan repayment' },
      { status: 500 }
    );
  }
}
