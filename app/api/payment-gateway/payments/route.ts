import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getApiKeyByKey, createPayment, updateApiKey } from '@/lib/db/database';
import { Payment, Currency } from '@/lib/db/types';

// Enable CORS for external websites
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST - Initialize a payment
export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify API key
    const apiKeyRecord = await getApiKeyByKey(apiKey);

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Update last used timestamp
    await updateApiKey(apiKeyRecord.id, { lastUsed: new Date().toISOString() });

    const { amount, currency, description, customerEmail, customerName, orderId, metadata, successUrl, cancelUrl, webhookUrl } = await request.json();

    // Validate inputs
    if (!amount || !currency || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, description' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate currency
    const validCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(currency as Currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create payment
    const payment: Payment = {
      id: uuidv4(),
      apiKeyId: apiKeyRecord.id,
      merchantId: apiKeyRecord.userId,
      amount,
      currency: currency as Currency,
      description,
      customerEmail,
      customerName,
      orderId,
      metadata,
      status: 'pending',
      successUrl,
      cancelUrl,
      webhookUrl,
      createdAt: new Date().toISOString()
    };

    await createPayment(payment);

    // Return payment URL
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/${payment.id}`;

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET - Get payment status
export async function GET(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify API key
    const apiKeyRecord = await getApiKeyByKey(apiKey);

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401, headers: corsHeaders }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { getPaymentById } = await import('@/lib/db/database');
    const payment = await getPaymentById(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Verify merchant owns this payment
    if (payment.merchantId !== apiKeyRecord.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      orderId: payment.orderId,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500, headers: corsHeaders }
    );
  }
}
