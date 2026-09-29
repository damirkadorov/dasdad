'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import CurrencyConverter from '@/components/converter/CurrencyConverter';
import { formatCurrencyAmount } from '@/lib/utils/currency';
import { formatCryptoAmount, calculatePortfolioValue, getCryptoName, cryptoToFiat, getCryptoPrice } from '@/lib/utils/crypto';
import { CryptoWallet, Currency, Trade } from '@/lib/db/types';

// Dynamically import Recharts to avoid SSR issues
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });

interface UserProfile {
  cryptoWallets: CryptoWallet[];
  preferredCurrency: Currency;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, tradesRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/crypto/trades')
      ]);

      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileRes.json();
      setProfile(profileData.user);

      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setTrades(tradesData.trades || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#07090D]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl space-y-6">
          <Skeleton variant="text" width={220} height={36} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton variant="card" height={220} />
            <div className="lg:col-span-2">
              <Skeleton variant="card" height={220} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton variant="card" height={300} />
            <Skeleton variant="card" height={300} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#07090D]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-xl text-center">
          <div className="bezel-card">
            <div className="bezel-card-inner p-8">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{error}</h2>
              <Button onClick={() => router.push('/dashboard')}>
                ← Return to Dashboard
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const preferredCurrency = profile?.preferredCurrency || 'USD';
  const totalPortfolioValue = profile?.cryptoWallets
    ? calculatePortfolioValue(profile.cryptoWallets, preferredCurrency)
    : 0;

  // Deterministic color mapping for crypto types
  const getCryptoColor = (cryptoType: string): string => {
    const colorMap: Record<string, string> = {
      'BTC': '#f7931a',
      'ETH': '#627eea',
      'USDT': '#26a17b',
      'BNB': '#f3ba2f',
      'XRP': '#23292f',
      'ADA': '#0033ad',
      'SOL': '#14f195',
      'DOGE': '#c2a633',
    };
    return colorMap[cryptoType] || '#8b5cf6';
  };

  const portfolioData = profile?.cryptoWallets.map(wallet => ({
    name: wallet.cryptoType,
    value: cryptoToFiat(wallet.balance, wallet.cryptoType, preferredCurrency),
    color: getCryptoColor(wallet.cryptoType)
  })) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090D] text-slate-100 bg-cyber-grid selection:bg-[#5E9FE8] selection:text-slate-950">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl animate-fadeIn relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>Asset Management</span>
            <span>&bull;</span>
            <span className="text-[#5E9FE8]">Live Valuation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
            Crypto Portfolio &amp; Custody
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Live valuation, asset allocation, and non-custodial wallet balances across global blockchains.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Value Banner (Sunset Radiant Glow from Image 3 DigiPay) */}
          <div className="card-sunset-glow p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-gradient-to-tl from-blue-500/25 via-cyan-400/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-white/70">Total Portfolio Value</span>
                <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-xl text-blue-200">₿</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono mb-2 text-white">
                {formatCurrencyAmount(totalPortfolioValue, preferredCurrency)}
              </h2>
              <p className="text-xs text-white/70">
                Aggregated across {profile?.cryptoWallets?.length || 0} active asset holdings
              </p>
            </div>
            
            <div className="mt-8 relative z-10">
              <Link href="/trading">
                <button className="w-full py-3 px-6 rounded-xl bg-[#5E9FE8] hover:bg-[#7AB2EE] text-slate-950 font-extrabold text-xs transition-all active:scale-95 shadow cursor-pointer">
                  + Trade Cryptocurrencies →
                </button>
              </Link>
            </div>
          </div>

          {/* Asset Allocation Chart */}
          <div className="lg:col-span-2">
            <div className="bezel-card h-full">
              <div className="bezel-card-inner p-6 h-full flex flex-col justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Asset Allocation</h3>
                {portfolioData.length > 0 && totalPortfolioValue > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrencyAmount(value as number, preferredCurrency)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No cryptocurrency assets currently held</p>
                    <Link href="/trading">
                      <Button size="sm">Explore Market</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-start">
          {/* Crypto Wallets */}
          <div className="bezel-card">
            <div className="bezel-card-inner p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Asset Wallets</h2>
                <Link href="/trading">
                  <Button variant="ghost" size="sm">Deposit / Buy →</Button>
                </Link>
              </div>

              {profile?.cryptoWallets && profile.cryptoWallets.length > 0 ? (
                <div className="space-y-4">
                  {profile.cryptoWallets.map((wallet) => {
                    const value = cryptoToFiat(wallet.balance, wallet.cryptoType, preferredCurrency);
                    const currentPrice = getCryptoPrice(wallet.cryptoType, preferredCurrency);
                    return (
                      <div key={wallet.cryptoType} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2.5">
                            <div 
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                              style={{ backgroundColor: getCryptoColor(wallet.cryptoType) }}
                            >
                              {wallet.cryptoType.slice(0, 1)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                {wallet.cryptoType}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {getCryptoName(wallet.cryptoType)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white text-base font-mono">
                              {formatCurrencyAmount(value, preferredCurrency)}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 font-mono font-medium">
                              {formatCryptoAmount(wallet.balance, wallet.cryptoType)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="truncate max-w-[240px] font-mono select-all">
                            {wallet.address}
                          </span>
                          <span className="font-mono">
                            Spot: {formatCurrencyAmount(currentPrice, preferredCurrency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🪙</div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">No cryptocurrency balances found</p>
                  <Link href="/trading">
                    <Button size="sm">Acquire Crypto</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Currency Converter */}
          <div className="bezel-card">
            <div className="bezel-card-inner p-2 sm:p-4">
              <CurrencyConverter />
            </div>
          </div>
        </div>

        {/* Recent Trades Table */}
        <div className="bezel-card mb-10">
          <div className="bezel-card-inner p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Trade Executions</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Historical orders matched with instant liquidity</p>
              </div>
              <Link href="/transactions">
                <Button variant="ghost" size="sm">All Transactions →</Button>
              </Link>
            </div>

            {trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Side</th>
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4">Crypto Amount</th>
                      <th className="py-3 px-4">Fill Price</th>
                      <th className="py-3 px-4">Total Value</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {trades.slice(0, 10).map((trade) => (
                      <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                            trade.type === 'buy'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{trade.cryptoType}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                          {formatCryptoAmount(trade.cryptoAmount, trade.cryptoType)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                          {formatCurrencyAmount(trade.price, trade.fiatCurrency)}
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-gray-900 dark:text-white">
                          {formatCurrencyAmount(trade.fiatAmount, trade.fiatCurrency)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                No orders executed yet. Completed trades will appear in this ledger.
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
