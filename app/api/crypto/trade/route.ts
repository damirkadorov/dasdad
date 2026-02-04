import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser, createTransaction, createTrade } from '@/lib/db/database';
import { getCryptoPrice, cryptoToFiat, fiatToCrypto, calculateCryptoFee } from '@/lib/utils/crypto';
import { CryptoType, Currency } from '@/lib/db/types';
import { sendCryptoTradeNotification } from '@/lib/utils/email';

/**
 * POST /api/crypto/trade
 * Buy or sell cryptocurrency
 */
export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { type, cryptoType, amount, currency } = body;

    // Validate input
    if (!type || !cryptoType || !amount || !currency) {
      return NextResponse.json(
        { error: 'Type, crypto type, amount, and currency are required' },
        { status: 400 }
      );
    }

    if (!['buy', 'sell'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "buy" or "sell"' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
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

    // Initialize arrays if they don't exist
    const cryptoWallets = user.cryptoWallets || [];
    const balances = user.balances || [];

    // Find wallet
    const walletIndex = cryptoWallets.findIndex(w => w.cryptoType === cryptoType);
    if (walletIndex === -1) {
      return NextResponse.json(
        { error: `You don't have a ${cryptoType} wallet. Create one first.` },
        { status: 400 }
      );
    }

    // Find or create currency balance
    let currencyBalanceIndex = balances.findIndex(b => b.currency === currency);
    if (currencyBalanceIndex === -1) {
      balances.push({ currency: currency as Currency, amount: 0 });
      currencyBalanceIndex = balances.length - 1;
    }

    const currentBalance = balances[currencyBalanceIndex].amount;
    const currentCryptoBalance = cryptoWallets[walletIndex].balance;

    let cryptoAmount: number;
    let fiatAmount: number;
    let fee: number;
    let newBalance: number;
    let newCryptoBalance: number;

    if (type === 'buy') {
      // Buy crypto with fiat
      fiatAmount = amount;
      cryptoAmount = fiatToCrypto(fiatAmount, currency as Currency, cryptoType as CryptoType);
      fee = fiatAmount * 0.01; // 1% fee
      const totalCost = fiatAmount + fee;

      // Check balance
      if (currentBalance < totalCost) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      newBalance = currentBalance - totalCost;
      newCryptoBalance = currentCryptoBalance + cryptoAmount;
    } else {
      // Sell crypto for fiat
      cryptoAmount = amount;
      fiatAmount = cryptoToFiat(cryptoAmount, cryptoType as CryptoType, currency as Currency);
      fee = fiatAmount * 0.01; // 1% fee
      const netAmount = fiatAmount - fee;

      // Check crypto balance
      if (currentCryptoBalance < cryptoAmount) {
        return NextResponse.json(
          { error: 'Insufficient crypto balance' },
          { status: 400 }
        );
      }

      newBalance = currentBalance + netAmount;
      newCryptoBalance = currentCryptoBalance - cryptoAmount;
    }

    // Update balances
    balances[currencyBalanceIndex].amount = newBalance;
    cryptoWallets[walletIndex].balance = newCryptoBalance;

    await updateUser(user.id, {
      balances,
      cryptoWallets,
      balance: newBalance, // Update legacy balance if using USD
    });

    // Create trade record
    const trade = await createTrade({
      id: uuidv4(),
      userId: user.id,
      type: type as 'buy' | 'sell',
      cryptoType: cryptoType as CryptoType,
      cryptoAmount,
      fiatCurrency: currency as Currency,
      fiatAmount,
      price: getCryptoPrice(cryptoType as CryptoType, currency as Currency),
      fee,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Create transaction record
    await createTransaction({
      id: uuidv4(),
      userId: user.id,
      type: type === 'buy' ? 'crypto_buy' : 'crypto_sell',
      amount: type === 'buy' ? -fiatAmount : fiatAmount,
      currency: currency as Currency,
      cryptoAmount,
      cryptoType: cryptoType as CryptoType,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      fee,
      description: `${type === 'buy' ? 'Bought' : 'Sold'} ${cryptoAmount.toFixed(8)} ${cryptoType}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Send email notification (don't wait for it)
    sendCryptoTradeNotification(
      user.email,
      user.username,
      type as 'buy' | 'sell',
      cryptoAmount,
      cryptoType,
      fiatAmount,
      currency
    ).catch(err => console.error('Failed to send email:', err));

    return NextResponse.json(
      {
        message: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${cryptoType}`,
        trade: {
          type,
          cryptoAmount,
          fiatAmount,
          fee,
          newBalance,
          newCryptoBalance,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Crypto trade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
