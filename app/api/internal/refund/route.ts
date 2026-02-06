/**
 * Internal Bank Refund API
 * POST /api/internal/refund
 * 
 * Processes a refund from merchant to customer
 * This is an internal-only endpoint used by NovaPay
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserById, updateUser, createTransaction } from '@/lib/db/database';
import { NovapayCurrency } from '@/lib/novapay/types';

interface RefundRequest {
  merchantId: string;
  customerId: string;
  amount: number;
  currency: NovapayCurrency;
  originalTransactionId: string;
  reference: string;
  reason?: string;
}

interface RefundResponse {
  success: boolean;
  refundTransactionId?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefundRequest = await request.json();
    
    // Validate required fields
    if (!body.merchantId || !body.customerId || !body.amount || !body.reference) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      } as RefundResponse, { status: 400 });
    }
    
    // Get the merchant
    const merchant = await getUserById(body.merchantId);
    if (!merchant) {
      return NextResponse.json({
        success: false,
        message: 'Merchant not found',
      } as RefundResponse, { status: 404 });
    }
    
    // Check merchant has sufficient funds
    const merchantBalances = merchant.balances || [{ currency: 'USD', amount: merchant.balance || 0 }];
    const merchantCurrencyBalance = merchantBalances.find(b => b.currency === body.currency);
    
    if (!merchantCurrencyBalance || merchantCurrencyBalance.amount < body.amount) {
      return NextResponse.json({
        success: false,
        message: 'Merchant has insufficient funds for refund',
      } as RefundResponse, { status: 422 });
    }
    
    // Get the customer
    const customer = await getUserById(body.customerId);
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found',
      } as RefundResponse, { status: 404 });
    }
    
    // Deduct from merchant
    const updatedMerchantBalances = merchantBalances.map(b =>
      b.currency === body.currency
        ? { ...b, amount: b.amount - body.amount }
        : b
    );
    await updateUser(body.merchantId, { balances: updatedMerchantBalances });
    
    // Credit to customer
    const customerBalances = customer.balances || [{ currency: 'USD', amount: customer.balance || 0 }];
    const customerCurrencyBalance = customerBalances.find(b => b.currency === body.currency);
    
    const updatedCustomerBalances = customerCurrencyBalance
      ? customerBalances.map(b =>
          b.currency === body.currency
            ? { ...b, amount: b.amount + body.amount }
            : b
        )
      : [...customerBalances, { currency: body.currency, amount: body.amount }];
    
    await updateUser(body.customerId, { balances: updatedCustomerBalances });
    
    // Create refund transaction for merchant
    const refundTransactionId = uuidv4();
    await createTransaction({
      id: refundTransactionId,
      userId: body.merchantId,
      type: 'send',
      amount: -body.amount,
      currency: body.currency,
      description: `Refund: ${body.reference}${body.reason ? ` - ${body.reason}` : ''}`,
      status: 'completed',
      recipientId: body.customerId,
      createdAt: new Date().toISOString(),
    });
    
    // Create refund transaction for customer
    await createTransaction({
      id: uuidv4(),
      userId: body.customerId,
      type: 'receive',
      amount: body.amount,
      currency: body.currency,
      description: `Refund received: ${body.reference}`,
      status: 'completed',
      senderId: body.merchantId,
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      refundTransactionId,
      message: 'Refund processed successfully',
    } as RefundResponse);
  } catch (error) {
    console.error('Internal refund error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    } as RefundResponse, { status: 500 });
  }
}
