import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPaymentById, updatePayment, getAllCards, getUserById, updateUser, createTransaction } from '@/lib/db/database';

// Payment gateway fee percentage
const PAYMENT_GATEWAY_FEE_PERCENTAGE = 0.025; // 2.5%

// GET - Get payment details for payment page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;

    const payment = await getPaymentById(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        merchantId: payment.merchantId,
        status: payment.status,
        customerEmail: payment.customerEmail,
        customerName: payment.customerName,
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

// POST - Process payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;
    const { email, cardNumber, expiryDate, cvv } = await request.json();

    // Validate inputs
    if (!email || !cardNumber || !expiryDate || !cvv) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get payment
    const payment = await getPaymentById(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment is not in pending status' },
        { status: 400 }
      );
    }

    // Update payment to processing
    await updatePayment(paymentId, { status: 'processing' });

    // Find the card in the database
    const normalizedCardNumber = cardNumber.replace(/\s/g, '');
    const normalizedExpiry = expiryDate.replace(/\//g, '');
    
    const allCards = await getAllCards();
    
    const card = allCards.find(c => {
      const dbCardNumber = c.cardNumber?.replace(/\s/g, '') ?? '';
      const dbExpiry = c.expiryDate?.replace(/\//g, '') ?? '';
      return dbCardNumber === normalizedCardNumber && 
             dbExpiry === normalizedExpiry && 
             c.cvv === cvv &&
             c.status === 'active';
    });

    if (!card) {
      await updatePayment(paymentId, { 
        status: 'failed',
        failedReason: 'Invalid card details'
      });
      return NextResponse.json(
        { error: 'Invalid card details' },
        { status: 400 }
      );
    }

    // Get card owner (payer)
    const payer = await getUserById(card.userId);
    
    if (!payer) {
      await updatePayment(paymentId, { 
        status: 'failed',
        failedReason: 'Card owner not found'
      });
      return NextResponse.json(
        { error: 'Card owner not found' },
        { status: 404 }
      );
    }

    // Check balance
    const payerBalances = payer.balances || [{ currency: 'USD', amount: payer.balance || 0 }];
    const payerBalance = payerBalances.find(b => b.currency === payment.currency);
    
    if (!payerBalance || payerBalance.amount < payment.amount) {
      await updatePayment(paymentId, { 
        status: 'failed',
        failedReason: 'Insufficient balance'
      });
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get merchant
    const merchant = await getUserById(payment.merchantId);
    
    if (!merchant) {
      await updatePayment(paymentId, { 
        status: 'failed',
        failedReason: 'Merchant not found'
      });
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // Calculate fee (2.5%)
    const fee = payment.amount * PAYMENT_GATEWAY_FEE_PERCENTAGE;
    const merchantAmount = payment.amount - fee;

    // Initialize merchant balances if they don't exist
    const merchantBalances = merchant.balances || [{ currency: 'USD', amount: merchant.balance || 0 }];
    
    // Update payer balance (deduct)
    const updatedPayerBalances = payerBalances.map(b => 
      b.currency === payment.currency 
        ? { ...b, amount: b.amount - payment.amount }
        : b
    );
    
    // Update merchant balance (add)
    let merchantCurrencyBalance = merchantBalances.find(b => b.currency === payment.currency);
    const updatedMerchantBalances = merchantCurrencyBalance
      ? merchantBalances.map(b => 
          b.currency === payment.currency
            ? { ...b, amount: b.amount + merchantAmount }
            : b
        )
      : [...merchantBalances, { currency: payment.currency, amount: merchantAmount }];

    // Update both users
    await updateUser(payer.id, { balances: updatedPayerBalances });
    await updateUser(merchant.id, { balances: updatedMerchantBalances });

    // Update payment status
    await updatePayment(paymentId, { 
      status: 'completed',
      completedAt: new Date().toISOString(),
      payerId: payer.id,
      cardId: card.id,
      paymentMethod: 'card'
    });

    // Create transaction for payer (debit)
    await createTransaction({
      id: uuidv4(),
      userId: payer.id,
      type: 'send',
      amount: -payment.amount,
      currency: payment.currency,
      description: `Payment to ${merchant.username}: ${payment.description}`,
      status: 'completed',
      recipientId: merchant.id,
      createdAt: new Date().toISOString()
    });

    // Create transaction for merchant (credit)
    await createTransaction({
      id: uuidv4(),
      userId: merchant.id,
      type: 'receive',
      amount: merchantAmount,
      currency: payment.currency,
      fee,
      description: `Payment from ${payer.username}: ${payment.description}`,
      status: 'completed',
      senderId: payer.id,
      createdAt: new Date().toISOString()
    });

    // Call webhook if provided
    if (payment.webhookUrl) {
      try {
        await fetch(payment.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'payment.completed',
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            orderId: payment.orderId,
            metadata: payment.metadata,
            timestamp: new Date().toISOString()
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the payment if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: 'completed',
      successUrl: payment.successUrl
    });
  } catch (error) {
    console.error('Process payment error:', error);
    
    // Try to update payment status to failed
    try {
      const { id: paymentId } = await params;
      await updatePayment(paymentId, { 
        status: 'failed',
        failedReason: 'Internal server error'
      });
    } catch (updateError) {
      console.error('Failed to update payment status:', updateError);
    }

    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
