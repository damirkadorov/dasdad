import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, getUserByUsername, getUserByEmail, updateUser, createTransaction } from '@/lib/db/database';

export async function POST(request: NextRequest) {
  try {
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { recipient, amount } = body;

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

    // Check if sender has sufficient balance
    if (sender.balance < amount) {
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
    const senderBalanceBefore = sender.balance;
    const senderBalanceAfter = senderBalanceBefore - amount;
    const recipientBalanceBefore = recipientUser.balance;
    const recipientBalanceAfter = recipientBalanceBefore + amount;

    await updateUser(sender.id, { balance: senderBalanceAfter });
    await updateUser(recipientUser.id, { balance: recipientBalanceAfter });

    // Create transaction for sender in MongoDB
    await createTransaction({
      id: uuidv4(),
      userId: sender.id,
      type: 'send',
      amount: -amount,
      balanceBefore: senderBalanceBefore,
      balanceAfter: senderBalanceAfter,
      recipientId: recipientUser.id,
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
      balanceBefore: recipientBalanceBefore,
      balanceAfter: recipientBalanceAfter,
      senderId: sender.id,
      description: `Received from @${sender.username}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

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
