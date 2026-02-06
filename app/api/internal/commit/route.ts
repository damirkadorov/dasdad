/**
 * Internal Bank Commit API
 * POST /api/internal/commit
 * 
 * Commits a hold and transfers funds to merchant
 * This is an internal-only endpoint used by NovaPay
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserById, updateUser, createTransaction } from '@/lib/db/database';
import { NovapayCurrency } from '@/lib/novapay/types';

interface CommitRequest {
  holdId: string;
  amount: number;
  currency: NovapayCurrency;
  merchantId: string;
  payerId: string;
  reference: string;
  fee: number;
  description: string;
}

interface CommitResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  netAmount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CommitRequest = await request.json();
    
    // Validate required fields
    if (!body.holdId || !body.amount || !body.merchantId || !body.reference) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      } as CommitResponse, { status: 400 });
    }
    
    // Get the merchant
    const merchant = await getUserById(body.merchantId);
    if (!merchant) {
      return NextResponse.json({
        success: false,
        message: 'Merchant not found',
      } as CommitResponse, { status: 404 });
    }
    
    // Calculate net amount after fee
    const netAmount = body.amount - (body.fee || 0);
    
    // Credit merchant balance
    const merchantBalances = merchant.balances || [{ currency: 'USD', amount: merchant.balance || 0 }];
    const merchantCurrencyBalance = merchantBalances.find(b => b.currency === body.currency);
    
    const updatedMerchantBalances = merchantCurrencyBalance
      ? merchantBalances.map(b =>
          b.currency === body.currency
            ? { ...b, amount: b.amount + netAmount }
            : b
        )
      : [...merchantBalances, { currency: body.currency, amount: netAmount }];
    
    await updateUser(body.merchantId, { balances: updatedMerchantBalances });
    
    // Create transaction record for merchant
    const transactionId = uuidv4();
    await createTransaction({
      id: transactionId,
      userId: body.merchantId,
      type: 'receive',
      amount: netAmount,
      currency: body.currency,
      fee: body.fee,
      description: body.description || `Payment received: ${body.reference}`,
      status: 'completed',
      senderId: body.payerId,
      createdAt: new Date().toISOString(),
    });
    
    // Create transaction record for payer
    if (body.payerId) {
      await createTransaction({
        id: uuidv4(),
        userId: body.payerId,
        type: 'send',
        amount: -body.amount,
        currency: body.currency,
        description: body.description || `Payment sent: ${body.reference}`,
        status: 'completed',
        recipientId: body.merchantId,
        createdAt: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Commit successful',
      netAmount,
    } as CommitResponse);
  } catch (error) {
    console.error('Internal commit error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    } as CommitResponse, { status: 500 });
  }
}
