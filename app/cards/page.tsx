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

  // Preview card dynamically constructed from user form choices
  const previewCard: Card = {
    id: 'preview-card',
    userId: 'current-user',
    cardNumber: '7003 2114 8051 1885',
    expiryDate: '07/31',
    cvv: '481',
    cardType,
    cardFormat,
    currency: cardCurrency,
    accountType: 'personal',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#05070B] text-white">
        <Navigation />
        <main className="flex-1">
          <CardsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05070B] text-slate-100 overflow-x-hidden selection:bg-[#d4ff00] selection:text-black">
      {/* Background Cyber Grid & Sunset Glow Orbs (References: Image 3 & 4) */}
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none opacity-40 z-0"></div>
      <div className="fixed -top-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/10 via-orange-600/5 to-transparent rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-[#d4ff00]/10 via-emerald-600/5 to-transparent rounded-full blur-[160px] pointer-events-none z-0"></div>

      <Navigation />
      
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>Card Studio</span>
              <span>&bull;</span>
              <span className="text-[#d4ff00]">NovaPay Cards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Virtual &amp; Physical Cards</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Issue instant online virtual cards or order physical biometric cards in 7 currencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {cards.length < 5 ? (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-5 py-2.5 rounded-full bg-[#d4ff00] hover:bg-[#bce400] text-black font-extrabold text-xs transition-all active:scale-95 shadow cursor-pointer flex items-center gap-2"
              >
                <span>{showCreateForm ? '✕ Close Studio' : '+ Issue New Card'}</span>
              </button>
            ) : (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Card Limit Reached (5/5)
              </span>
            )}
          </div>
        </div>

        {/* Warning notification */}
        {cards.length >= 5 && (
          <div className="bg-amber-950/40 border border-amber-800 text-amber-300 p-4 rounded-xl mb-6 text-xs flex items-center gap-3">
            <span>ℹ️</span>
            <span>You have reached the maximum limit of 5 cards per account. To issue a new card, delete an existing one.</span>
          </div>
        )}

        {/* Create Card Form with Live Interactive Preview (References: Images 1, 2 & 3) */}
        {showCreateForm && (
          <div className="bezel-card mb-10 animate-slideDown">
            <div className="bezel-card-inner p-6 sm:p-8 bg-[#080B12]/95 border border-white/10">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Issue New NovaPay Card
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize your card format, network aesthetic, and ledger currency in real-time.
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/20">
                  Instant Activation
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Controls */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Card Format Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                      Card Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCardFormat('virtual')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          cardFormat === 'virtual'
                            ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500'
                            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                        }`}
                      >
                        <div className="text-2xl mb-1.5">✨</div>
                        <div className="font-semibold text-white text-sm">Virtual Card</div>
                        <div className="text-xs text-slate-400">Instant digital shopping (Zip / Affirm)</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCardFormat('physical')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          cardFormat === 'physical'
                            ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500'
                            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                        }`}
                      >
                        <div className="text-2xl mb-1.5">💳</div>
                        <div className="font-semibold text-white text-sm">Physical Card</div>
                        <div className="text-xs text-slate-400">Delivered with NFC chip</div>
                      </button>
                    </div>
                  </div>

                  {/* Card Aesthetic Tier Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                      Card Aesthetic &amp; Network Tier
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCardType('nova')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          cardType === 'nova'
                            ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500'
                            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-blue-500 mb-2" />
                        <div className="font-semibold text-white text-sm">Affirm Cobalt Wave</div>
                        <div className="text-xs text-slate-400">Royal blue wave geometry</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCardType('nova-plus')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          cardType === 'nova-plus'
                            ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500'
                            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-purple-500 mb-2" />
                        <div className="font-semibold text-white text-sm">Zip Diagonal Split</div>
                        <div className="text-xs text-slate-400">Plum-to-violet two-tone</div>
                      </button>
                    </div>
                  </div>

                  {/* Currency Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                      Card Billing Currency
                    </label>
                    <select
                      value={cardCurrency}
                      onChange={(e) => setCardCurrency(e.target.value as Currency)}
                      className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-[#06080E] text-white border-white/15 text-sm"
                    >
                      {getSupportedCurrencies().map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={handleCreateCard}
                    disabled={creating}
                    className="w-full py-3 px-6 rounded-full bg-white hover:bg-slate-200 text-black font-extrabold text-xs transition-all active:scale-98 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {creating ? 'Issuing card...' : `Confirm & Issue ${cardFormat === 'physical' ? 'Physical' : 'Virtual'} ${cardType === 'nova' ? 'Affirm Wave' : 'Zip Split'}`}
                  </button>
                </div>

                {/* Live Card Preview Column */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#d4ff00] animate-pulse" />
                    <span>Live Reference Visualizer</span>
                  </div>
                  
                  <div className="w-full max-w-sm transform hover:rotate-1 transition-transform duration-300">
                    <CardItem card={previewCard} />
                  </div>
                  
                  <p className="text-[11px] text-slate-400 mt-4 text-center">
                    Preview updates automatically in real-time. Modeled after reference card architectures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-xl mb-6 text-xs">
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
            <div className="bezel-card-inner text-center py-16 px-4 bg-[#080B12]/80 border border-white/10">
              <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                💳
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Cards Issued Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                Create your first NovaPay virtual card in seconds to start shopping online with zero fees and custom spending limits.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2.5 rounded-full bg-[#d4ff00] text-black font-extrabold text-xs transition-all active:scale-95 shadow cursor-pointer"
              >
                + Issue Your First Card
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
