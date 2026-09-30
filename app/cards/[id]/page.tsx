'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Skeleton from '@/components/ui/Skeleton';
import { Card } from '@/lib/db/types';
import { formatCardNumber } from '@/lib/utils/helpers';
import { getCardNetwork } from '@/lib/utils/cardNetworks';

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;
  
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<'freeze' | 'delete' | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (cardId) {
      fetchCard();
    }
  }, [cardId]);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/cards/${cardId}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          throw new Error('Card not found');
        }
        throw new Error('Failed to fetch card');
      }

      const data = await response.json();
      setCard(data.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load card');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!card) return;
    
    setActionLoading('freeze');
    setError('');

    try {
      const newStatus = card.status === 'active' ? 'frozen' : 'active';
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update card status');
      }

      const updatedCard = await response.json();
      setCard(updatedCard.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update card');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!card || !confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading('delete');
    setError('');

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      router.push('/cards');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyNumber = () => {
    if (!card) return;
    navigator.clipboard.writeText(card.cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ede9fe]/30 dark:bg-[#07090D]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-md space-y-6">
          <Skeleton variant="text" width={100} height={24} />
          <Skeleton variant="text" width={220} height={36} />
          <Skeleton variant="card" height={220} />
          <Skeleton variant="card" height={80} />
          <Skeleton variant="card" height={120} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ede9fe]/30 dark:bg-[#07090D]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-sm text-center">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="text-3xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{error}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">The requested card could not be retrieved.</p>
            <Link
              href="/cards"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl"
            >
              ← Back to Cards
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#EDE9FE]/40 dark:bg-[#07090D] text-gray-900 dark:text-white">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-[440px] animate-fadeIn">
        {/* Close / Return link (Reference: Image 1 Zip Card) */}
        <div className="mb-4">
          <button 
            onClick={() => router.push('/cards')}
            className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Title Header (Reference: Image 1) */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            Online virtual card
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Use this card as your payment method when shopping online.
          </p>
        </div>

        {/* Diagonal Split Plum-to-Violet Card (Reference: Image 1 Zip Card) */}
        <div className="mb-6">
          <div className={`card-zip-split card-shine p-6 text-white relative transition-all duration-300 ${card.status === 'frozen' ? 'opacity-60 saturate-50' : ''}`}>
            {/* Top row: Brand & Balance Pill */}
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight font-sans">ZIP</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/20 text-white">PAY</span>
              </div>
              
              {/* White Balance Pill (Reference: Image 1) */}
              <div className="bg-white text-gray-950 font-bold px-3.5 py-1 rounded-xl text-sm font-mono shadow-md">
                {card.currency === 'USD' ? '$' : card.currency === 'EUR' ? '€' : card.currency === 'GBP' ? '£' : card.currency + ' '}
                {card.balance !== undefined ? card.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </div>
            </div>

            {/* Card Number */}
            <div className="mb-8">
              <p className="text-lg sm:text-xl font-mono font-bold tracking-widest text-white select-all">
                {showDetails ? formatCardNumber(card.cardNumber) : '•••• •••• •••• ' + card.cardNumber.replace(/\s/g, '').slice(-4)}
              </p>
            </div>

            {/* Expiry, CVC & Visa Mark (Reference: Image 1) */}
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[9px] font-mono text-blue-200 uppercase tracking-widest">MM &nbsp; YY</p>
                  <p className="font-mono text-sm font-bold text-white">{card.expiryDate}</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-blue-200 uppercase tracking-widest">CVC</p>
                  <p className="font-mono text-sm font-bold text-white">{showDetails ? card.cvv : '•••'}</p>
                </div>
              </div>

              <div className="font-bold italic text-xl tracking-tight font-sans text-white/95">
                {getCardNetwork(card.network).shortLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Date & Balance Card (Reference: Image 1) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-800 shadow-sm flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(card.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-base font-bold font-mono text-gray-900 dark:text-white mt-0.5">
              {card.currency === 'USD' ? '$' : card.currency === 'EUR' ? '€' : card.currency === 'GBP' ? '£' : card.currency + ' '}
              {card.balance !== undefined ? card.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFreeze}
              disabled={actionLoading === 'freeze'}
              className="p-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title={card.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}
            >
              {card.status === 'active' ? '❄️' : '🔥'}
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading === 'delete'}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Delete Card"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action List Group (Reference: Image 1) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden mb-8">
          {/* Action 1: Copy Card Number */}
          <button
            onClick={handleCopyNumber}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                {copied ? '✓ Card number copied!' : 'Copy card number'}
              </span>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-300 font-semibold">
              {copied ? 'Done' : 'Copy'}
            </span>
          </button>

          <div className="border-t border-gray-100 dark:border-gray-800"></div>

          {/* Action 2: Shop Online */}
          <Link
            href="/developer/tester"
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Shop online / Sandbox</span>
            </div>
            <span className="text-gray-400 text-xs">↗</span>
          </Link>

          <div className="border-t border-gray-100 dark:border-gray-800"></div>

          {/* Action 3: Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={showDetails ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                {showDetails ? 'Hide card numbers & CVV' : 'Reveal card numbers & CVV'}
              </span>
            </div>
            <span className="text-xs text-gray-400">{showDetails ? 'Hide' : 'Show'}</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
