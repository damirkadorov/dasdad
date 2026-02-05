'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CardIcon, PaymentIcon, TransactionIcon, ProfileIcon, MenuIcon } from '@/components/icons/Icons';

export default function BusinessNavigation() {
  const pathname = usePathname();
  
  const links = [
    { href: '/business/dashboard', label: 'Dashboard', Icon: HomeIcon },
    { href: '/business/cards', label: 'Business Cards', Icon: CardIcon },
    { href: '/business/payments', label: 'Payments', Icon: PaymentIcon },
    { href: '/business/pos-terminal', label: 'POS Terminal', Icon: PaymentIcon },
    { href: '/profile', label: 'Profile', Icon: ProfileIcon },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/business/dashboard">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <div className="text-white font-bold text-lg tracking-tight">BUSINESS</div>
                <div className="text-amber-400 text-xs font-medium">Premium Banking</div>
              </div>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.Icon className="mr-2" size={18} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <MenuIcon className="text-slate-300" size={24} />
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden pb-4 grid grid-cols-5 gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-2 rounded-lg transition-all duration-200 ${
                pathname === link.href
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                  : 'text-slate-300'
              }`}
            >
              <link.Icon size={20} />
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
