'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import {
  CardIcon,
  LoanIcon,
  InsuranceIcon,
  SavingsIcon,
  InvestmentIcon,
  MortgageIcon,
  BudgetIcon,
  BillIcon,
  RecurringIcon,
  GoalIcon,
  ATMIcon,
  BondsIcon,
  CreditScoreIcon,
  ReferralIcon,
  SettingsIcon,
  StatementIcon,
  NotificationIcon,
  CalculatorIcon,
  ReportIcon,
  IBANIcon,
  CryptoIcon,
  ExchangeIcon,
  AnalyticsIcon,
} from '@/components/icons/Icons';

interface Service {
  id: string;
  name: string;
  description: string;
  category: 'cards' | 'lending' | 'wealth' | 'transfers' | 'tools';
  icon: React.ComponentType<{ className?: string; size?: number }>;
  href?: string;
  comingSoon?: boolean;
  color: string;
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const services: Service[] = [
    {
      id: 'credit-card',
      name: 'Virtual Lingoung Cards',
      description: 'Issue virtual cards with zero fees and instant Apple/Google Pay sync',
      category: 'cards',
      icon: CardIcon,
      href: '/cards',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency Trading',
      description: 'Buy, sell, and swap digital assets with instant fiat liquidity',
      category: 'wealth',
      icon: CryptoIcon,
      href: '/trading',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'iban-transfer',
      name: 'SEPA & IBAN Transfers',
      description: 'High-speed international wire transfers with zero intermediary fees',
      category: 'transfers',
      icon: IBANIcon,
      href: '/payments?tab=iban',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'currency-exchange',
      name: 'Multi-Currency Exchange',
      description: 'Exchange 7 global fiat currencies at interbank spot rates',
      category: 'transfers',
      icon: ExchangeIcon,
      href: '/portfolio',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'investments',
      name: 'Portfolio Tracker',
      description: 'Unified dashboard for multi-currency fiat and crypto holdings',
      category: 'wealth',
      icon: InvestmentIcon,
      href: '/portfolio',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'statements',
      name: 'Account Statements',
      description: 'Export audit-compliant PDF and CSV financial ledgers',
      category: 'tools',
      icon: StatementIcon,
      href: '/transactions',
      color: 'from-slate-600 to-gray-700'
    },
    {
      id: 'personal-loans',
      name: 'Personal Credit Lines',
      description: 'Instant liquidity lines up to $50,000 with flexible payback',
      category: 'lending',
      icon: LoanIcon,
      comingSoon: true,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'savings',
      name: 'High-Yield Vaults',
      description: 'Compounding APY on EUR and USD deposits backed by treasury bills',
      category: 'wealth',
      icon: SavingsIcon,
      comingSoon: true,
      color: 'from-teal-500 to-green-600'
    },
    {
      id: 'mortgage',
      name: 'Digital Mortgage',
      description: 'Pre-approved commercial and residential mortgage options',
      category: 'lending',
      icon: MortgageIcon,
      comingSoon: true,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'bill-pay',
      name: 'Automated Bill Pay',
      description: 'Schedule utility, subscription, and corporate bill settlements',
      category: 'tools',
      icon: BillIcon,
      comingSoon: true,
      color: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'insurance',
      name: 'Fraud & Deposit Shield',
      description: 'Automated deposit protection and chargeback guarantees',
      category: 'tools',
      icon: InsuranceIcon,
      comingSoon: true,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'settings',
      name: 'Security Preferences',
      description: 'Biometrics, 2FA hardware keys, and API credentials',
      category: 'tools',
      icon: SettingsIcon,
      href: '/profile',
      color: 'from-gray-600 to-slate-700'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'cards', label: 'Cards' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'wealth', label: 'Wealth & Crypto' },
    { id: 'lending', label: 'Lending' },
    { id: 'tools', label: 'Management' },
  ];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090D] text-slate-100 bg-cyber-grid selection:bg-[#5E9FE8] selection:text-slate-950">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl animate-fadeIn relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#5E9FE8] mb-3">
            <span>✨ Ecosystem Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Banking Services &amp; Products
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
            Explore our integrated suite of personal, commercial, and decentralized financial tools.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-2">
          <div className="flex w-max flex-nowrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-9 whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#5E9FE8] text-slate-950 shadow-md shadow-[#5E9FE8]/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            const cardContent = (
              <div className={`bezel-card h-full ${service.comingSoon ? 'opacity-80' : ''}`}>
                <div className="bezel-card-inner p-6 h-full flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-md text-white`}>
                        <Icon size={24} />
                      </div>
                      {service.comingSoon ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Roadmap
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold">
                    <span className={service.comingSoon ? 'text-gray-400' : 'text-blue-600 dark:text-blue-300'}>
                      {service.comingSoon ? 'Available Soon' : 'Launch Feature →'}
                    </span>
                  </div>
                </div>
              </div>
            );

            return service.href && !service.comingSoon ? (
              <Link key={service.id} href={service.href} className="block transition-transform hover:-translate-y-1">
                {cardContent}
              </Link>
            ) : (
              <div key={service.id} className="block">
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="bezel-card mb-12">
          <div className="bezel-card-inner p-8 bg-gradient-to-r from-blue-900/40 via-cyan-950/40 to-blue-900/40 border-blue-400/20 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Need a Bespoke Financial Solution?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6">
              Our enterprise private banking desk assists institutional accounts, high-volume merchants, and developers with custom routing solutions.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/developer">
                <Button>Explore Developer APIs</Button>
              </Link>
              <Link href="/business">
                <Button variant="secondary">Business Banking</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
