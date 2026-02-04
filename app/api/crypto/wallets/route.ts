import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser } from '@/lib/db/database';
import { generateCryptoAddress } from '@/lib/utils/crypto';
import { CryptoType, CryptoWallet } from '@/lib/db/types';

/**
 * GET /api/crypto/wallets
 * Get all crypto wallets for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const user = await getUserById(authUser!.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const wallets = user.cryptoWallets || [];

    return NextResponse.json(
      { wallets },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get crypto wallets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crypto/wallets
 * Create a new crypto wallet
 */
export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { cryptoType } = body;

    // Validate input
    if (!cryptoType) {
      return NextResponse.json(
        { error: 'Crypto type is required' },
        { status: 400 }
      );
    }

    // Validate crypto type
    const validCryptos: CryptoType[] = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];
    if (!validCryptos.includes(cryptoType as CryptoType)) {
      return NextResponse.json(
        { error: 'Invalid crypto type' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserById(authUser!.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a wallet for this crypto
    const existingWallets = user.cryptoWallets || [];
    if (existingWallets.some(wallet => wallet.cryptoType === cryptoType)) {
      return NextResponse.json(
        { error: `You already have a ${cryptoType} wallet` },
        { status: 400 }
      );
    }

    // Generate wallet address
    const address = generateCryptoAddress(cryptoType as CryptoType);

    // Create wallet
    const newWallet: CryptoWallet = {
      cryptoType: cryptoType as CryptoType,
      address,
      balance: 0,
      createdAt: new Date().toISOString(),
    };

    // Update user's wallets
    const updatedWallets = [...existingWallets, newWallet];
    await updateUser(user.id, { cryptoWallets: updatedWallets });

    return NextResponse.json(
      {
        message: 'Crypto wallet created successfully',
        wallet: newWallet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create crypto wallet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
