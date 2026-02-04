import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, getUserByUsername, getUserByEmail, updateUser, createTransaction } from '@/lib/db/database';
import { sendTransferNotification } from '@/lib/utils/email';
import { Currency } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { recipient, amount, currency = 'USD' } = body;

    // Validate input
    if (!recipient || !amount) {
      return NextResponse.json(
        { error: 'Recipient and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get sender from MongoDB
    const sender = await getUserById(authUser!.userId);
    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      );
    }

    // Initialize balances if they don't exist
    const senderBalances = sender.balances || [{ currency: 'USD', amount: sender.balance || 0 }];
    
    // Find sender's balance in the specified currency
    const senderCurrencyBalance = senderBalances.find(b => b.currency === currency);
    const currentSenderBalance = senderCurrencyBalance ? senderCurrencyBalance.amount : 0;

    // Check if sender has sufficient balance
    if (currentSenderBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Find recipient by username or email from MongoDB
    let recipientUser = await getUserByUsername(recipient);
    if (!recipientUser) {
      recipientUser = await getUserByEmail(recipient);
    }

    if (!recipientUser) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Cannot send money to self
    if (recipientUser.id === sender.id) {
      return NextResponse.json(
        { error: 'Cannot send money to yourself' },
        { status: 400 }
      );
    }

    // Update balances in MongoDB
    const senderBalanceBefore = currentSenderBalance;
    const senderBalanceAfter = senderBalanceBefore - amount;
    
    // Update sender's balances
    const updatedSenderBalances = senderBalances.map(b => 
      b.currency === currency ? { ...b, amount: senderBalanceAfter } : b
    );
    
    // Initialize recipient balances
    const recipientBalances = recipientUser.balances || [{ currency: 'USD', amount: recipientUser.balance || 0 }];
    const recipientCurrencyBalance = recipientBalances.find(b => b.currency === currency);
    const recipientBalanceBefore = recipientCurrencyBalance ? recipientCurrencyBalance.amount : 0;
    const recipientBalanceAfter = recipientBalanceBefore + amount;
    
    // Update or add recipient's balance in the specified currency
    let updatedRecipientBalances;
    if (recipientCurrencyBalance) {
      updatedRecipientBalances = recipientBalances.map(b => 
        b.currency === currency ? { ...b, amount: recipientBalanceAfter } : b
      );
    } else {
      updatedRecipientBalances = [...recipientBalances, { currency: currency as Currency, amount: recipientBalanceAfter }];
    }

    await updateUser(sender.id, { 
      balances: updatedSenderBalances,
      balance: currency === 'USD' ? senderBalanceAfter : sender.balance // Update legacy balance if USD
    });
    await updateUser(recipientUser.id, { 
      balances: updatedRecipientBalances,
      balance: currency === 'USD' ? recipientBalanceAfter : recipientUser.balance // Update legacy balance if USD
    });

    // Create transaction for sender in MongoDB
    await createTransaction({
      id: uuidv4(),
      userId: sender.id,
      type: 'send',
      amount: -amount,
      currency: currency as Currency,
      balanceBefore: senderBalanceBefore,
      balanceAfter: senderBalanceAfter,
      recipientId: recipientUser.id,
      fee: 0,
      description: `Sent to @${recipientUser.username}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    // Create transaction for recipient in MongoDB
    await createTransaction({
      id: uuidv4(),
      userId: recipientUser.id,
      type: 'receive',
      amount: amount,
      currency: currency as Currency,
      balanceBefore: recipientBalanceBefore,
      balanceAfter: recipientBalanceAfter,
      senderId: sender.id,
      fee: 0,
      description: `Received from @${sender.username}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    // Send email notifications (don't wait for them)
    sendTransferNotification(
      sender.email,
      sender.username,
      'sent',
      amount,
      currency,
      recipientUser.username
    ).catch(err => console.error('Failed to send email:', err));
    
    sendTransferNotification(
      recipientUser.email,
      recipientUser.username,
      'received',
      amount,
      currency,
      sender.username
    ).catch(err => console.error('Failed to send email:', err));

    return NextResponse.json(
      {
        message: 'Payment sent successfully',
        transaction: {
          amount,
          recipient: recipientUser.username,
          balanceAfter: senderBalanceAfter
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
