'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import CardItem from '@/components/cards/CardItem';
import { Card, Currency, NovapayCardType } from '@/lib/db/types';
import { getSupportedCurrencies } from '@/lib/utils/currency';

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cardType, setCardType] = useState<NovapayCardType>('nova');
  const [cardFormat, setCardFormat] = useState<'virtual' | 'physical'>('virtual');
  const [cardCurrency, setCardCurrency] = useState<Currency>('USD');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      setCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (cards.length >= 5) {
      setError('Maximum 5 cards allowed');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cardType, 
          cardFormat,
          currency: cardCurrency 
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create card');
      }

      await fetchCards();
      setShowCreateForm(false);
      setCardType('nova');
      setCardFormat('virtual');
      setCardCurrency('USD');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setCreating(false);
    }
  };

  const handleCardClick = (cardId: string) => {
    router.push(`/cards/${cardId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading cards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Cards 💳
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {cards.length} of 5 cards created
            </p>
          </div>
          
          {cards.length < 5 && (
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : '+ Create Card'}
            </Button>
          )}
        </div>

        {/* Warning */}
        {cards.length >= 5 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-4 rounded-lg mb-6">
            ⚠️ You&apos;ve reached the maximum limit of 5 cards
          </div>
        )}

        {/* Create Card Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Card
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCardFormat('virtual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    cardFormat === 'virtual'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Virtual</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Instant, online use</div>
                </button>
                
                <button
                  onClick={() => setCardFormat('physical')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    cardFormat === 'physical'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Physical</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Delivered by mail</div>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Card Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCardType('nova')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    cardType === 'nova'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold text-gray-900 dark:text-white">NovaPay</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Teal gradient</div>
                </button>
                
                <button
                  onClick={() => setCardType('nova-plus')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    cardType === 'nova-plus'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold text-gray-900 dark:text-white">NovaPay+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Purple gradient</div>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Currency
              </label>
              <select
                value={cardCurrency}
                onChange={(e) => setCardCurrency(e.target.value as Currency)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              >
                {getSupportedCurrencies().map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <Button 
              onClick={handleCreateCard}
              isLoading={creating}
              className="w-full"
            >
              Create {cardFormat === 'physical' ? 'Physical' : 'Virtual'} {cardType === 'nova' ? 'NovaPay' : 'NovaPay+'} Card
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <CardItem 
                key={card.id} 
                card={card} 
                onClick={() => handleCardClick(card.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No cards yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first virtual card to start making payments
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Card
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
