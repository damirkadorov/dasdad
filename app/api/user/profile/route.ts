import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById } from '@/lib/db/database';

export async function GET() {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    // Get user from MongoDB
    const user = await getUserById(authUser!.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          balance: user.balance,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
