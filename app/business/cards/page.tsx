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
      <div className="min-h-screen flex flex-col bg-[#07090D] text-zinc-100 bg-cyber-grid">
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
    <div className="min-h-screen flex flex-col bg-[#07090D] text-zinc-100 bg-cyber-grid">
      <BusinessNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#5E9FE8]/10 border border-[#5E9FE8]/30 text-xs font-bold text-[#5E9FE8] mb-2">
              <span className="w-2 h-2 rounded-xl bg-[#5E9FE8] animate-pulse"></span>
              <span>COMMERCIAL EXPENSE FLEET</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Corporate Card Management
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Issue high-limit virtual and metal physical cards for operations ({cards.length} / 5 active)
            </p>
          </div>

          {cards.length < 5 ? (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-[#5E9FE8] hover:bg-[#7AB2EE] text-[#07090D] font-extrabold shadow-lg shadow-[#5E9FE8]/20"
            >
              {showCreateForm ? '✕ Close Configurator' : '+ Issue Corporate Card'}
            </Button>
          ) : (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#5E9FE8]/20 text-[#5E9FE8] border border-[#5E9FE8]/30">
              Fleet Maximum Reached (5/5)
            </span>
          )}
        </div>

        {/* Create Card Form with Live Interactive Preview */}
        {showCreateForm && (
          <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl animate-slideDown">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Configure Corporate Card
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select network tier, physical delivery or virtual issuance, and account currency.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#5E9FE8]/20 text-[#5E9FE8] border border-[#5E9FE8]/30 font-mono">
                ENTERPRISE LEVEL
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Card Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCardFormat('virtual')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        cardFormat === 'virtual'
                          ? 'border-[#5E9FE8] bg-[#5E9FE8]/10 text-white'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-zinc-400'
                      }`}
                    >
                      <div className="text-2xl mb-1.5">⚡</div>
                      <div className="font-bold text-sm text-white">Instant Virtual Card</div>
                      <div className="text-xs text-zinc-400">Immediate API / online payments</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCardFormat('physical')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        cardFormat === 'physical'
                          ? 'border-[#5E9FE8] bg-[#5E9FE8]/10 text-white'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-zinc-400'
                      }`}
                    >
                      <div className="text-2xl mb-1.5">💳</div>
                      <div className="font-bold text-sm text-white">Titanium Physical Card</div>
                      <div className="text-xs text-zinc-400">Engraved contactless chip</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Network Tier
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCardType('nova')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        cardType === 'nova'
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-zinc-400'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-emerald-400 mb-2" />
                      <div className="font-bold text-sm text-white">Lingoung Commercial</div>
                      <div className="text-xs text-zinc-400">Standard business clearing</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCardType('nova-plus')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        cardType === 'nova-plus'
                          ? 'border-[#5E9FE8] bg-[#5E9FE8]/10 text-white'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-zinc-400'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-xl bg-[#5E9FE8] mb-2" />
                      <div className="font-bold text-sm text-white">Lingoung+ Executive</div>
                      <div className="text-xs text-zinc-400">Unlimited limits &amp; zero FX fee</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Settlement Vault Currency
                  </label>
                  <select
                    value={cardCurrency}
                    onChange={(e) => setCardCurrency(e.target.value as Currency)}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E9FE8] bg-[#07090D] text-white border-white/10 text-sm font-mono"
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
                  className="w-full py-3.5 bg-[#5E9FE8] hover:bg-[#7AB2EE] text-[#07090D] font-extrabold text-sm shadow-xl shadow-[#5E9FE8]/20"
                >
                  Issue Corporate Card Now
                </Button>
              </div>

              {/* Live Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-white/[0.02] rounded-2xl border border-white/10">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xl bg-[#5E9FE8] animate-pulse" />
                  <span>Real-time Card Geometry</span>
                </div>
                
                <div className="w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-300">
                  <CardItem card={previewCard} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm backdrop-blur-md">
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
          <div className="bg-white/[0.03] rounded-3xl p-12 text-center border border-white/10 backdrop-blur-xl">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-lg font-bold text-white mb-2">
              No corporate cards issued yet
            </h3>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6">
              Create your corporate Lingoung card to handle business expenses and team disbursements.
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-[#5E9FE8] hover:bg-[#7AB2EE] text-[#07090D] font-extrabold"
            >
              Issue First Corporate Card
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
