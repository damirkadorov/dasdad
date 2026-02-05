'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Logo from '@/components/layout/Logo';
import { BankIcon, CardIcon, SendIcon, NFCIcon, SecurityIcon, AnalyticsIcon, GlobeIcon, SupportIcon } from '@/components/icons/Icons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo size={32} showText={true} textWhite={true} />
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Banking Made
            <span className="block bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Simple & Smart
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Send money instantly, manage your cards, and make contactless payments with ease. Experience the future of banking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto min-w-[200px] bg-white text-purple-600 hover:bg-gray-100 shadow-2xl">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto min-w-[200px] text-white border-2 border-white/30 hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full">
                  <CardIcon className="text-white" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Virtual & Physical Cards</h3>
              <p className="text-white/80 text-center">
                Create and manage multiple cards instantly. Freeze or delete them anytime.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full">
                  <SendIcon className="text-white" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Instant Transfers</h3>
              <p className="text-white/80 text-center">
                Send money to anyone instantly. Multi-currency support, no delays.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full">
                  <NFCIcon className="text-white" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">NFC Payments</h3>
              <p className="text-white/80 text-center">
                Tap to pay with your phone. Fast, secure, and contactless.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Everything you need in one place</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white/90">
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white/20 rounded-full mb-2">
                  <SecurityIcon className="text-white" size={24} />
                </div>
                <div className="text-sm text-center">Bank-level Security</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white/20 rounded-full mb-2">
                  <AnalyticsIcon className="text-white" size={24} />
                </div>
                <div className="text-sm text-center">Real-time Analytics</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white/20 rounded-full mb-2">
                  <GlobeIcon className="text-white" size={24} />
                </div>
                <div className="text-sm text-center">Global Transfers</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white/20 rounded-full mb-2">
                  <SupportIcon className="text-white" size={24} />
                </div>
                <div className="text-sm text-center">24/7 Support</div>
              </div>
            </div>
          </div>

          {/* Business Banking Section */}
          <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-lg rounded-2xl p-12 border border-amber-500/30">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-2xl">
                <span className="text-white font-bold text-3xl">B</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Business Banking</h3>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Premium banking services designed for businesses. Accept payments with our POS Terminal and manage your business finances with professional tools.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="text-3xl mb-3">💼</div>
                <h4 className="text-lg font-bold text-white mb-2">Business Accounts</h4>
                <p className="text-slate-400 text-sm">Professional banking with enhanced features and higher limits</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="text-3xl mb-3">💳</div>
                <h4 className="text-lg font-bold text-white mb-2">POS Terminal</h4>
                <p className="text-slate-400 text-sm">Accept card payments from customers within the ecosystem</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="text-lg font-bold text-white mb-2">Business Analytics</h4>
                <p className="text-slate-400 text-sm">Track transactions and manage your business operations</p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/business">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-2xl">
                  Explore Business Banking →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
