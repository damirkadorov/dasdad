import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, createBankAccount, getBankAccountsByUserId, updateUser } from '@/lib/db/database';
import { generateIBAN, generateBIC } from '@/lib/utils/iban';
import { Currency } from '@/lib/db/types';

/**
 * GET /api/bank-accounts
 * Get all bank accounts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const bankAccounts = await getBankAccountsByUserId(authUser!.userId);

    return NextResponse.json(
      { bankAccounts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get bank accounts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bank-accounts
 * Create a new bank account with IBAN
 */
export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { currency, accountHolder } = body;

    // Validate input
    if (!currency || !accountHolder) {
      return NextResponse.json(
        { error: 'Currency and account holder name are required' },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(currency as Currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserById(authUser!.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a bank account for this currency
    const existingAccounts = await getBankAccountsByUserId(user.id);
    if (existingAccounts.some(acc => acc.currency === currency && acc.status === 'active')) {
      return NextResponse.json(
        { error: `You already have an active ${currency} bank account` },
        { status: 400 }
      );
    }

    // Generate IBAN and BIC
    const iban = generateIBAN(currency as Currency, user.id);
    const bic = generateBIC(currency as Currency);

    // Create bank account
    const bankAccountId = uuidv4();
    const bankAccount = await createBankAccount({
      id: bankAccountId,
      userId: user.id,
      iban,
      bic,
      currency: currency as Currency,
      accountHolder,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    // Update user's bank account IDs
    const updatedBankAccountIds = [...(user.bankAccountIds || []), bankAccountId];
    await updateUser(user.id, { bankAccountIds: updatedBankAccountIds });

    return NextResponse.json(
      {
        message: 'Bank account created successfully',
        bankAccount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create bank account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
