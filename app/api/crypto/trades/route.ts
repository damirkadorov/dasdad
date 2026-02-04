import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTradesByUserId } from '@/lib/db/database';

/**
 * GET /api/crypto/trades
 * Get user's trade history
 */
export async function GET(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const trades = await getTradesByUserId(authUser!.userId);

    return NextResponse.json(
      { trades: trades || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get trades error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
