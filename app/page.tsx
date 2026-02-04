'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-white text-2xl font-bold">PayDemo</div>
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
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-white mb-3">Virtual Cards</h3>
              <p className="text-white/80">
                Create and manage multiple virtual cards instantly. Freeze or delete them anytime.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Transfers</h3>
              <p className="text-white/80">
                Send money to anyone instantly. No delays, no hidden fees.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-white mb-3">NFC Payments</h3>
              <p className="text-white/80">
                Tap to pay with your phone. Fast, secure, and contactless.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Everything you need</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white/90">
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-sm">Bank-level Security</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-sm">Real-time Analytics</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">🌍</div>
                <div className="text-sm">Global Transfers</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">💯</div>
                <div className="text-sm">24/7 Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
