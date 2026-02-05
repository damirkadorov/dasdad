'use client';

import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
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
  PortfolioIcon
} from '@/components/icons/Icons';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  href?: string;
  comingSoon?: boolean;
  color: string;
}

export default function ServicesPage() {

  const services: Service[] = [
    {
      id: 'credit-card',
      name: 'Credit Cards',
      description: 'Apply for credit cards with competitive rates',
      icon: CardIcon,
      href: '/cards',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'debit-card',
      name: 'Debit Cards',
      description: 'Get instant debit cards linked to your account',
      icon: CardIcon,
      href: '/cards',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'personal-loans',
      name: 'Personal Loans',
      description: 'Quick approval personal loans up to $50,000',
      icon: LoanIcon,
      comingSoon: true,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'mortgage',
      name: 'Home Mortgage',
      description: 'Competitive mortgage rates for your dream home',
      icon: MortgageIcon,
      comingSoon: true,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'auto-loan',
      name: 'Auto Loans',
      description: 'Finance your new car with low interest rates',
      icon: LoanIcon,
      comingSoon: true,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'savings',
      name: 'Savings Account',
      description: 'High-yield savings accounts with great returns',
      icon: SavingsIcon,
      comingSoon: true,
      color: 'from-teal-500 to-green-500'
    },
    {
      id: 'investments',
      name: 'Investment Portfolio',
      description: 'Build wealth with diversified investments',
      icon: InvestmentIcon,
      href: '/portfolio',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Buy, sell, and trade cryptocurrencies',
      icon: CryptoIcon,
      href: '/trading',
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'insurance',
      name: 'Life Insurance',
      description: 'Protect your family with comprehensive coverage',
      icon: InsuranceIcon,
      comingSoon: true,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'health-insurance',
      name: 'Health Insurance',
      description: 'Affordable health insurance plans',
      icon: InsuranceIcon,
      comingSoon: true,
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'iban-transfer',
      name: 'IBAN Transfers',
      description: 'International bank transfers with IBAN',
      icon: IBANIcon,
      href: '/payments?tab=iban',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'currency-exchange',
      name: 'Currency Exchange',
      description: 'Exchange currencies at competitive rates',
      icon: ExchangeIcon,
      href: '/portfolio',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'budget',
      name: 'Budget Planner',
      description: 'Plan and track your monthly budget',
      icon: BudgetIcon,
      comingSoon: true,
      color: 'from-violet-500 to-purple-500'
    },
    {
      id: 'bill-pay',
      name: 'Bill Payments',
      description: 'Pay all your bills in one place',
      icon: BillIcon,
      comingSoon: true,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'recurring',
      name: 'Recurring Payments',
      description: 'Set up automatic recurring payments',
      icon: RecurringIcon,
      comingSoon: true,
      color: 'from-lime-500 to-green-500'
    },
    {
      id: 'goals',
      name: 'Savings Goals',
      description: 'Track and achieve your financial goals',
      icon: GoalIcon,
      comingSoon: true,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'atm',
      name: 'ATM Locator',
      description: 'Find nearby ATMs and branches',
      icon: ATMIcon,
      comingSoon: true,
      color: 'from-sky-500 to-blue-500'
    },
    {
      id: 'bonds',
      name: 'Bonds & Securities',
      description: 'Invest in government and corporate bonds',
      icon: BondsIcon,
      comingSoon: true,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'credit-score',
      name: 'Credit Score',
      description: 'Check and improve your credit score',
      icon: CreditScoreIcon,
      comingSoon: true,
      color: 'from-green-500 to-cyan-500'
    },
    {
      id: 'referral',
      name: 'Refer & Earn',
      description: 'Invite friends and earn rewards',
      icon: ReferralIcon,
      comingSoon: true,
      color: 'from-pink-500 to-purple-500'
    },
    {
      id: 'calculator',
      name: 'Loan Calculator',
      description: 'Calculate loan payments and interest',
      icon: CalculatorIcon,
      comingSoon: true,
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'statements',
      name: 'Account Statements',
      description: 'Download monthly statements',
      icon: StatementIcon,
      href: '/transactions',
      color: 'from-slate-500 to-gray-500'
    },
    {
      id: 'analytics',
      name: 'Spending Analytics',
      description: 'Analyze your spending patterns',
      icon: AnalyticsIcon,
      comingSoon: true,
      color: 'from-violet-500 to-indigo-500'
    },
    {
      id: 'reports',
      name: 'Financial Reports',
      description: 'Generate detailed financial reports',
      icon: ReportIcon,
      comingSoon: true,
      color: 'from-fuchsia-500 to-pink-500'
    },
    {
      id: 'notifications',
      name: 'Alert Settings',
      description: 'Manage your notification preferences',
      icon: NotificationIcon,
      comingSoon: true,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'settings',
      name: 'Account Settings',
      description: 'Manage your account preferences',
      icon: SettingsIcon,
      href: '/profile',
      color: 'from-gray-500 to-slate-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            All Services
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Explore our comprehensive range of financial services designed for you
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const content = (
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 cursor-pointer h-full ${service.comingSoon ? 'opacity-75' : ''}`}>
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${service.color} mb-4`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {service.description}
                  </p>
                  {service.comingSoon && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            );

            return service.href && !service.comingSoon ? (
              <Link key={service.id} href={service.href}>
                {content}
              </Link>
            ) : (
              <div key={service.id}>
                {content}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-white/90 mb-6 text-lg">
            Our financial advisors are here to help you find the right services for your needs
          </p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
