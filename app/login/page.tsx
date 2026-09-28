'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/layout/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070B] text-slate-100 bg-cyber-grid p-4 relative overflow-hidden selection:bg-[#d4ff00] selection:text-black">
      {/* Radiant Glow Orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-orange-500/20 via-amber-400/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-gradient-to-tr from-[#d4ff00]/15 via-emerald-600/5 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-scaleIn relative z-10">
        <div className="bezel-card">
          <div className="bezel-card-inner p-8 bg-[#080B12]/95 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Link href="/">
                  <Logo size={42} showText={false} textWhite={true} />
                </Link>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                Welcome to NovaPay
              </h1>
              <p className="text-xs text-slate-400">
                Sign in to manage your multi-currency accounts and cards
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-full bg-[#d4ff00] hover:bg-[#bce400] text-black font-extrabold text-xs transition-all active:scale-95 shadow-lg shadow-[#d4ff00]/15 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Signing In...' : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#d4ff00] hover:underline font-semibold">
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
