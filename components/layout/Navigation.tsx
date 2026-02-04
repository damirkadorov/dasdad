'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/cards', label: 'Cards', icon: '💳' },
    { href: '/payments', label: 'Payments', icon: '💸' },
    { href: '/transactions', label: 'Transactions', icon: '📊' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            PayDemo
          </Link>
          
          <div className="hidden md:flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <div className="text-gray-700 dark:text-gray-300">☰</div>
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
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
