/**
 * Internal Bank Transaction API
 * GET /api/internal/transaction
 * 
 * Retrieves transaction details
 * This is an internal-only endpoint used by NovaPay
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsCollection } from '@/lib/db/mongodb';

interface TransactionResponse {
  success: boolean;
  transaction?: {
    id: string;
    userId: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  };
  message?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('id');
    
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        message: 'Transaction ID is required',
      } as TransactionResponse, { status: 400 });
    }
    
    // Get the transaction
    const transactions = await getTransactionsCollection();
    const transaction = await transactions.findOne({ id: transactionId });
    
    if (!transaction) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found',
      } as TransactionResponse, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status || 'completed',
        createdAt: transaction.createdAt || transaction.timestamp || '',
      },
    } as TransactionResponse);
  } catch (error) {
    console.error('Internal transaction error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    } as TransactionResponse, { status: 500 });
  }
}
