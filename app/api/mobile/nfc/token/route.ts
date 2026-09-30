import { randomBytes, createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { createNfcPaymentToken, getCardById } from '@/lib/db/database';
import type { Currency } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];

export async function POST(request: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const maxAmount = Number(body.maxAmount);
    const currency = String(body.currency || 'USD').toUpperCase() as Currency;
    const cardId = typeof body.cardId === 'string' ? body.cardId : undefined;

    if (!Number.isFinite(maxAmount) || maxAmount <= 0 || maxAmount > 10_000) {
      return NextResponse.json({ error: 'Enter a payment limit between 0 and 10,000' }, { status: 400 });
    }
    if (!currencies.includes(currency)) {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
    }
    if (cardId) {
      const card = await getCardById(cardId);
      if (!card || card.userId !== user!.userId || card.status !== 'active') {
        return NextResponse.json({ error: 'Active card not found' }, { status: 404 });
      }
    }

    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const now = Date.now();

    await createNfcPaymentToken({
      id: uuidv4(),
      tokenHash,
      userId: user!.userId,
      cardId,
      currency,
      maxAmount: Math.round(maxAmount * 100) / 100,
      status: 'active',
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 90_000).toISOString(),
    });

    return NextResponse.json(
      { token: rawToken, expiresAt: new Date(now + 90_000).toISOString(), maxAmount, currency },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (tokenError) {
    console.error('Create NFC token error:', tokenError);
    return NextResponse.json({ error: 'Could not create NFC payment token' }, { status: 500 });
  }
}