import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser, createTransaction, getLoansByUserId, createLoan } from '@/lib/db/database';
import { Currency, Loan } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const loans = await getLoansByUserId(authUser!.userId);

    return NextResponse.json({ loans });
  } catch (error) {
    console.error('Get loans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { amount, currency, termMonths, purpose } = body;

    if (!amount || !currency || !termMonths || !purpose) {
      return NextResponse.json(
        { error: 'Amount, currency, term, and purpose are required' },
        { status: 400 }
      );
    }

    if (amount <= 0 || termMonths <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount or term' },
        { status: 400 }
      );
    }

    const userData = await getUserById(authUser!.userId);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate interest rate based on amount and term
    let interestRate = 5.5; // base rate
    if (amount > 100000) interestRate = 4.5;
    else if (amount > 50000) interestRate = 5.0;
    
    if (termMonths > 60) interestRate += 0.5;

    // Calculate monthly payment using simple interest
    const totalInterest = (amount * interestRate * termMonths) / (12 * 100);
    const totalAmount = amount + totalInterest;
    const monthlyPayment = totalAmount / termMonths;

    const loan: Loan = {
      id: uuidv4(),
      userId: authUser!.userId,
      amount,
      currency: currency as Currency,
      termMonths,
      interestRate,
      monthlyPayment,
      remainingAmount: totalAmount,
      purpose,
      status: 'active',
      disbursedAt: new Date().toISOString(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    await createLoan(loan);

    // Add disbursed amount to user's balance
    const userBalances = userData.balances || [];
    const balanceIndex = userBalances.findIndex(b => b.currency === currency);
    
    const updatedBalances = [...userBalances];
    if (balanceIndex >= 0) {
      updatedBalances[balanceIndex] = {
        ...updatedBalances[balanceIndex],
        amount: updatedBalances[balanceIndex].amount + amount
      };
    } else {
      updatedBalances.push({ currency: currency as Currency, amount });
    }

    await updateUser(userData.id, { balances: updatedBalances });

    // Create transaction
    await createTransaction({
      id: uuidv4(),
      userId: authUser!.userId,
      type: 'LOAN_DISBURSED',
      amount,
      currency: currency as Currency,
      loanId: loan.id,
      timestamp: new Date().toISOString(),
    });

    const newBalance = balanceIndex >= 0 ? updatedBalances[balanceIndex].amount : amount;

    return NextResponse.json({ 
      success: true,
      loan,
      newBalance,
      message: 'Loan approved and disbursed successfully'
    });
  } catch (error) {
    console.error('Create loan error:', error);
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
