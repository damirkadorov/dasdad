import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import {
  claimNfcPaymentToken,
  createTransaction,
  getActiveNfcPaymentToken,
  getUserById,
  updateUser,
} from '@/lib/db/database';
import type { Currency, CurrencyBalance } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

function getBalance(balances: CurrencyBalance[], currency: Currency, legacyBalance: number) {
  return balances.find((item) => item.currency === currency)?.amount ?? (currency === 'USD' ? legacyBalance : 0);
}

function setBalance(balances: CurrencyBalance[], currency: Currency, amount: number) {
  const found = balances.some((item) => item.currency === currency);
  return found
    ? balances.map((item) => item.currency === currency ? { ...item, amount } : item)
    : [...balances, { currency, amount }];
}

export async function POST(request: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const merchant = await getUserById(user!.userId);
    if (!merchant || merchant.accountType !== 'business') {
      return NextResponse.json({ error: 'Business account required' }, { status: 403 });
    }

    const body = await request.json();
    const rawToken = String(body.token || '');
    const amount = Math.round(Number(body.amount) * 100) / 100;
    const currency = String(body.currency || 'USD').toUpperCase() as Currency;
    const description = String(body.description || 'Lingoung NFC POS payment').slice(0, 160);

    if (!rawToken || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid token and amount are required' }, { status: 400 });
    }

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const pendingToken = await getActiveNfcPaymentToken(tokenHash);
    if (!pendingToken) {
      return NextResponse.json({ error: 'NFC authorization expired or was already used' }, { status: 409 });
    }
    if (pendingToken.currency !== currency || amount > pendingToken.maxAmount) {
      return NextResponse.json({ error: `Payment exceeds the authorized ${pendingToken.maxAmount} ${pendingToken.currency} limit` }, { status: 400 });
    }
    if (pendingToken.userId === merchant.id) {
      return NextResponse.json({ error: 'A merchant cannot pay their own terminal' }, { status: 400 });
    }

    const payer = await getUserById(pendingToken.userId);
    if (!payer) return NextResponse.json({ error: 'Customer account not found' }, { status: 404 });

    const payerBalances = payer.balances?.length ? payer.balances : [{ currency: 'USD' as Currency, amount: payer.balance || 0 }];
    const merchantBalances = merchant.balances?.length ? merchant.balances : [{ currency: 'USD' as Currency, amount: merchant.balance || 0 }];
    const payerBefore = getBalance(payerBalances, currency, payer.balance || 0);
    if (payerBefore < amount) {
      return NextResponse.json({ error: 'Customer has insufficient funds' }, { status: 400 });
    }

    const claimed = await claimNfcPaymentToken(tokenHash);
    if (!claimed) {
      return NextResponse.json({ error: 'NFC authorization was already used' }, { status: 409 });
    }

    const merchantBefore = getBalance(merchantBalances, currency, merchant.balance || 0);
    const payerAfter = payerBefore - amount;
    const merchantAfter = merchantBefore + amount;
    await Promise.all([
      updateUser(payer.id, {
        balances: setBalance(payerBalances, currency, payerAfter),
        balance: currency === 'USD' ? payerAfter : payer.balance,
      }),
      updateUser(merchant.id, {
        balances: setBalance(merchantBalances, currency, merchantAfter),
        balance: currency === 'USD' ? merchantAfter : merchant.balance,
      }),
    ]);

    const paymentId = uuidv4();
    const now = new Date().toISOString();
    await Promise.all([
      createTransaction({
        id: paymentId,
        userId: payer.id,
        type: 'nfc_payment',
        amount,
        currency,
        balanceBefore: payerBefore,
        balanceAfter: payerAfter,
        recipientId: merchant.id,
        cardId: claimed.cardId,
        description,
        status: 'completed',
        createdAt: now,
      }),
      createTransaction({
        id: uuidv4(),
        userId: merchant.id,
        type: 'receive',
        amount,
        currency,
        balanceBefore: merchantBefore,
        balanceAfter: merchantAfter,
        senderId: payer.id,
        description: `NFC POS: ${description}`,
        status: 'completed',
        createdAt: now,
      }),
    ]);

    return NextResponse.json({
      success: true,
      paymentId,
      amount,
      currency,
      customer: payer.username,
      balance: merchantAfter,
    });
  } catch (chargeError) {
    console.error('NFC POS charge error:', chargeError);
    return NextResponse.json({ error: 'NFC payment failed' }, { status: 500 });
  }
}