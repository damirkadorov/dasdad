import { NextResponse } from 'next/server';
import { getCurrentUser } from './jwt';

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      ),
      user: null
    };
  }
  
  return { error: null, user };
}
