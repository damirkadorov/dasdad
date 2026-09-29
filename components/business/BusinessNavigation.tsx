'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CardIcon, PaymentIcon, ProfileIcon, MenuIcon } from '@/components/icons/Icons';
import Logo from '@/components/layout/Logo';

export default function BusinessNavigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const links = [
    { href: '/business/dashboard', label: 'Dashboard', Icon: HomeIcon },
    { href: '/business/cards', label: 'Cards', Icon: CardIcon },
    { href: '/business/payments', label: 'Payments', Icon: PaymentIcon },
    { href: '/business/pos-terminal', label: 'POS Terminal', Icon: PaymentIcon },
    { href: '/profile', label: 'Profile', Icon: ProfileIcon },
  ];

  return (
    <>
      <nav className="bg-[#07090D]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/business/dashboard" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <Logo size={36} showText={false} textWhite />
                <div>
                  <div className="text-base font-semibold leading-tight tracking-[-0.03em] text-white">Lingoung</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">Business</div>
                </div>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1 p-1 bg-white/[0.04] rounded-xl border border-white/10 backdrop-blur-md">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-400/15 text-blue-200 shadow-[inset_0_0_0_1px_rgba(94,159,232,.18)]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <link.Icon className="mr-1.5" size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/developer"
                className="flex min-h-9 items-center gap-1.5 rounded-lg border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200 transition-colors hover:bg-blue-400/15"
              >
                <span>⚡</span>
                <span>API Gateway</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/15 text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center gap-1.5"
              >
                <span>👤</span>
                <span>Personal Banking</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl bg-white/[0.06] border border-white/10 text-zinc-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <MenuIcon size={22} />
              )}
            </button>
          </div>
          
          {/* Mobile navigation */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-spring ${
              mobileOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'
            }`}
          >
            <div className="pt-2 grid grid-cols-2 gap-2">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-400/15 text-blue-200 border border-blue-300/20'
                        : 'bg-white/[0.04] text-zinc-300 border border-white/10'
                    }`}
                  >
                    <link.Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/developer"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 flex items-center justify-center space-x-2 p-3 rounded-xl text-sm font-bold bg-[#5E9FE8]/10 text-[#5E9FE8] border border-[#5E9FE8]/30"
              >
                <span>⚡ Payment Gateway API</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 flex items-center justify-center space-x-2 p-3 rounded-xl text-sm font-semibold bg-white/[0.04] text-zinc-300 border border-white/10"
              >
                <span>👤 Switch to Personal Banking</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
