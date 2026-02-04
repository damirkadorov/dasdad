'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
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

      // Calculate stats
      if (cardsRes.ok && transactionsRes.ok) {
        const cardsData = await cardsRes.json();
        const transactionsData = await transactionsRes.json();
        
        setStats({
          totalCards: cardsData.cards.length,
          totalTransactions: transactionsData.transactions.length,
          activeCards: cardsData.cards.filter((c: { status: string }) => c.status === 'active').length,
          frozenCards: cardsData.cards.filter((c: { status: string }) => c.status === 'frozen').length
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile 👤
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and view your stats
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-4xl mr-6">
              👤
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">{profile?.username}</h2>
              <p className="text-white/80">{profile?.email}</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <p className="text-white/80 text-sm mb-1">Current Balance</p>
            <p className="text-4xl font-bold">{formatCurrency(profile?.balance || 0)}</p>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Account Information
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Username</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {profile?.username}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Email</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {profile?.email}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Balance</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(profile?.balance || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 dark:text-gray-400">Member Since</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Account Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl mb-2">💳</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalCards}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.activeCards}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Cards</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl mb-2">❄️</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.frozenCards}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Frozen Cards</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.totalTransactions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/cards')}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="font-semibold text-gray-900 dark:text-white">Manage Cards</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                View and manage your virtual cards
              </div>
            </button>
            
            <button
              onClick={() => router.push('/transactions')}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-gray-900 dark:text-white">View Transactions</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                See all your transaction history
              </div>
            </button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Actions
          </h2>
          
          <Button
            onClick={handleLogout}
            isLoading={loggingOut}
            variant="danger"
            className="w-full"
            size="lg"
          >
            🚪 Logout
          </Button>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            You&apos;ll be redirected to the home page after logging out
          </p>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
