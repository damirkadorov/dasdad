import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo size={28} showText={true} />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Experience the future of banking with instant transfers, virtual cards, and NFC payments.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Products</h3>
            <ul className="space-y-2">
              <li><Link href="/cards" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Cards</Link></li>
              <li><Link href="/payments" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Payments</Link></li>
              <li><Link href="/trading" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Crypto Trading</Link></li>
              <li><Link href="/business" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Business Banking</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/developer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Developer API</Link></li>
              <li><Link href="/services" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">All Services</Link></li>
              <li><Link href="/transactions" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Transactions</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-500 dark:text-gray-400">Privacy Policy</span></li>
              <li><span className="text-sm text-gray-500 dark:text-gray-400">Terms of Service</span></li>
              <li><span className="text-sm text-gray-500 dark:text-gray-400">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Lingoung Bank. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
              <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">⚠️ DEMO — fake money only</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
