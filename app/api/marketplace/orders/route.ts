import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getOrdersByBuyerId, getOrdersBySellerId } from '@/lib/db/database';

// GET - Get user's orders (as buyer or seller)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const userId = authUser!.userId;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'purchases'; // 'purchases' or 'sales'

    let orders;
    if (type === 'sales') {
      orders = await getOrdersBySellerId(userId);
    } else {
      orders = await getOrdersByBuyerId(userId);
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
