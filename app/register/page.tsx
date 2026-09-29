'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/layout/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed' });
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090D] text-slate-100 bg-cyber-grid p-4 relative overflow-hidden selection:bg-[#5E9FE8] selection:text-slate-950">
      {/* Radiant Glow Orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-gradient-to-tr from-[#5E9FE8]/15 via-emerald-600/5 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-scaleIn relative z-10">
        <div className="bezel-card">
          <div className="bezel-card-inner p-8 bg-[#101318]/95 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Link href="/">
                  <Logo size={42} showText={false} textWhite={true} />
                </Link>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                Create Account
              </h1>
              <p className="text-xs text-slate-400">
                Get your instant virtual card and multi-currency IBAN
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 rounded-xl text-xs">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] focus:border-transparent transition-all"
                />
                {errors.username && <p className="text-[11px] text-red-400 mt-1">{errors.username}</p>}
              </div>

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
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] focus:border-transparent transition-all"
                />
                {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
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
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] focus:border-transparent transition-all"
                />
                {errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] focus:border-transparent transition-all"
                />
                {errors.confirmPassword && <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-[#5E9FE8] hover:bg-[#7AB2EE] text-slate-950 font-extrabold text-xs transition-all active:scale-95 shadow-lg shadow-[#5E9FE8]/15 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Get Started Free →'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-[#5E9FE8] hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
