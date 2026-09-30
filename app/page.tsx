'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import CardChip from '@/components/cards/CardChip';
import Footer from '@/components/layout/Footer';

const activity = [
  { name: 'Card payment', detail: 'Vercel Cloud', amount: '−$49.00', tone: 'text-white' },
  { name: 'Transfer received', detail: 'From Alex Morgan', amount: '+$2,450.00', tone: 'text-emerald-300' },
  { name: 'Crypto purchase', detail: '0.0142 BTC', amount: '−$1,125.40', tone: 'text-white' },
];

const features = [
  { number: '01', title: 'Spend globally', copy: 'Create virtual cards instantly, set limits, freeze access, and pay in 7 currencies.', href: '/cards', label: 'Explore cards' },
  { number: '02', title: 'Move money instantly', copy: 'Send secure transfers, manage IBAN accounts, and keep every payment in one timeline.', href: '/payments', label: 'See payments' },
  { number: '03', title: 'Build with one API', copy: 'Launch hosted checkout, issue API keys, and test webhooks in a safe sandbox.', href: '/developer', label: 'Open developer portal' },
];

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <div className="hero-mesh min-h-screen overflow-x-hidden text-slate-100 selection:bg-blue-400 selection:text-slate-950">
      <div className="surface-grid pointer-events-none fixed inset-0 z-0" />

      <header className="glass-nav sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" aria-label="Lingoung home" className="rounded-xl">
            <Logo size={34} showText textWhite />
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            <Link href="/cards" className="transition-colors hover:text-white">Cards</Link>
            <Link href="/trading" className="transition-colors hover:text-white">Trading</Link>
            <Link href="/business" className="transition-colors hover:text-white">Business</Link>
            <Link href="/developer" className="flex items-center gap-2 transition-colors hover:text-white">
              Developers
              <span className="rounded-md border border-blue-400/20 bg-blue-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">API</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden min-h-11 items-center px-3 text-sm font-medium text-slate-300 transition-colors hover:text-white sm:flex">Log in</Link>
            <Link href="/register" className="inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-blue-50">Open account</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-12 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="lg:col-span-6">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
              Banking, cards and crypto — together
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.7rem]">
              Money moves.
              <span className="block text-[#B6C7D8]">You stay in control.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              One simple account for everyday payments, multi-currency cards, and digital assets — designed to feel fast, clear, and secure.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#9CB4CB] px-5 text-sm font-semibold text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_14px_32px_rgba(0,0,0,.22)] transition-all hover:-translate-y-0.5 hover:bg-[#B3C5D5]">Get started free <Arrow /></Link>
              <Link href="/developer/tester" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.045] px-5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.09]">Try API sandbox</Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-slate-500">
              <span className="flex items-center gap-2"><span className="text-emerald-300">✓</span> No setup fee</span>
              <span className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Virtual card in seconds</span>
              <span className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Demo money only</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:col-span-6">
            <div className="absolute -inset-10 rounded-full bg-slate-300/[0.07] blur-3xl" />
            <div className="glass-panel-strong relative overflow-hidden rounded-[28px] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between px-1">
                <div>
                  <p className="text-xs text-slate-500">Total balance</p>
                  <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-white">$24,820.40</p>
                </div>
                <button aria-label="More account options" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white">•••</button>
              </div>

              <div className="relative mb-4 min-h-[210px] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#626D7A] via-[#3C444F] to-[#20242B] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_18px_38px_rgba(0,0,0,.24)]">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[38px] border-white/[0.08]" />
                <div className="absolute -bottom-24 right-14 h-48 w-48 rounded-full border-[30px] border-cyan-200/[0.08]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <Logo size={30} showText={false} />
                    <span className="text-lg font-semibold italic tracking-tight">VISA</span>
                  </div>
                  <CardChip size="md" className="mt-5" />
                  <div className="mt-6">
                    <p className="font-mono text-lg tracking-[0.16em] text-white sm:text-xl">4804 •••• •••• 8300</p>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.16em] text-blue-100/60">Card holder</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider">Damir Kadorov</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-blue-100/60">Expires</p>
                        <p className="mt-1 text-xs font-medium">01/29</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-2">
                {activity.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.04]">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-sm text-blue-300">↗</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">{item.name}</p>
                        <p className="truncate text-xs text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                    <span className={`ml-4 text-sm font-medium ${item.tone}`}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.08] bg-white/[0.025]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 py-7 sm:grid-cols-4 lg:px-8">
            {[['7', 'fiat currencies'], ['8', 'digital assets'], ['< 1s', 'transfer updates'], ['24/7', 'sandbox access']].map(([value, label]) => (
              <div key={label} className="px-3 py-3 text-center">
                <p className="text-xl font-semibold tracking-tight text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="mb-12 grid gap-5 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Built around real life</p>
              <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Everything you need.<br />Nothing you do not.</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-slate-400 lg:justify-self-end">Clear balances, purposeful controls, and one consistent experience across personal banking, business payments, and developer tools.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.number} className={`group flex min-h-[300px] flex-col justify-between rounded-2xl border p-6 backdrop-blur-xl transition-all hover:-translate-y-1 ${index === 1 ? 'border-white/18 bg-[#9AA7B5]/80 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_20px_50px_rgba(0,0,0,.2)]' : 'border-white/[0.09] bg-white/[0.045] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.05)] hover:border-white/20 hover:bg-white/[0.065]'}`}>
                <div>
                  <span className={`font-mono text-xs ${index === 1 ? 'text-slate-950/60' : 'text-slate-500'}`}>{feature.number}</span>
                  <h3 className="mt-14 text-2xl font-semibold tracking-[-0.035em]">{feature.title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${index === 1 ? 'text-slate-950/70' : 'text-slate-400'}`}>{feature.copy}</p>
                </div>
                <Link href={feature.href} className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">{feature.label} <Arrow /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111923] to-[#0B0E13] px-6 py-12 sm:px-10 lg:px-14">
            <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Ready when you are</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">A smarter account starts here.</h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">Join the product preview and get updates as new payment, card, and trading features launch.</p>
              </div>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <label htmlFor="preview-email" className="sr-only">Email address</label>
                <input id="preview-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 w-full rounded-xl border border-white/12 bg-black/20 px-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-300 focus:outline-none sm:max-w-xs" />
                <button type="submit" className="min-h-12 whitespace-nowrap rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-blue-50">{subscribed ? 'You are on the list ✓' : 'Join preview'}</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}