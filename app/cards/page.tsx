'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import CardItem from '@/components/cards/CardItem';
import { CardsSkeleton } from '@/components/ui/Skeleton';
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
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
        <Navigation />
        <main className="flex-1">
          <CardsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  // Mock preview card for live interactive preview
  const previewCard: Card = {
    id: 'preview',
    userId: 'user',
    cardNumber: cardType === 'nova' ? '7012345678901234' : '7112345678901234',
    expiryDate: '12/29',
    cvv: '888',
    cardType,
    cardFormat,
    currency: cardCurrency,
    accountType: 'personal',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#06090e]">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              My Cards 💳
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Manage your NovaPay virtual and physical payment cards ({cards.length} / 5 created)
            </p>
          </div>
          
          {cards.length < 5 ? (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="self-start sm:self-auto"
            >
              {showCreateForm ? '✕ Cancel' : '+ Create Card'}
            </Button>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Card Limit Reached (5/5)
            </span>
          )}
        </div>

        {/* Warning notification */}
        {cards.length >= 5 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
            <span>ℹ️</span>
            <span>You have reached the maximum limit of 5 cards per account. To issue a new card, delete an existing one.</span>
          </div>
        )}

        {/* Create Card Form with Live Interactive Preview */}
        {showCreateForm && (
          <div className="bezel-card mb-10 animate-slideDown">
            <div className="bezel-card-inner p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Issue New NovaPay Card
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Customize your card format, network tier, and billing currency in real-time.
                  </p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                  Instant Activation
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Controls */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Card Format Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
                      Card Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCardFormat('virtual')}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          cardFormat === 'virtual'
                            ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-850'
                        }`}
                      >
                        <div className="text-2xl mb-1.5">✨</div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">Virtual Card</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Instant digital use</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCardFormat('physical')}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          cardFormat === 'physical'
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-850'
                        }`}
                      >
                        <div className="text-2xl mb-1.5">💳</div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">Physical Card</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Delivered to address</div>
                      </button>
                    </div>
                  </div>

                  {/* Card Tier Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
                      Network Tier
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCardType('nova')}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          cardType === 'nova'
                            ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-850'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-500 mb-2" />
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">NovaPay Standard</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Teal emerald finish</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCardType('nova-plus')}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          cardType === 'nova-plus'
                            ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-850'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-purple-500 mb-2" />
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">NovaPay+ Premium</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Violet indigo finish</div>
                      </button>
                    </div>
                  </div>

                  {/* Currency Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Card Billing Currency
                    </label>
                    <select
                      value={cardCurrency}
                      onChange={(e) => setCardCurrency(e.target.value as Currency)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 text-sm"
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
                    className="w-full py-3"
                  >
                    Confirm &amp; Issue {cardFormat === 'physical' ? 'Physical' : 'Virtual'} {cardType === 'nova' ? 'NovaPay' : 'NovaPay+'}
                  </Button>
                </div>

                {/* Live Card Preview Column */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-gray-50/80 dark:bg-gray-900/60 rounded-2xl border border-gray-200/60 dark:border-gray-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Card Visualizer</span>
                  </div>
                  
                  <div className="w-full max-w-sm transform hover:rotate-1 transition-transform duration-300">
                    <CardItem card={previewCard} />
                  </div>
                  
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4 text-center">
                    Preview updates automatically. All NovaPay cards feature biometric 3D Secure and zero-fee transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm">
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
          <div className="bezel-card">
            <div className="bezel-card-inner p-12 text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                No cards created yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
                Create your first NovaPay virtual card instantly to start shopping and transferring money.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Issue Your First Card
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
