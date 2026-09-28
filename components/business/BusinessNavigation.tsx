'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CardIcon, PaymentIcon, ProfileIcon, MenuIcon } from '@/components/icons/Icons';

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
      <nav className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl transition-all duration-300">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/business/dashboard" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <div>
                  <div className="text-white font-bold text-base tracking-tight leading-tight">LINGOUNG</div>
                  <div className="text-amber-400 text-[10px] font-semibold tracking-widest uppercase">Business Banking</div>
                </div>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-spring ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
                href="/dashboard"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-500/40 text-purple-300 bg-purple-950/30 hover:bg-purple-900/40 transition-colors flex items-center gap-1.5"
              >
                <span>👤</span>
                <span>Personal Banking</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
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
            <div className="pt-2 grid grid-cols-2 gap-2 animate-slideDown">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <link.Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 flex items-center justify-center space-x-2 p-3 rounded-xl text-sm font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30"
              >
                <span>👤 Switch to Personal Banking</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
