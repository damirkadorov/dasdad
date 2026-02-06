/**
 * Internal Bank Hold API
 * POST /api/internal/hold
 * 
 * Creates a hold on funds in a user's account
 * This is an internal-only endpoint used by NovaPay
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserById, updateUser } from '@/lib/db/database';
import { NovapayCurrency } from '@/lib/novapay/types';

interface HoldRequest {
  accountId: string;
  amount: number;
  currency: NovapayCurrency;
  reference: string;
  expiresAt: string;
}

interface HoldResponse {
  success: boolean;
  holdId?: string;
  message: string;
  availableBalance?: number;
}

export async function POST(request: NextRequest) {
  try {
    // In production, this would check for internal service authentication
    // For sandbox, we allow direct calls
    
    const body: HoldRequest = await request.json();
    
    // Validate required fields
    if (!body.accountId || !body.amount || !body.currency || !body.reference) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      } as HoldResponse, { status: 400 });
    }
    
    // Get the user/account
    const user = await getUserById(body.accountId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Account not found',
      } as HoldResponse, { status: 404 });
    }
    
    // Get balance for the specified currency
    const balances = user.balances || [{ currency: 'USD', amount: user.balance || 0 }];
    const currencyBalance = balances.find(b => b.currency === body.currency);
    
    if (!currencyBalance || currencyBalance.amount < body.amount) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient funds',
        availableBalance: currencyBalance?.amount || 0,
      } as HoldResponse, { status: 422 });
    }
    
    // Create the hold by deducting from available balance
    const holdId = `hold_${uuidv4()}`;
    const newBalance = currencyBalance.amount - body.amount;
    
    const updatedBalances = balances.map(b =>
      b.currency === body.currency
        ? { ...b, amount: newBalance }
        : b
    );
    
    await updateUser(body.accountId, { balances: updatedBalances });
    
    return NextResponse.json({
      success: true,
      holdId,
      message: 'Hold created successfully',
      availableBalance: newBalance,
    } as HoldResponse, { status: 201 });
  } catch (error) {
    console.error('Internal hold error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    } as HoldResponse, { status: 500 });
  }
}
