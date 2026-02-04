import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, getTradesByUserId } from '@/lib/db/database';
import { calculatePortfolioValue, getCryptoPrice, cryptoToFiat } from '@/lib/utils/crypto';
import { convertCurrency } from '@/lib/utils/currency';
import { Currency } from '@/lib/db/types';

/**
 * GET /api/crypto/portfolio
 * Get user's complete portfolio (fiat + crypto)
 */
export async function GET(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get('currency') || 'USD') as Currency;

    // Get user
    const user = await getUserById(authUser!.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get trade history
    const trades = await getTradesByUserId(user.id);

    // Calculate fiat balances
    const fiatBalances = user.balances || [];
    const totalFiatValue = fiatBalances.reduce((sum, bal) => {
      return sum + convertCurrency(bal.amount, bal.currency, currency);
    }, 0);

    // Calculate crypto holdings
    const cryptoWallets = user.cryptoWallets || [];
    const cryptoHoldings = cryptoWallets.map(wallet => ({
      cryptoType: wallet.cryptoType,
      balance: wallet.balance,
      valueInFiat: cryptoToFiat(wallet.balance, wallet.cryptoType, currency),
      currentPrice: getCryptoPrice(wallet.cryptoType, currency),
    }));

    const totalCryptoValue = cryptoHoldings.reduce((sum, holding) => sum + holding.valueInFiat, 0);
    const totalValue = totalFiatValue + totalCryptoValue;

    // Portfolio distribution
    const portfolioDistribution = {
      fiat: {
        percentage: totalValue > 0 ? (totalFiatValue / totalValue) * 100 : 0,
        value: totalFiatValue,
      },
      crypto: {
        percentage: totalValue > 0 ? (totalCryptoValue / totalValue) * 100 : 0,
        value: totalCryptoValue,
      },
    };

    return NextResponse.json(
      {
        portfolio: {
          currency,
          totalValue,
          fiat: {
            balances: fiatBalances.map(bal => ({
              currency: bal.currency,
              amount: bal.amount,
              valueInDisplayCurrency: convertCurrency(bal.amount, bal.currency, currency),
            })),
            totalValue: totalFiatValue,
          },
          crypto: {
            holdings: cryptoHoldings,
            totalValue: totalCryptoValue,
          },
          distribution: portfolioDistribution,
          recentTrades: trades.slice(0, 10), // Last 10 trades
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get portfolio error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
