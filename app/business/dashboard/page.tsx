'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BusinessNavigation from '@/components/business/BusinessNavigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Skeleton, { DashboardSkeleton } from '@/components/ui/Skeleton';
import TransactionItem from '@/components/transactions/TransactionItem';
import { convertCurrency, formatCurrencyAmount } from '@/lib/utils/currency';
import { Transaction, CurrencyBalance, Currency } from '@/lib/db/types';
import { WalletIcon, TopUpIcon, SendIcon, CardIcon } from '@/components/icons/Icons';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  balances: CurrencyBalance[];
  preferredCurrency: Currency;
  createdAt: string;
}

export default function BusinessDashboard() {
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
      <div className="min-h-screen flex flex-col bg-[#07090D] text-zinc-100 bg-cyber-grid">
        <BusinessNavigation />
        <main className="flex-1">
          <DashboardSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07090D] text-zinc-100 bg-cyber-grid">
        <BusinessNavigation />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-6 rounded-2xl max-w-md mx-auto backdrop-blur-md">
            {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayCurrency = profile?.preferredCurrency || 'USD';
  const totalBalance = profile?.balances?.reduce(
    (sum, balance) => sum + convertCurrency(balance.amount, balance.currency, displayCurrency),
    0
  ) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#07090D] text-zinc-100 bg-cyber-grid">
      <BusinessNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#5E9FE8]/10 border border-[#5E9FE8]/30 text-xs font-bold text-[#5E9FE8] mb-3">
              <span className="w-2 h-2 rounded-xl bg-[#5E9FE8] animate-pulse"></span>
              <span>COMMERCIAL TIER • ENTERPRISE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {profile?.username}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Real-time corporate treasury, merchant clearing, and instant settlements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/developer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5E9FE8] text-[#07090D] hover:bg-[#7AB2EE] transition-colors shadow-lg shadow-[#5E9FE8]/20 flex items-center gap-1.5"
            >
              <span>⚡ API Keys</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Balance Card - Reference 3 Sunset Glow Cyber Card */}
        <div className="mb-8">
          <div className="card-sunset-glow rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100/90">
                    Total Business Balance
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Multi-Currency
                  </span>
                </div>
                <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
                  {formatCurrencyAmount(totalBalance, profile?.preferredCurrency || 'USD')}
                </h2>
                <p className="text-xs text-blue-100/70 mt-2 font-mono">
                  Primary Settlement: {profile?.preferredCurrency || 'USD'} • Last synchronized just now
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/business/payments?action=topup">
                  <button className="px-5 py-3 rounded-2xl bg-white text-zinc-950 font-bold text-sm shadow-xl hover:bg-zinc-100 transition-all active:scale-[0.98] cursor-pointer">
                    + Deposit Funds
                  </button>
                </Link>
                <Link href="/business/pos-terminal">
                  <button className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all active:scale-[0.98] cursor-pointer">
                    POS Terminal
                  </button>
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/15">
              <div>
                <p className="text-blue-100/80 text-xs mb-1 font-medium">Available to Disburse</p>
                <p className="font-extrabold text-lg text-white font-mono">{formatCurrencyAmount(totalBalance, profile?.preferredCurrency || 'USD')}</p>
              </div>
              <div>
                <p className="text-blue-100/80 text-xs mb-1 font-medium">Account Tier</p>
                <p className="font-extrabold text-lg text-white">Commercial Corp</p>
              </div>
              <div>
                <p className="text-blue-100/80 text-xs mb-1 font-medium">API Merchant Engine</p>
                <p className="font-extrabold text-lg text-[#5E9FE8]">● Online (100%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Gateway Notice */}
        <div className="mb-8">
          <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-[#5E9FE8]/40 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5E9FE8]/10 border border-[#5E9FE8]/30 flex items-center justify-center text-xl text-[#5E9FE8] shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      Payment Gateway &amp; Checkout API
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#5E9FE8]/20 text-[#5E9FE8]">
                      v2.4 Live
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Integrate hosted checkouts and server-to-server payments into your website or storefront. Keys authenticate webhooks and instant card clearances.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/developer/tester">
                  <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white border border-white/10">
                    🧪 Interactive Tester
                  </Button>
                </Link>
                <Link href="/developer">
                  <Button 
                    variant="primary" 
                    className="bg-[#5E9FE8] hover:bg-[#7AB2EE] text-[#07090D] font-bold shadow-lg shadow-[#5E9FE8]/20"
                  >
                    🔑 Manage API Keys
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Business Operations</h2>
            <span className="text-xs text-zinc-500 font-mono">Select workflow</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/business/payments?action=topup">
              <div className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 transition-all border border-white/10 hover:border-[#5E9FE8]/50 text-center group cursor-pointer">
                <div className="flex justify-center mb-3">
                  <div className="p-3.5 bg-white/[0.04] group-hover:bg-[#5E9FE8]/20 rounded-2xl transition-all border border-white/5">
                    <TopUpIcon className="text-zinc-300 group-hover:text-[#5E9FE8] transition-colors" size={24} />
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm">Deposit Capital</h3>
                <p className="text-xs text-zinc-500 mt-1">Wire &amp; Card Inbound</p>
              </div>
            </Link>

            <Link href="/business/payments">
              <div className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 transition-all border border-white/10 hover:border-[#5E9FE8]/50 text-center group cursor-pointer">
                <div className="flex justify-center mb-3">
                  <div className="p-3.5 bg-white/[0.04] group-hover:bg-[#5E9FE8]/20 rounded-2xl transition-all border border-white/5">
                    <SendIcon className="text-zinc-300 group-hover:text-[#5E9FE8] transition-colors" size={24} />
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm">Corporate Payout</h3>
                <p className="text-xs text-zinc-500 mt-1">Direct Vendor Transfer</p>
              </div>
            </Link>

            <Link href="/business/pos-terminal">
              <div className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 transition-all border border-white/10 hover:border-[#5E9FE8]/50 text-center group cursor-pointer">
                <div className="flex justify-center mb-3">
                  <div className="p-3.5 bg-white/[0.04] group-hover:bg-[#5E9FE8]/20 rounded-2xl transition-all border border-white/5">
                    <CardIcon className="text-zinc-300 group-hover:text-[#5E9FE8] transition-colors" size={24} />
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm">POS Terminal</h3>
                <p className="text-xs text-zinc-500 mt-1">Instant Card Charge</p>
              </div>
            </Link>

            <Link href="/business/cards">
              <div className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 transition-all border border-white/10 hover:border-[#5E9FE8]/50 text-center group cursor-pointer">
                <div className="flex justify-center mb-3">
                  <div className="p-3.5 bg-white/[0.04] group-hover:bg-[#5E9FE8]/20 rounded-2xl transition-all border border-white/5">
                    <CardIcon className="text-zinc-300 group-hover:text-[#5E9FE8] transition-colors" size={24} />
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm">Corporate Cards</h3>
                <p className="text-xs text-zinc-500 mt-1">Issue Team Cards</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Currency Balances & Recent Transactions in 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Currency Accounts */}
          <div className="lg:col-span-5 bg-white/[0.03] rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Multi-Currency Vaults</span>
              <span className="text-xs font-mono text-zinc-500">{profile?.balances?.length || 0} active</span>
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {profile?.balances && profile.balances.length > 0 ? (
                profile.balances.map((balance) => (
                  <div key={balance.currency} className="flex justify-between items-center p-3.5 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all border border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-sm">
                        {balance.currency.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{balance.currency}</p>
                        <p className="text-[11px] text-zinc-500">Corporate Sub-Account</p>
                      </div>
                    </div>
                    <p className="font-mono font-bold text-white text-base">{formatCurrencyAmount(balance.amount, balance.currency)}</p>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-center py-6 text-sm">No currency accounts yet</p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-7 bg-white/[0.03] rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Live Settlement Ledger</h2>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white border border-white/10">View All</Button>
              </Link>
            </div>
            
            {transactions.length > 0 ? (
              <div className="space-y-2.5">
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-zinc-400 font-semibold text-sm">No transactions yet</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Start clearing transactions via POS Terminal or developer checkouts
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
