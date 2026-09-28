'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
  };

  const tickerItems = [
    { title: 'Therapy Session', amount: '$400.15', time: '4:56 pm', subtitle: 'Dr. Roy' },
    { title: 'StockX Order #4092', amount: '$765.00', time: 'Just now', subtitle: 'Verified Authentic' },
    { title: 'Cyberpunk Sneakers', amount: '$100.00', time: '2 min ago', subtitle: 'NovaPay Checkout' },
    { title: 'Cloud Infrastructure API', amount: '$49.00', time: '14 min ago', subtitle: 'AWS / Vercel' },
    { title: 'Coffee Artisan Batch', amount: '$18.00', time: '42 min ago', subtitle: 'Single Origin' },
    { title: 'BTC/USD Buy Order', amount: '+$2,450.00', time: '1 hr ago', subtitle: 'Instant Settlement' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#05070B] text-slate-100 overflow-x-hidden selection:bg-[#d4ff00] selection:text-black">
      {/* Background Cyber Grid & Glow Orbs (References: Image 3 & 4) */}
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none opacity-40 z-0"></div>
      <div className="fixed -top-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-transparent rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-[#d4ff00]/10 via-emerald-600/5 to-transparent rounded-full blur-[160px] pointer-events-none z-0"></div>

      {/* Floating Glass Navigation (Reference: DigiPay) */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#05070B]/80 border-b border-white/[0.07] transition-all">
        <div className="container mx-auto px-4 max-w-7xl h-18 flex items-center justify-between">
          <Link href="/" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Logo size={34} showText={true} textWhite={true} />
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link href="/cards" className="hover:text-white transition-colors">Cards</Link>
            <Link href="/trading" className="hover:text-white transition-colors">Trading</Link>
            <Link href="/services" className="hover:text-white transition-colors">Features</Link>
            <Link href="/developer" className="hover:text-[#d4ff00] transition-colors flex items-center gap-1.5">
              <span>API Gateway</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4ff00]/10 text-[#d4ff00] font-mono border border-[#d4ff00]/20">v2</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
                Log In
              </button>
            </Link>
            <Link href="/register">
              <button className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-200 text-black text-xs font-bold transition-all shadow-lg hover:shadow-white/20 active:scale-[0.97] cursor-pointer">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (Reference: Image 3 DigiPay + Image 4 CRYPTO) */}
      <main className="relative z-10 flex-1">
        <section className="container mx-auto px-4 max-w-7xl pt-16 md:pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Interaction */}
            <div className="lg:col-span-6 space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#d4ff00] animate-pulse"></span>
                <span className="tracking-wide uppercase text-[11px]">Your finances in your pocket</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[4.2rem] font-bold tracking-tight leading-[1.08] text-white">
                Smart banking for your{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                  transactions.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed font-normal">
                Multi-currency accounts, instant virtual card issuing, and high-frequency crypto trading engineered for digital-first commerce.
              </p>

              {/* Interactive Pill Email Subscription / Instant Launch (Reference: Image 3 DigiPay) */}
              <form onSubmit={handleSubscribe} className="pt-2 max-w-md">
                <div className="flex items-center bg-white/[0.06] hover:bg-white/[0.08] border border-white/15 focus-within:border-white/30 backdrop-blur-xl rounded-full p-1.5 transition-all shadow-2xl">
                  <div className="pl-3.5 pr-2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none px-1"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-200 text-black text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-md"
                  >
                    {subscribed ? '✓ Subscribed' : 'Subscribe'}
                  </button>
                </div>
              </form>

              {/* Social Proof (Reference: Image 4 CRYPTO) */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#05070B] bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow">AK</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#05070B] bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow">DK</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#05070B] bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white shadow">MR</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#05070B] bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white shadow">SV</div>
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white tracking-wide">168K+ Realtime Users</p>
                  <p className="text-slate-400 text-[11px]">Accepting payments globally</p>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Glowing Cards Showcase (Reference: Image 3 DigiPay) */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[420px]">
              {/* Sunset Radiant Glow Orb behind cards */}
              <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-red-500 opacity-60 blur-3xl pointer-events-none animate-pulse"></div>

              {/* Card 1 (Back Card, tilted +12deg with Sunset Glow) */}
              <div className="absolute w-[290px] sm:w-[340px] h-[190px] sm:h-[220px] rounded-2xl p-5 border border-white/20 bg-gradient-to-br from-amber-500/80 via-orange-600/70 to-red-600/80 text-white shadow-2xl backdrop-blur-md transform rotate-12 translate-x-8 -translate-y-6 transition-transform hover:rotate-6 duration-500 group select-none">
                <div className="flex justify-between items-start mb-6">
                  <span className="font-bold tracking-widest text-sm text-white/90">VISA</span>
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-red-500/90 shadow"></div>
                    <div className="w-5 h-5 rounded-full bg-amber-400/90 shadow"></div>
                  </div>
                </div>
                <div className="text-right mb-6">
                  <span className="text-[11px] font-mono text-white/70">01/25</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] tracking-wider uppercase text-white/70 font-mono">Card Number</p>
                  <p className="font-mono text-sm sm:text-base font-semibold tracking-wider text-white">4804 9556 8008 8300</p>
                </div>
              </div>

              {/* Card 2 (Front Card, tilted -4deg with Glass Frosted Core) */}
              <div className="relative w-[300px] sm:w-[350px] h-[200px] sm:h-[230px] rounded-2xl p-6 border border-white/25 bg-gradient-to-br from-[#121620]/90 to-[#0A0D14]/95 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 select-none">
                {/* Internal Card Glow */}
                <div className="absolute right-0 bottom-0 w-36 h-36 bg-gradient-to-tl from-orange-500/40 via-amber-400/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold tracking-widest text-base font-mono text-white">VISA</span>
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-red-500 shadow"></div>
                    <div className="w-6 h-6 rounded-full bg-amber-400 shadow"></div>
                  </div>
                </div>

                <div className="my-5">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Card Number</p>
                  <p className="font-mono text-base sm:text-lg font-bold tracking-widest text-white">
                    4804 9556 8008 8300
                  </p>
                </div>

                <div className="flex justify-between items-end pt-1">
                  <div>
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Card Holder Name</p>
                    <p className="text-xs font-semibold tracking-wide text-white uppercase">Damir Kadorov</p>
                  </div>
                  <span className="font-mono text-xs text-slate-300">01/29</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Activity Ticker (Reference: Image 3 DigiPay Bottom Carousel) */}
        <section className="border-y border-white/[0.07] bg-white/[0.02] py-4 overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Live Activity
              </span>
              <div className="flex items-center gap-3 shrink-0">
                {tickerItems.map((item, i) => (
                  <div key={i} className="ticker-pill">
                    <div>
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.time} &bull; {item.subtitle}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#d4ff00] pl-2 border-l border-white/10">
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bento Feature Section (Reference: Image 4 CRYPTO.) */}
        <section className="container mx-auto px-4 max-w-7xl py-24">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Your <span className="text-[#d4ff00]">trusted</span> partner of modern digital finance.
            </h2>
            <p className="text-sm text-slate-400">
              Polkadot, IBAN accounts, and high-security payment gateways uniting a growing ecosystem of specialized blockchain and fiat rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 01 (Dark Frosted) */}
            <div className="bezel-card">
              <div className="bezel-card-inner p-8 bg-[#090D14]/90 border border-white/10 flex flex-col justify-between min-h-[280px]">
                <div>
                  <span className="text-sm font-mono text-slate-400 font-bold block mb-4">01.</span>
                  <h3 className="text-xl font-bold text-white mb-3">Service for Any Level of Expertise.</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Intuitive personal banking combined with institutional liquidity, multi-currency IBANs, and NFC POS terminal infrastructure.
                  </p>
                </div>
                <div className="pt-6">
                  <Link href="/cards" className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                    <span>Explore Cards</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 02 (Featured Electric Neon Lime Card from Image 4!) */}
            <div className="card-neon-lime p-8 flex flex-col justify-between min-h-[280px] text-black">
              <div>
                <span className="text-sm font-mono font-bold block mb-4 text-black/80">02.</span>
                <h3 className="text-xl font-extrabold mb-3 text-black">Industry best practices.</h3>
                <p className="text-xs text-black/80 font-medium leading-relaxed">
                  Cryptographically secured token vaults, sub-second API card issuance, and automated fraud prevention tested under 100,000+ daily events.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/developer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-[#d4ff00] text-xs font-bold hover:bg-black/90 transition-all active:scale-95"
                >
                  <span>Learn More</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Card 03 (Dark Frosted) */}
            <div className="bezel-card">
              <div className="bezel-card-inner p-8 bg-[#090D14]/90 border border-white/10 flex flex-col justify-between min-h-[280px]">
                <div>
                  <span className="text-sm font-mono text-slate-400 font-bold block mb-4">03.</span>
                  <h3 className="text-xl font-bold text-white mb-3">Protected by Reserve Insurance.</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    1:1 backing for all customer deposits, segregated fiat accounts across Tier-1 institutions, and automated cold-storage security.
                  </p>
                </div>
                <div className="pt-6">
                  <Link href="/trading" className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                    <span>View Markets</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Wave Chart & Live Rate Section (Reference: Image 4 CRYPTO bottom section) */}
        <section className="container mx-auto px-4 max-w-7xl pb-24">
          <div className="bezel-card">
            <div className="bezel-card-inner p-8 md:p-12 bg-gradient-to-br from-[#080B11] to-[#040609] border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Wave Chart Mockup with Floating Crypto Badges */}
                <div className="lg:col-span-7 relative min-h-[260px] flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-xs font-mono text-slate-400">Average Rate</span>
                      <p className="text-2xl font-bold font-mono text-white">$4,528.00 USD</p>
                      <span className="text-[10px] text-[#d4ff00] font-mono">↗ +45.66% 24h</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-xs font-mono text-slate-400">Volume</span>
                      <p className="text-2xl font-bold font-mono text-white">1,44,528 BTC</p>
                      <span className="text-[10px] text-slate-400 font-mono">Global Liquidity</span>
                    </div>
                  </div>

                  {/* SVG Glowing Wave Path */}
                  <div className="relative w-full h-32">
                    <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="waveGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d4ff00" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#d4ff00" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,80 C100,20 180,100 280,40 C380,-10 460,70 600,25 L600,120 L0,120 Z"
                        fill="url(#waveGlow)"
                      />
                      <path
                        d="M0,80 C100,20 180,100 280,40 C380,-10 460,70 600,25"
                        fill="none"
                        stroke="#d4ff00"
                        strokeWidth="3"
                      />
                      {/* Floating Coin Nodes */}
                      <circle cx="100" cy="50" r="10" fill="#f59e0b" stroke="#000" strokeWidth="2" />
                      <circle cx="280" cy="40" r="10" fill="#10b981" stroke="#000" strokeWidth="2" />
                      <circle cx="480" cy="55" r="10" fill="#e11d48" stroke="#000" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Right: Call to Action */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                    Trusted platform <br />
                    <span className="text-[#d4ff00]">anytime &amp; anywhere.</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Open an account in 2 minutes, get your first virtual card immediately, and connect your business directly to the NovaPay Payment Gateway.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link href="/register">
                      <button className="px-6 py-3 rounded-full bg-[#d4ff00] hover:bg-[#bce400] text-black font-extrabold text-xs transition-all shadow-lg active:scale-95 cursor-pointer">
                        Get Started Now →
                      </button>
                    </Link>
                    <Link href="/developer/tester">
                      <button className="px-5 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs transition-all border border-white/15 cursor-pointer">
                        Test API Gateway
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
