import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser, createTransaction, getAllCards } from '@/lib/db/database';
import { Currency } from '@/lib/db/types';

// Helper functions to normalize card formats for comparison
// Handle null/undefined gracefully by returning empty string
const normalizeCardNumber = (num: string | null | undefined) => num?.replace(/\s/g, '') ?? '';
const normalizeExpiry = (exp: string | null | undefined) => exp?.replace(/\//g, '') ?? '';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const merchantId = authUser!.userId;
    
    // Get request data
    const { cardNumber, expiryDate, cvv, amount, currency, description } = await request.json();

    // Validate inputs
    if (!cardNumber || !expiryDate || !cvv || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Find the card in the database
    // Normalize formats for comparison:
    // - Card numbers: Database stores with spaces "XXXX XXXX XXXX XXXX", frontend sends without
    // - Expiry dates: Database stores as "MM/YY", frontend sends as "MMYY"
    const normalizedInputCardNumber = normalizeCardNumber(cardNumber);
    const normalizedInputExpiry = normalizeExpiry(expiryDate);
    
    const allCards = await getAllCards();
    
    // Pre-normalize all database cards to avoid repeated normalization in the loop
    const normalizedCards = allCards.map(c => ({
      ...c,
      normalizedCardNumber: normalizeCardNumber(c.cardNumber),
      normalizedExpiry: normalizeExpiry(c.expiryDate)
    }));
    
    const card = normalizedCards.find(c => 
      c.normalizedCardNumber === normalizedInputCardNumber && 
      c.normalizedExpiry === normalizedInputExpiry && 
      c.cvv === cvv &&
      c.status === 'active'
    );

    if (!card) {
      return NextResponse.json(
        { error: 'Invalid card details or card is not active' },
        { status: 404 }
      );
    }

    // Check if card belongs to a personal account (not business)
    // Business POS should only charge personal cards, not other business cards
    if (card.accountType === 'business') {
      return NextResponse.json(
        { error: 'Cannot charge business cards. Please use a personal card for POS payments.' },
        { status: 400 }
      );
    }

    // Get the card owner
    const cardOwner = await getUserById(card.userId);
    
    if (!cardOwner) {
      return NextResponse.json(
        { error: 'Card owner not found' },
        { status: 404 }
      );
    }

    // Check if merchant is trying to charge their own card
    if (cardOwner.id === merchantId) {
      return NextResponse.json(
        { error: 'Cannot charge your own card' },
        { status: 400 }
      );
    }

    // Initialize balances if they don't exist
    const cardOwnerBalances = cardOwner.balances || [{ currency: 'USD', amount: cardOwner.balance || 0 }];
    
    // Find the balance for the card's currency
    const cardOwnerBalance = cardOwnerBalances.find(b => b.currency === (currency || 'USD'));
    
    if (!cardOwnerBalance || cardOwnerBalance.amount < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance on card' },
        { status: 400 }
      );
    }

    // Get merchant
    const merchant = await getUserById(merchantId);
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // Initialize merchant balances if they don't exist
    const merchantBalances = merchant.balances || [{ currency: 'USD', amount: merchant.balance || 0 }];
    
    // Update card owner balance (deduct)
    const updatedCardOwnerBalances = cardOwnerBalances.map(b => 
      b.currency === (currency || 'USD') 
        ? { ...b, amount: b.amount - amount }
        : b
    );
    
    // Update merchant balance (add)
    let merchantCurrencyBalance = merchantBalances.find(b => b.currency === (currency || 'USD'));
    const updatedMerchantBalances = merchantCurrencyBalance
      ? merchantBalances.map(b => 
          b.currency === (currency || 'USD')
            ? { ...b, amount: b.amount + amount }
            : b
        )
      : [...merchantBalances, { currency: (currency || 'USD') as Currency, amount }];

    // Update both users
    await updateUser(cardOwner.id, { balances: updatedCardOwnerBalances });
    await updateUser(merchant.id, { balances: updatedMerchantBalances });

    // Create transaction for card owner (debit)
    const cardOwnerTransaction = await createTransaction({
      id: uuidv4(),
      userId: cardOwner.id,
      type: 'nfc_payment',
      amount: -amount,
      currency: (currency || 'USD') as Currency,
      description: description || `POS payment to ${merchant.username}`,
      status: 'completed',
      recipientId: merchant.id,
      createdAt: new Date().toISOString()
    });

    // Create transaction for merchant (credit)
    const merchantTransaction = await createTransaction({
      id: uuidv4(),
      userId: merchant.id,
      type: 'receive',
      amount: amount,
      currency: (currency || 'USD') as Currency,
      description: description || `POS payment from ${cardOwner.username}`,
      status: 'completed',
      senderId: cardOwner.id,
      cardId: card.id,
      createdAt: new Date().toISOString()
    });

    // Get updated merchant balance
    const updatedMerchant = await getUserById(merchant.id);
    const finalMerchantBalance = updatedMerchant?.balances?.find(b => b.currency === (currency || 'USD'))?.amount || 0;

    return NextResponse.json({
      success: true,
      message: 'Payment successful',
      amount,
      currency: currency || 'USD',
      cardLast4: cardNumber.slice(-4),
      transactionId: merchantTransaction.id,
      description: description || `POS payment from ${cardOwner.username}`,
      merchantBalance: finalMerchantBalance
    });
  } catch (error) {
    console.error('POS charge error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
