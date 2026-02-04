import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTransactionsByUserId } from '@/lib/db/database';

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    // Get transactions from MongoDB
    const transactions = await getTransactionsByUserId(user!.userId);

    return NextResponse.json(
      { transactions },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
