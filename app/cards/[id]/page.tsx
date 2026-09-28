'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Card } from '@/lib/db/types';
import { formatCardNumber } from '@/lib/utils/helpers';

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;
  
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<'freeze' | 'delete' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
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
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton variant="text" width={120} height={36} />
          <div className="flex justify-center">
            <Skeleton variant="card" width={420} height={240} />
          </div>
          <Skeleton variant="card" height={200} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-xl text-center">
          <div className="bezel-card">
            <div className="bezel-card-inner p-8">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{error}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">The requested card could not be retrieved.</p>
              <Button onClick={() => router.push('/cards')}>
                ← Return to Cards
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!card) return null;

  // NovaPay network card gradients
  const cardGradients: Record<string, string> = {
    'nova': 'from-emerald-500 via-teal-600 to-cyan-700',
    'nova-plus': 'from-purple-500 via-violet-600 to-indigo-700'
  };
  
  const gradient = cardGradients[card.cardType] || 'from-emerald-500 via-teal-600 to-cyan-700';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/cards')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors cursor-pointer"
        >
          <span>←</span>
          <span>Back to All Cards</span>
        </button>

        {/* Card Display Container */}
        <div className="mb-10 flex flex-col items-center">
          <div className={`card-shine relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-2xl transition-all duration-300 ${card.status === 'frozen' ? 'opacity-60 saturate-50' : ''}`}>
            {/* Status badge */}
            <div className="absolute top-4 right-4 flex gap-2">
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

            {/* Logo */}
            <div className="flex justify-between items-start mb-8">
              <div className="text-2xl font-bold tracking-tight">
                {card.cardType === 'nova' ? 'NovaPay' : card.cardType === 'nova-plus' ? 'NovaPay+' : 'NovaPay'}
              </div>
              <div className="w-14 h-9 bg-white/20 rounded-lg backdrop-blur flex items-center justify-center font-bold text-lg">
                N
              </div>
            </div>

            {/* Chip SVG */}
            <div className="mb-5">
              <svg width="40" height="30" viewBox="0 0 36 28" fill="none" className="opacity-80">
                <rect x="0.5" y="0.5" width="35" height="27" rx="3.5" stroke="rgba(255,255,255,0.6)" />
                <rect x="4" y="4" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
                <rect x="4" y="16" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
                <rect x="20" y="4" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
                <rect x="20" y="16" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
                <line x1="18" y1="4" x2="18" y2="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <line x1="4" y1="14" x2="32" y2="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Card Number */}
            <div className="mb-8 text-2xl font-mono tracking-widest flex items-center justify-between">
              <span>{showDetails ? formatCardNumber(card.cardNumber) : '•••• •••• •••• ' + card.cardNumber.replace(/\s/g, '').slice(-4)}</span>
              <button
                onClick={handleCopyNumber}
                className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded backdrop-blur transition-colors"
                title="Copy card number"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {/* Expiry & CVV */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] opacity-70 mb-0.5 uppercase tracking-wider font-semibold">VALID THRU</div>
                <div className="text-base font-semibold">{card.expiryDate}</div>
              </div>
              <div>
                <div className="text-[10px] opacity-70 mb-0.5 uppercase tracking-wider font-semibold">CVV</div>
                <div className="text-base font-semibold">
                  {showDetails ? card.cvv : '•••'}
                </div>
              </div>
              <div>
                <div className="text-[10px] opacity-70 mb-0.5 uppercase tracking-wider font-semibold">CURRENCY</div>
                <div className="text-base font-semibold">{card.currency || 'USD'}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '🔒 Conceal Sensitive Info' : '👁️ Reveal Card Details'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Card Info Box */}
          <div className="bezel-card">
            <div className="bezel-card-inner p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Card Specifications</h2>
              
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Card Tier</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {card.cardType === 'nova-plus' ? 'NovaPay+ Premium' : 'NovaPay Standard'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Card Format</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {card.cardFormat || 'Virtual'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`font-semibold ${card.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-500'}`}>
                    {card.status === 'active' ? '● Active & Ready' : '❄ Frozen'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Issued On</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(card.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500 dark:text-gray-400">Unique ID</span>
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {card.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Box */}
          <div className="bezel-card">
            <div className="bezel-card-inner p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Card Management</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Control security states or decommission this card.
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleToggleFreeze}
                    isLoading={actionLoading === 'freeze'}
                    variant={card.status === 'active' ? 'secondary' : 'primary'}
                    className="w-full"
                  >
                    {card.status === 'active' ? '❄️ Freeze Card' : '🔓 Unfreeze Card'}
                  </Button>
                  
                  <Button
                    onClick={handleDelete}
                    isLoading={actionLoading === 'delete'}
                    variant="danger"
                    className="w-full"
                  >
                    🗑️ Delete Card Permanently
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400">
                {card.status === 'active' 
                  ? '🛡️ Card is protected by 24/7 fraud monitoring and contactless tokenization.'
                  : '🔒 While frozen, all new debit charges and POS authorizations are declined immediately.'}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
