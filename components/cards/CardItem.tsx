'use client';

import { Card as CardType } from '@/lib/db/types';
import { maskCardNumber } from '@/lib/utils/helpers';

interface CardProps {
  card: CardType;
  onClick?: () => void;
}

export default function Card({ card, onClick }: CardProps) {
  const cardGradients = {
    visa: 'from-blue-500 via-blue-600 to-indigo-700',
    mastercard: 'from-orange-500 via-red-500 to-pink-600'
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${cardGradients[card.cardType]} text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${card.status === 'frozen' ? 'opacity-60' : ''}`}
    >
      {/* Card status badge */}
      {card.status === 'frozen' && (
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
          ❄️ Frozen
        </div>
      )}

      {/* Card type logo */}
      <div className="flex justify-between items-start mb-8">
        <div className="text-xl font-bold">
          {card.cardType === 'visa' ? 'VISA' : 'Mastercard'}
        </div>
        <div className="w-12 h-8 bg-white/20 rounded backdrop-blur" />
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
      </div>
    </div>
  );
}
