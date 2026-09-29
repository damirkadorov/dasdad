'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import TransactionItem from '@/components/transactions/TransactionItem';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrencyAmount } from '@/lib/utils/currency';
import { formatCryptoAmount, calculatePortfolioValue, cryptoToFiat } from '@/lib/utils/crypto';
import { Transaction, CurrencyBalance, CryptoWallet, Currency } from '@/lib/db/types';
import { WalletIcon, TopUpIcon, SendIcon, CryptoIcon, CardIcon, TrendingUpIcon } from '@/components/icons/Icons';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  balances: CurrencyBalance[];
  cryptoWallets: CryptoWallet[];
  preferredCurrency: Currency;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, transactionsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/transactions')
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

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions.slice(0, 5));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07090D] text-white">
        <Navigation />
        <main className="flex-1">
          <DashboardSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07090D] text-white">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalFiatBalance = profile?.balances?.reduce((sum, b) => sum + b.amount, 0) || 0;
  const cryptoPortfolioValue = profile?.cryptoWallets && profile.cryptoWallets.length > 0
    ? calculatePortfolioValue(profile.cryptoWallets, profile.preferredCurrency || 'USD')
    : 0;
  const totalBalance = totalFiatBalance + cryptoPortfolioValue;

  return (
    <div className="min-h-screen flex flex-col bg-[#07090D] text-slate-100 overflow-x-hidden selection:bg-[#5E9FE8] selection:text-slate-950">
      {/* Background Cyber Grid & Sunset Glow Orbs (References: Image 3 & 4) */}
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none opacity-40 z-0"></div>
      <div className="fixed -top-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 via-cyan-600/5 to-transparent rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-[#5E9FE8]/10 via-emerald-600/5 to-transparent rounded-full blur-[160px] pointer-events-none z-0"></div>

      <Navigation />
      
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>Overview</span>
              <span>&bull;</span>
              <span className="text-[#5E9FE8]">Live Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Welcome back, {profile?.username || 'Trader'}!</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Multi-currency financial hub & real-time transaction engine.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/cards">
              <button className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs transition-all active:scale-95 shadow cursor-pointer">
                + New Card
              </button>
            </Link>
            <Link href="/payments?action=topup">
              <button className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs border border-white/15 transition-all cursor-pointer">
                Top Up
              </button>
            </Link>
          </div>
        </div>

        {/* Balance Cards (Dual-Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Main Portfolio Hero Card (Sunset Glow from Reference Image 3 DigiPay) */}
          <div className="lg:col-span-7 card-sunset-glow p-8 relative overflow-hidden text-white flex flex-col justify-between min-h-[260px]">
            {/* Ambient Radiant Glow Orb */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-blue-500/25 via-cyan-400/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-white/70">Total Portfolio Value</span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white mt-1">
                    {formatCurrencyAmount(totalBalance, profile?.preferredCurrency || 'USD')}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                  <WalletIcon className="text-blue-200" size={24} />
                </div>
              </div>
            </div>

            {/* Split Breakdown */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 relative z-10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/70">Cash & IBAN Balance</span>
                <p className="text-lg font-bold font-mono text-white mt-0.5">
                  {formatCurrencyAmount(totalFiatBalance, profile?.preferredCurrency || 'USD')}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5E9FE8]">Crypto Holdings</span>
                <p className="text-lg font-bold font-mono text-white mt-0.5">
                  {formatCurrencyAmount(cryptoPortfolioValue, profile?.preferredCurrency || 'USD')}
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Currency Cash Balances (Reference Image 4 Bento) */}
          <div className="lg:col-span-5 bezel-card">
            <div className="bezel-card-inner p-6 bg-[#101318]/90 border border-white/10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Currency Wallets</h3>
                <span className="text-[11px] font-mono text-slate-400">7 Active Currencies</span>
              </div>
              
              <div className="space-y-2.5 overflow-y-auto max-h-[170px] pr-1">
                {profile?.balances && profile.balances.length > 0 ? (
                  profile.balances.map((balance) => (
                    <div key={balance.currency} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-black font-bold text-xs">
                          {balance.currency.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white leading-none">{balance.currency}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Primary Ledger</p>
                        </div>
                      </div>
                      <p className="font-mono text-xs font-bold text-white">
                        {formatCurrencyAmount(balance.amount, balance.currency)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs text-center py-4">No currency balances yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Pills */}
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/payments?action=topup" className="bezel-card">
              <div className="bezel-card-inner p-4 bg-[#101318]/80 hover:bg-white/[0.06] border border-white/10 transition-all text-center group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <TopUpIcon size={20} />
                </div>
                <p className="font-bold text-xs text-white">Top Up Balance</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Card or Bank Transfer</p>
              </div>
            </Link>

            <Link href="/payments" className="bezel-card">
              <div className="bezel-card-inner p-4 bg-[#101318]/80 hover:bg-white/[0.06] border border-white/10 transition-all text-center group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <SendIcon size={20} />
                </div>
                <p className="font-bold text-xs text-white">Send Money</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Instant Zero-Fee P2P</p>
              </div>
            </Link>

            <Link href="/trading" className="bezel-card">
              <div className="bezel-card-inner p-4 bg-[#101318]/80 hover:bg-white/[0.06] border border-white/10 transition-all text-center group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#5E9FE8]/10 text-[#5E9FE8] border border-[#5E9FE8]/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <CryptoIcon size={20} />
                </div>
                <p className="font-bold text-xs text-white">Trade Crypto</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Spot & Exchange</p>
              </div>
            </Link>

            <Link href="/cards" className="bezel-card">
              <div className="bezel-card-inner p-4 bg-[#101318]/80 hover:bg-white/[0.06] border border-white/10 transition-all text-center group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <CardIcon size={20} />
                </div>
                <p className="font-bold text-xs text-white">Virtual Cards</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage & Create</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Lower Grid: Crypto Holdings & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Crypto Holdings Preview */}
          <div className="lg:col-span-6 bezel-card">
            <div className="bezel-card-inner p-6 bg-[#101318]/90 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUpIcon size={16} className="text-[#5E9FE8]" />
                  <span>Crypto Holdings</span>
                </h3>
                <Link href="/trading" className="text-xs text-[#5E9FE8] hover:underline font-semibold">
                  Trade Market →
                </Link>
              </div>

              {profile?.cryptoWallets && profile.cryptoWallets.length > 0 ? (
                <div className="space-y-3">
                  {profile.cryptoWallets.map((wallet) => (
                    <div key={wallet.cryptoType} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                          {wallet.cryptoType.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">{wallet.cryptoType}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{formatCryptoAmount(wallet.balance, wallet.cryptoType)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-white">
                          {formatCurrencyAmount(cryptoToFiat(wallet.balance, wallet.cryptoType, profile?.preferredCurrency || 'USD'), profile?.preferredCurrency || 'USD')}
                        </p>
                        <p className="text-[10px] text-[#5E9FE8] font-mono">Secured Vault</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>You don&apos;t have any cryptocurrencies yet.</p>
                  <Link href="/trading" className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#5E9FE8] text-black font-bold text-xs">
                    Start Trading
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-6 bezel-card">
            <div className="bezel-card-inner p-6 bg-[#101318]/90 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Recent Activity</h3>
                <Link href="/transactions" className="text-xs text-slate-400 hover:text-white transition-colors">
                  View All Activity →
                </Link>
              </div>

              {transactions.length > 0 ? (
                <div className="space-y-2.5">
                  {transactions.map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs text-center py-8">No recent transactions recorded</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
