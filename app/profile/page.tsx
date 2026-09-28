'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils/helpers';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
}

interface Stats {
  totalCards: number;
  totalTransactions: number;
  activeCards: number;
  frozenCards: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalCards: 0,
    totalTransactions: 0,
    activeCards: 0,
    frozenCards: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, cardsRes, transactionsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/cards'),
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

      if (cardsRes.ok && transactionsRes.ok) {
        const cardsData = await cardsRes.json();
        const transactionsData = await transactionsRes.json();
        
        setStats({
          totalCards: cardsData.cards?.length || 0,
          totalTransactions: transactionsData.transactions?.length || 0,
          activeCards: cardsData.cards?.filter((c: { status: string }) => c.status === 'active').length || 0,
          frozenCards: cardsData.cards?.filter((c: { status: string }) => c.status === 'frozen').length || 0
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError('');

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton variant="text" width={180} height={36} />
          <Skeleton variant="card" height={180} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="card" height={100} />
            ))}
          </div>
          <Skeleton variant="card" height={220} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-md text-center">
          <div className="bezel-card">
            <div className="bezel-card-inner p-8">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{error}</h2>
              <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initial = profile?.username?.slice(0, 1)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
            Account Profile 👤
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage your credentials, view operational metrics, and review account security.
          </p>
        </div>

        {/* Profile Card Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-18 h-18 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-3xl font-extrabold shadow-inner border border-white/30">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{profile?.username}</h2>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Verified Tier 1
                </span>
              </div>
              <p className="text-white/80 text-sm">{profile?.email}</p>
              <p className="text-white/60 text-xs mt-1">
                Customer ID: <span className="font-mono">{profile?.id?.slice(0, 12)}...</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:text-right border border-white/15">
            <p className="text-white/80 text-xs uppercase tracking-wider mb-0.5">Primary Cash Balance</p>
            <p className="text-3xl font-extrabold font-mono tracking-tight">{formatCurrency(profile?.balance || 0)}</p>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Account Activity Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bezel-card">
              <div className="bezel-card-inner p-4 text-center">
                <div className="text-2xl mb-1">💳</div>
                <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                  {stats.totalCards}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Cards</div>
              </div>
            </div>
            
            <div className="bezel-card">
              <div className="bezel-card-inner p-4 text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {stats.activeCards}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Active Cards</div>
              </div>
            </div>
            
            <div className="bezel-card">
              <div className="bezel-card-inner p-4 text-center">
                <div className="text-2xl mb-1">❄️</div>
                <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {stats.frozenCards}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Frozen Cards</div>
              </div>
            </div>
            
            <div className="bezel-card">
              <div className="bezel-card-inner p-4 text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {stats.totalTransactions}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Transactions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Details */}
        <div className="bezel-card mb-8">
          <div className="bezel-card-inner p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Security &amp; Account Details
            </h2>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Username Identifier</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  @{profile?.username}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Registered Email</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {profile?.email}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-gray-500 dark:text-gray-400">Two-Factor Authentication</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                  Active (JWT Session)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links & Sign Out */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bezel-card">
            <div className="bezel-card-inner p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">Developer Credentials</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Manage API keys for server-to-server payment checkout integrations.
                </p>
              </div>
              <Button variant="ghost" onClick={() => router.push('/developer')} className="justify-start px-0 text-purple-600 dark:text-purple-400">
                Open Developer Portal →
              </Button>
            </div>
          </div>

          <div className="bezel-card">
            <div className="bezel-card-inner p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">Session Management</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Terminate your active authentication cookies and sign out of this browser.
                </p>
              </div>
              <Button
                onClick={handleLogout}
                isLoading={loggingOut}
                variant="danger"
                className="w-full"
              >
                Sign Out of Account
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
