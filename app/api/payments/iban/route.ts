import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser, createTransaction, getBankAccountByIban } from '@/lib/db/database';
import { Currency } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { iban, amount, currency, reference } = body;

    if (!iban || !amount || !currency) {
      return NextResponse.json(
        { error: 'IBAN, amount, and currency are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Get sender from MongoDB
    const sender = await getUserById(authUser!.userId);
    if (!sender) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the currency balance
    const senderBalances = sender.balances || [];
    const balanceIndex = senderBalances.findIndex(b => b.currency === currency);
    const currentBalance = balanceIndex >= 0 ? senderBalances[balanceIndex].amount : 0;

    if (currentBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Deduct from sender
    const updatedBalances = [...senderBalances];
    if (balanceIndex >= 0) {
      updatedBalances[balanceIndex] = { ...updatedBalances[balanceIndex], amount: currentBalance - amount };
    }

    await updateUser(sender.id, { balances: updatedBalances });

    // Find bank account by IBAN
    const bankAccount = await getBankAccountByIban(iban);
    
    if (bankAccount && bankAccount.userId !== authUser!.userId) {
      // Internal transfer - find recipient
      const recipient = await getUserById(bankAccount.userId);
      
      if (recipient) {
        // Add to recipient
        const recipientBalances = recipient.balances || [];
        const recipientBalanceIndex = recipientBalances.findIndex(b => b.currency === currency);
        
        const updatedRecipientBalances = [...recipientBalances];
        if (recipientBalanceIndex >= 0) {
          updatedRecipientBalances[recipientBalanceIndex] = {
            ...updatedRecipientBalances[recipientBalanceIndex],
            amount: updatedRecipientBalances[recipientBalanceIndex].amount + amount
          };
        } else {
          updatedRecipientBalances.push({ currency: currency as Currency, amount });
        }

        await updateUser(recipient.id, { balances: updatedRecipientBalances });

        // Create transaction for recipient
        await createTransaction({
          id: uuidv4(),
          userId: recipient.id,
          type: 'IBAN_RECEIVE',
          amount,
          currency: currency as Currency,
          from: sender.username,
          iban: iban,
          reference: reference || '',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Create transaction for sender
    await createTransaction({
      id: uuidv4(),
      userId: authUser!.userId,
      type: 'IBAN_TRANSFER',
      amount: -amount,
      currency: currency as Currency,
      to: iban,
      reference: reference || '',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      newBalance: balanceIndex >= 0 ? updatedBalances[balanceIndex].amount : 0,
      message: 'IBAN transfer completed successfully'
    });
  } catch (error) {
    console.error('IBAN transfer error:', error);
    return NextResponse.json(
      { error: 'Failed to process IBAN transfer' },
      { status: 500 }
    );
  }
}

