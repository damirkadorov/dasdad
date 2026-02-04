import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/database';
import { comparePassword } from '@/lib/auth/password';
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email in MongoDB
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token signed with JWT_SECRET
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    // Set httpOnly cookie
    await setAuthCookie(token);

    // Return user data (without password hash)
    return NextResponse.json(
      {
        message: 'Login successful',
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
