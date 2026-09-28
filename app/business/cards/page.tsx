'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BusinessNavigation from '@/components/business/BusinessNavigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import CardItem from '@/components/cards/CardItem';
import { CardsSkeleton } from '@/components/ui/Skeleton';
import { Card, Currency, NovapayCardType } from '@/lib/db/types';
import { getSupportedCurrencies } from '@/lib/utils/currency';

export default function BusinessCardsPage() {
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
          currency: cardCurrency,
          accountType: 'business'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create business card');
      }

      await fetchCards();
      setShowCreateForm(false);
      setCardType('nova');
      setCardFormat('virtual');
      setCardCurrency('USD');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business card');
    } finally {
      setCreating(false);
    }
  };

  const handleCardClick = (cardId: string) => {
    router.push(`/cards/${cardId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <BusinessNavigation />
        <main className="flex-1">
          <CardsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  const previewCard: Card = {
    id: 'preview',
    userId: 'user',
    cardNumber: cardType === 'nova' ? '7099887766554433' : '7199887766554433',
    expiryDate: '12/29',
    cvv: '999',
    cardType,
    cardFormat,
    currency: cardCurrency,
    accountType: 'business',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <BusinessNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-400 mb-2">
              <span>💼 Corporate Cards</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Business Payment Cards
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Issue expense cards for your team and operations ({cards.length} / 5 created)
            </p>
          </div>

          {cards.length < 5 ? (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/20"
            >
              {showCreateForm ? '✕ Cancel' : '+ Issue Corporate Card'}
            </Button>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Card Limit Reached (5/5)
            </span>
          )}
        </div>

        {/* Create Card Form with Live Interactive Preview */}
        {showCreateForm && (
          <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl animate-slideDown">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Configure Corporate Card
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select network tier, physical delivery or virtual issuance, and account currency.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Corporate Tier
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Card Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCardFormat('virtual')}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        cardFormat === 'virtual'
                          ? 'border-amber-500 bg-amber-500/10 text-white'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1.5">✨</div>
                      <div className="font-semibold text-sm">Virtual Card</div>
                      <div className="text-xs text-slate-400">Immediate API / online use</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCardFormat('physical')}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        cardFormat === 'physical'
                          ? 'border-amber-500 bg-amber-500/10 text-white'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1.5">💳</div>
                      <div className="font-semibold text-sm">Physical Card</div>
                      <div className="text-xs text-slate-400">Metal engraved finish</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Network Tier
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCardType('nova')}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        cardType === 'nova'
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mb-2" />
                      <div className="font-semibold text-sm">NovaPay Business</div>
                      <div className="text-xs text-slate-400">Standard business tier</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCardType('nova-plus')}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        cardType === 'nova-plus'
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-purple-500 mb-2" />
                      <div className="font-semibold text-sm">NovaPay+ Executive</div>
                      <div className="text-xs text-slate-400">Unlimited limits &amp; perks</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Settlement Currency
                  </label>
                  <select
                    value={cardCurrency}
                    onChange={(e) => setCardCurrency(e.target.value as Currency)}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-800 text-white border-slate-700 text-sm"
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
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 font-semibold"
                >
                  Issue Corporate Card Now
                </Button>
              </div>

              {/* Live Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-800/40 rounded-2xl border border-slate-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Card Visualizer</span>
                </div>
                
                <div className="w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-300">
                  <CardItem card={previewCard} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-900 text-red-400 p-4 rounded-xl mb-6 text-sm">
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
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-lg font-bold text-white mb-2">
              No business cards issued yet
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              Create your corporate NovaPay card to handle business expenses and team disbursements.
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
            >
              Issue First Business Card
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
