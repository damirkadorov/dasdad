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
      className={`card-shine relative p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white cursor-pointer transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${card.status === 'frozen' ? 'opacity-60 saturate-50' : ''}`}
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

      {/* Chip icon */}
      <div className="mb-4">
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="opacity-80">
          <rect x="0.5" y="0.5" width="35" height="27" rx="3.5" stroke="rgba(255,255,255,0.5)" />
          <rect x="4" y="4" width="12" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
          <rect x="4" y="16" width="12" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
          <rect x="20" y="4" width="12" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
          <rect x="20" y="16" width="12" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
          <line x1="18" y1="4" x2="18" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <line x1="4" y1="14" x2="32" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        </svg>
      </div>

      {/* Card number */}
      <div className="mb-6 text-lg font-mono tracking-widest">
        {maskCardNumber(card.cardNumber)}
      </div>

      {/* Card details */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs opacity-60 mb-1 uppercase tracking-wider">Valid Thru</div>
          <div className="text-sm font-semibold">{card.expiryDate}</div>
        </div>
        <div>
          <div className="text-xs opacity-60 mb-1 uppercase tracking-wider">CVV</div>
          <div className="text-sm font-semibold">•••</div>
        </div>
        {card.currency && (
          <div>
            <div className="text-xs opacity-60 mb-1 uppercase tracking-wider">Currency</div>
            <div className="text-sm font-semibold">{card.currency}</div>
          </div>
        )}
      </div>
    </div>
  );
}
