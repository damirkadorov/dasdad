/**
 * Internal Bank Release API
 * POST /api/internal/release
 * 
 * Releases a hold and returns funds to the account
 * This is an internal-only endpoint used by NovaPay
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db/database';
import { NovapayCurrency } from '@/lib/novapay/types';

interface ReleaseRequest {
  holdId: string;
  accountId: string;
  amount: number;
  currency: NovapayCurrency;
  reference: string;
}

interface ReleaseResponse {
  success: boolean;
  message: string;
  newBalance?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ReleaseRequest = await request.json();
    
    // Validate required fields
    if (!body.holdId || !body.accountId || !body.amount || !body.reference) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      } as ReleaseResponse, { status: 400 });
    }
    
    // Get the account
    const user = await getUserById(body.accountId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Account not found',
      } as ReleaseResponse, { status: 404 });
    }
    
    // Release the hold by adding back to available balance
    const balances = user.balances || [{ currency: 'USD', amount: user.balance || 0 }];
    const currencyBalance = balances.find(b => b.currency === body.currency);
    
    const newBalance = (currencyBalance?.amount || 0) + body.amount;
    
    const updatedBalances = currencyBalance
      ? balances.map(b =>
          b.currency === body.currency
            ? { ...b, amount: newBalance }
            : b
        )
      : [...balances, { currency: body.currency, amount: body.amount }];
    
    await updateUser(body.accountId, { balances: updatedBalances });
    
    return NextResponse.json({
      success: true,
      message: 'Hold released successfully',
      newBalance,
    } as ReleaseResponse);
  } catch (error) {
    console.error('Internal release error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    } as ReleaseResponse, { status: 500 });
  }
}
