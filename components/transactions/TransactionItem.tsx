'use client';

import { Transaction } from '@/lib/db/types';
import { formatDate } from '@/lib/utils/helpers';
import { formatCurrencyAmount } from '@/lib/utils/currency';
import { formatCryptoAmount } from '@/lib/utils/crypto';

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'top_up':
        return '💰';
      case 'send':
        return '↗️';
      case 'receive':
        return '↙️';
      case 'nfc_payment':
        return '📱';
      case 'crypto_buy':
        return '₿';
      case 'crypto_sell':
        return '💸';
      case 'crypto_transfer':
        return '🔄';
      case 'currency_exchange':
        return '💱';
      case 'iban_transfer':
      case 'IBAN_TRANSFER':
      case 'IBAN_RECEIVE':
        return '🏦';
      case 'LOAN_DISBURSED':
      case 'LOAN_PAYMENT':
        return '🏛️';
      case 'SAVINGS_DEPOSIT':
      case 'SAVINGS_WITHDRAWAL':
        return '🏦';
      case 'BILL_PAYMENT':
        return '🧾';
      case 'INVESTMENT_BUY':
      case 'INVESTMENT_SELL':
        return '📈';
      case 'marketplace_purchase':
      case 'marketplace_sale':
        return '🛍️';
      default:
        return '💳';
    }
  };

  const getIconGradient = (type: string) => {
    switch (type) {
      case 'top_up':
        return 'from-green-500 to-emerald-500';
      case 'send':
        return 'from-red-400 to-pink-500';
      case 'receive':
        return 'from-green-400 to-teal-500';
      case 'nfc_payment':
        return 'from-blue-500 to-cyan-500';
      case 'crypto_buy':
      case 'crypto_sell':
      case 'crypto_transfer':
        return 'from-orange-500 to-amber-500';
      case 'currency_exchange':
        return 'from-cyan-500 to-blue-500';
      case 'iban_transfer':
      case 'IBAN_TRANSFER':
      case 'IBAN_RECEIVE':
        return 'from-blue-500 to-cyan-500';
      case 'LOAN_DISBURSED':
      case 'LOAN_PAYMENT':
      case 'SAVINGS_DEPOSIT':
      case 'SAVINGS_WITHDRAWAL':
        return 'from-blue-500 to-cyan-500';
      case 'BILL_PAYMENT':
        return 'from-orange-500 to-amber-500';
      case 'INVESTMENT_BUY':
      case 'INVESTMENT_SELL':
        return 'from-emerald-500 to-teal-500';
      case 'marketplace_purchase':
      case 'marketplace_sale':
        return 'from-sky-500 to-blue-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'top_up':
        return 'Top Up';
      case 'send':
        return 'Sent';
      case 'receive':
        return 'Received';
      case 'nfc_payment':
        return 'NFC Payment';
      case 'crypto_buy':
        return 'Crypto Buy';
      case 'crypto_sell':
        return 'Crypto Sell';
      case 'crypto_transfer':
        return 'Crypto Transfer';
      case 'currency_exchange':
        return 'Currency Exchange';
      case 'iban_transfer':
      case 'IBAN_TRANSFER':
        return 'IBAN Transfer';
      case 'IBAN_RECEIVE':
        return 'IBAN Received';
      case 'LOAN_DISBURSED':
        return 'Loan Disbursed';
      case 'LOAN_PAYMENT':
        return 'Loan Payment';
      case 'SAVINGS_DEPOSIT':
        return 'Savings Deposit';
      case 'SAVINGS_WITHDRAWAL':
        return 'Savings Withdrawal';
      case 'BILL_PAYMENT':
        return 'Bill Payment';
      case 'INVESTMENT_BUY':
        return 'Investment Purchase';
      case 'INVESTMENT_SELL':
        return 'Investment Sale';
      case 'marketplace_purchase':
        return 'Marketplace Purchase';
      case 'marketplace_sale':
        return 'Marketplace Sale';
      default:
        return 'Transaction';
    }
  };

  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all duration-200 hover:translate-x-1 group">
      <div className="flex items-center space-x-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getIconGradient(transaction.type)} flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform duration-200`}>
          {getIcon(transaction.type)}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
            {transaction.description || getTypeLabel(transaction.type)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {getTypeLabel(transaction.type)} • {formatDate(transaction.createdAt || transaction.timestamp || '')}
            {transaction.cryptoType && transaction.cryptoAmount && (
              <span className="ml-2 text-blue-600 dark:text-blue-300 font-medium">
                {formatCryptoAmount(transaction.cryptoAmount, transaction.cryptoType)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={`text-base font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? '+' : ''}{formatCurrencyAmount(transaction.amount, transaction.currency)}
      </div>
    </div>
  );
}
