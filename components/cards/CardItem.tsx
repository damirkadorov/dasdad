'use client';

import { Card as CardType } from '@/lib/db/types';
import { maskCardNumber } from '@/lib/utils/helpers';

interface CardProps {
  card: CardType;
  onClick?: () => void;
}

export default function Card({ card, onClick }: CardProps) {
  // Reference-Inspired styles: Zip Plum Split (Image 1) or Affirm Cobalt Wave (Image 2)
  const isNovaPlus = card.cardType === 'nova-plus';
  const cardStyleClass = isNovaPlus ? 'card-zip-split' : 'card-affirm-wave';

  return (
    <div
      onClick={onClick}
      className={`card-shine relative p-6 rounded-2xl ${cardStyleClass} text-white cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl ${card.status === 'frozen' ? 'opacity-60 saturate-50' : ''}`}
    >
      {/* Top Header: Brand & White Balance Pill (References: Image 1 & 2) */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold tracking-tight">
            {isNovaPlus ? 'Zip Nova+' : 'NovaPay'}
          </span>
          {card.accountType && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-white/90">
              {card.accountType === 'business' ? 'Biz' : 'Personal'}
            </span>
          )}
        </div>

        {/* Balance Badge Pill */}
        <div className="bg-white text-gray-950 font-bold px-3 py-0.5 rounded-xl text-xs font-mono shadow-md flex items-center gap-1">
          <span>{card.currency === 'USD' ? '$' : card.currency === 'EUR' ? '€' : '£'}</span>
          <span>1,000.00</span>
        </div>
      </div>

      {/* Chip SVG Icon */}
      <div className="mb-4 relative z-10">
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="opacity-90">
          <rect x="0.5" y="0.5" width="35" height="27" rx="3.5" stroke="rgba(255,255,255,0.6)" />
          <rect x="4" y="4" width="12" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
          <rect x="4" y="16" width="12" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
          <rect x="20" y="4" width="12" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
          <rect x="20" y="16" width="12" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
          <line x1="18" y1="4" x2="18" y2="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <line x1="4" y1="14" x2="32" y2="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Masked Card Number */}
      <div className="mb-6 text-lg sm:text-xl font-mono tracking-widest text-white font-semibold relative z-10">
        {maskCardNumber(card.cardNumber)}
      </div>

      {/* Expiry & Visa Logo */}
      <div className="flex justify-between items-end relative z-10">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[9px] opacity-70 block uppercase tracking-wider">EXP</span>
            <span className="font-bold">{card.expiryDate}</span>
          </div>
          <div>
            <span className="text-[9px] opacity-70 block uppercase tracking-wider">CVC</span>
            <span className="font-bold">•••</span>
          </div>
          {card.cardFormat && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80">
              {card.cardFormat === 'physical' ? 'Physical' : 'Virtual'}
            </span>
          )}
        </div>

        <div className="font-bold italic text-xl tracking-tighter font-sans text-white/95">
          VISA
        </div>
      </div>
    </div>
  );
}
