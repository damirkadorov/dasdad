'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading card...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">{error}</h2>
            <Button onClick={() => router.push('/cards')} className="mt-4">
              Back to Cards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  // NovaPay network card gradients
  const cardGradients: Record<string, string> = {
    'nova': 'from-emerald-500 via-teal-600 to-cyan-700',
    'nova-plus': 'from-purple-500 via-violet-600 to-indigo-700'
  };
  
  // Get the gradient, with fallback for legacy cards
  const gradient = cardGradients[card.cardType] || 'from-emerald-500 via-teal-600 to-cyan-700';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/cards')}
          className="mb-6"
        >
          ← Back to Cards
        </Button>

        {/* Card Display */}
        <div className="mb-8">
          <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-2xl max-w-md mx-auto ${card.status === 'frozen' ? 'opacity-60' : ''}`}>
            {card.status === 'frozen' && (
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold">
                ❄️ Frozen
              </div>
            )}

            <div className="flex justify-between items-start mb-12">
              <div className="text-2xl font-bold">
                {card.cardType === 'nova' ? 'NovaPay' : card.cardType === 'nova-plus' ? 'NovaPay+' : 'NovaPay'}
              </div>
              <div className="w-16 h-10 bg-white/20 rounded backdrop-blur flex items-center justify-center">
                <span className="text-xl font-bold">N</span>
              </div>
            </div>

            <div className="mb-8 text-2xl font-mono tracking-wider">
              {showDetails ? formatCardNumber(card.cardNumber) : '•••• •••• •••• ' + card.cardNumber.replace(/\s/g, '').slice(-4)}
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-70 mb-1">VALID THRU</div>
                <div className="text-lg font-semibold">{card.expiryDate}</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">CVV</div>
                <div className="text-lg font-semibold">
                  {showDetails ? card.cvv : '•••'}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '👁️ Hide' : '👁️ Show'} Full Details
            </Button>
          </div>
        </div>

        {/* Card Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Card Information</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Card Type</span>
              <span className="font-semibold text-gray-900 dark:text-white capitalize">
                {card.cardType}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className={`font-semibold ${card.status === 'active' ? 'text-green-600' : 'text-blue-600'}`}>
                {card.status === 'active' ? '✅ Active' : '❄️ Frozen'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Created</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Date(card.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 dark:text-gray-400">Card ID</span>
              <span className="font-mono text-sm text-gray-900 dark:text-white">
                {card.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Card Actions</h2>
          
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
              🗑️ Delete Card
            </Button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {card.status === 'active' 
              ? 'Freeze your card to temporarily block all transactions.'
              : 'Unfreeze your card to resume using it for transactions.'}
          </p>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
