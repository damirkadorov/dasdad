'use client';

import { Transaction } from '@/lib/db/types';
import { formatCurrency, formatDate } from '@/lib/utils/helpers';

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
      default:
        return '💳';
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
      default:
        return 'Transaction';
    }
  };

  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl">
          {getIcon(transaction.type)}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {transaction.description}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {getTypeLabel(transaction.type)} • {formatDate(transaction.createdAt)}
          </div>
        </div>
      </div>
      <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{formatCurrency(transaction.amount)}
      </div>
    </div>
  );
}
