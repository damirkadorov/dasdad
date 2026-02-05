'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CardIcon, PaymentIcon, TransactionIcon, ProfileIcon, MenuIcon } from '@/components/icons/Icons';
import Logo from './Logo';

export default function Navigation() {
  const pathname = usePathname();
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
    { href: '/cards', label: 'Cards', Icon: CardIcon },
    { href: '/payments', label: 'Payments', Icon: PaymentIcon },
    { href: '/transactions', label: 'Transactions', Icon: TransactionIcon },
    { href: '/profile', label: 'Profile', Icon: ProfileIcon },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard">
            <Logo size={32} showText={true} />
          </Link>
          
          <div className="hidden md:flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <link.Icon className="mr-2" size={18} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <MenuIcon className="text-gray-700 dark:text-gray-300" size={24} />
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
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300'
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
