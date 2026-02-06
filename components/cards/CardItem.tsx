'use client';

import { Card as CardType } from '@/lib/db/types';
import { maskCardNumber } from '@/lib/utils/helpers';

interface CardProps {
  card: CardType;
  onClick?: () => void;
}

export default function Card({ card, onClick }: CardProps) {
  // NovaPay network card gradients
  const cardGradients = {
    'nova': 'from-emerald-500 via-teal-600 to-cyan-700',
    'nova-plus': 'from-purple-500 via-violet-600 to-indigo-700'
  };

  // Get the gradient, with fallback for legacy cards
  const gradient = cardGradients[card.cardType] || 'from-emerald-500 via-teal-600 to-cyan-700';

  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${card.status === 'frozen' ? 'opacity-60' : ''}`}
    >
      {/* Card badges */}
      <div className="absolute top-3 right-3 flex gap-2">
        {card.accountType && (
          <div className={`backdrop-blur px-3 py-1 rounded-full text-xs font-semibold ${
            card.accountType === 'business' 
              ? 'bg-amber-500/30 text-amber-100 border border-amber-400/50' 
              : 'bg-blue-500/30 text-blue-100 border border-blue-400/50'
          }`}>
            {card.accountType === 'business' ? '💼 Business' : '👤 Personal'}
          </div>
        )}
        {card.cardFormat && (
          <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
            {card.cardFormat === 'physical' ? '💳 Physical' : '✨ Virtual'}
          </div>
        )}
        {card.status === 'frozen' && (
          <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
            ❄️ Frozen
          </div>
        )}
      </div>

      {/* Card type logo - NovaPay branding */}
      <div className="flex justify-between items-start mb-8">
        <div className="text-xl font-bold">
          {card.cardType === 'nova' ? 'NovaPay' : card.cardType === 'nova-plus' ? 'NovaPay+' : 'NovaPay'}
        </div>
        <div className="w-12 h-8 bg-white/20 rounded backdrop-blur flex items-center justify-center">
          <span className="text-lg font-bold">N</span>
        </div>
      </div>

      {/* Card number */}
      <div className="mb-6 text-lg font-mono tracking-wider">
        {maskCardNumber(card.cardNumber)}
      </div>

      {/* Card details */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs opacity-70 mb-1">VALID THRU</div>
          <div className="text-sm font-semibold">{card.expiryDate}</div>
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">CVV</div>
          <div className="text-sm font-semibold">•••</div>
        </div>
        {card.currency && (
          <div>
            <div className="text-xs opacity-70 mb-1">CURRENCY</div>
            <div className="text-sm font-semibold">{card.currency}</div>
          </div>
        )}
      </div>
    </div>
  );
}
