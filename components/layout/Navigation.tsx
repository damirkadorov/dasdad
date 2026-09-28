'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CardIcon, PaymentIcon, TransactionIcon, ProfileIcon, MenuIcon, CodeIcon, TrendingUpIcon } from '@/components/icons/Icons';
import Logo from './Logo';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
    { href: '/cards', label: 'Cards', Icon: CardIcon },
    { href: '/payments', label: 'Payments', Icon: PaymentIcon },
    { href: '/trading', label: 'Trading', Icon: TrendingUpIcon },
    { href: '/transactions', label: 'Activity', Icon: TransactionIcon },
    { href: '/developer', label: 'Developer', Icon: CodeIcon },
    { href: '/profile', label: 'Profile', Icon: ProfileIcon },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#05070B]/85 border-b border-white/[0.08] transition-all">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Logo size={32} showText={true} textWhite={true} />
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 p-1 bg-white/[0.04] backdrop-blur-md rounded-full border border-white/[0.08]">
              {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ease-spring ${
                      isActive
                        ? 'bg-white text-black shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <link.Icon className="mr-1.5" size={15} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/developer/tester"
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#d4ff00]/30 text-[#d4ff00] bg-[#d4ff00]/10 hover:bg-[#d4ff00]/20 transition-all flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00] animate-pulse"></span>
                <span>API Sandbox</span>
              </Link>
              <Link
                href="/business"
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <span>💼</span>
                <span>Business</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/[0.06] text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
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
          
          {/* Mobile navigation panel */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-spring ${
              mobileOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'
            }`}
          >
            <div className="pt-2 grid grid-cols-2 gap-2 animate-slideDown">
              {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'bg-white/[0.05] text-slate-300 border border-white/[0.08]'
                    }`}
                  >
                    <link.Icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/developer/tester"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-[#d4ff00] text-black shadow-md mt-1"
              >
                <span>⚡ Open API Tester</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
