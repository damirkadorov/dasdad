'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CardIcon, PaymentIcon, TransactionIcon, ProfileIcon, MenuIcon, CodeIcon } from '@/components/icons/Icons';
import Logo from './Logo';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
    { href: '/cards', label: 'Cards', Icon: CardIcon },
    { href: '/payments', label: 'Payments', Icon: PaymentIcon },
    { href: '/transactions', label: 'Transactions', Icon: TransactionIcon },
    { href: '/developer', label: 'Developer', Icon: CodeIcon },
    { href: '/profile', label: 'Profile', Icon: ProfileIcon },
  ];

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Logo size={32} showText={true} />
            </Link>
            
            <div className="hidden md:flex items-center space-x-1.5 p-1 bg-gray-100/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-spring ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/60'
                    }`}
                  >
                    <link.Icon className="mr-1.5" size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/business"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1.5"
              >
                <span>💼</span>
                <span>Business Mode</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <link.Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/business"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 flex items-center justify-center space-x-2 p-3 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              >
                <span>💼 Switch to Business Banking</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
