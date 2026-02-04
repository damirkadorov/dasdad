import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/db/database';
import { hashPassword } from '@/lib/auth/password';
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';
import { validateEmail, validatePassword } from '@/lib/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if user already exists (using MongoDB now)
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Hash password using bcrypt
    const passwordHash = await hashPassword(password);

    // Create user in MongoDB
    const newUser = await createUser({
      id: uuidv4(),
      email,
      username,
      passwordHash,
      balance: 0,
      createdAt: new Date().toISOString()
    });

    // Generate JWT token signed with JWT_SECRET
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username
    });

    // Set httpOnly cookie
    await setAuthCookie(token);

    // Return user data (without password hash)
    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          balance: newUser.balance,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
