/**
 * NovaPay Service
 * Core payment processing logic for the NovaPay payment network
 */

import { v4 as uuidv4 } from 'uuid';
import {
  NovapayFlow,
  NovapayResultCode,
  NovapayReserveRequest,
  NovapayCardAuthRequest,
  NovapayCurrency,
  NovapayApiResponse,
  NovapayLookupResponseData,
  NovapayWebhookEvent,
  IdempotencyRecord,
  NOVAPAY_HOLD_EXPIRY_DAYS,
  NOVAPAY_FEE_PERCENTAGE,
  NOVAPAY_CARD_PREFIX,
  NOVAPAY_FLOW_PREFIX,
  VALID_CURRENCIES,
} from './types';
import {
  createNovapayFlow,
  getNovapayFlowById,
  updateNovapayFlow,
  getIdempotencyRecord,
  createIdempotencyRecord,
} from './database';
import { getAllCards, getUserById, updateUser, createTransaction } from '../db/database';
import { Card } from '../db/types';

/**
 * Generate a unique flow ID
 */
function generateFlowId(): string {
  return `${NOVAPAY_FLOW_PREFIX}${uuidv4().replace(/-/g, '')}`;
}

/**
 * Calculate hold expiration date
 */
function calculateExpiryDate(): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + NOVAPAY_HOLD_EXPIRY_DAYS);
  return expiry.toISOString();
}

/**
 * Validate that a card number belongs to NovaPay network (starts with 7)
 */
export function isNovapayCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.startsWith(NOVAPAY_CARD_PREFIX) && cleaned.length === 16;
}

/**
 * Validate currency
 */
function isValidCurrency(currency: string): currency is NovapayCurrency {
  return VALID_CURRENCIES.includes(currency as NovapayCurrency);
}

/**
 * Send webhook notification (non-blocking)
 */
async function sendWebhook(url: string, event: NovapayWebhookEvent): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NovaPay-Event': event.eventType,
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error('NovaPay webhook delivery failed:', error);
  }
}

/**
 * Dispatch webhook event for a flow
 */
function dispatchFlowEvent(flow: NovapayFlow, eventType: NovapayWebhookEvent['eventType']): void {
  if (!flow.notifyUrl) return;
  
  const event: NovapayWebhookEvent = {
    eventType,
    flowId: flow.flowId,
    merchantRef: flow.merchantRef,
    state: flow.state,
    amount: flow.amount,
    currency: flow.currency,
    timestamp: new Date().toISOString(),
    data: flow.merchantData,
  };
  
  // Non-blocking webhook dispatch
  sendWebhook(flow.notifyUrl, event).catch(console.error);
}

/**
 * Check and return cached idempotent response if exists
 */
export async function checkIdempotency(
  idempotencyKey: string | null,
  apiKeyId: string
): Promise<{ cached: boolean; response?: NovapayApiResponse }> {
  if (!idempotencyKey) {
    return { cached: false };
  }
  
  const key = `${apiKeyId}:${idempotencyKey}`;
  const record = await getIdempotencyRecord(key);
  
  if (record) {
    return { cached: true, response: record.response };
  }
  
  return { cached: false };
}

/**
 * Store idempotent response
 */
export async function storeIdempotencyResponse(
  idempotencyKey: string,
  apiKeyId: string,
  flowId: string,
  response: NovapayApiResponse
): Promise<void> {
  const key = `${apiKeyId}:${idempotencyKey}`;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour TTL
  
  const record: IdempotencyRecord = {
    key,
    flowId,
    response,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  
  await createIdempotencyRecord(record);
}

// ============================================================================
// Public API Operations
// ============================================================================

/**
 * Create a new payment flow (reserve/authorize)
 */
export async function createReservation(
  merchantId: string,
  apiKeyId: string,
  request: NovapayReserveRequest,
  baseUrl: string
): Promise<{ resultCode: NovapayResultCode; flow?: NovapayFlow; checkoutUrl?: string }> {
  // Validate amount
  if (!request.amount || request.amount <= 0) {
    return { resultCode: NovapayResultCode.INVALID_AMOUNT };
  }
  
  // Validate currency
  if (!request.currency || !isValidCurrency(request.currency)) {
    return { resultCode: NovapayResultCode.INVALID_CURRENCY };
  }
  
  // Validate memo
  if (!request.memo || request.memo.trim().length === 0) {
    return { resultCode: NovapayResultCode.MISSING_FIELD };
  }
  
  // Verify merchant exists
  const merchant = await getUserById(merchantId);
  if (!merchant) {
    return { resultCode: NovapayResultCode.MERCHANT_NOT_FOUND };
  }
  
  // Create the flow
  const flowId = generateFlowId();
  const expiresAt = calculateExpiryDate();
  
  const flow: NovapayFlow = {
    flowId,
    merchantId,
    apiKeyId,
    amount: request.amount,
    currency: request.currency,
    memo: request.memo,
    state: 'CREATED',
    resultCode: NovapayResultCode.APPROVED,
    merchantRef: request.merchantRef,
    merchantData: request.merchantData,
    customerEmail: request.customerEmail,
    customerName: request.customerName,
    onComplete: request.onComplete,
    onCancel: request.onCancel,
    notifyUrl: request.notifyUrl,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
  
  await createNovapayFlow(flow);
  
  const checkoutUrl = `${baseUrl}/checkout/${flowId}`;
  
  return {
    resultCode: NovapayResultCode.APPROVED,
    flow,
    checkoutUrl,
  };
}

/**
 * Authorize a card against a flow (called from checkout page)
 */
export async function authorizeCard(
  request: NovapayCardAuthRequest
): Promise<{ resultCode: NovapayResultCode; flow?: NovapayFlow }> {
  // Get the flow
  const flow = await getNovapayFlowById(request.flowId);
  if (!flow) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  // Check flow state
  if (flow.state !== 'CREATED') {
    return { resultCode: NovapayResultCode.INVALID_STATE_TRANSITION };
  }
  
  // Check if flow has expired
  if (flow.expiresAt && new Date(flow.expiresAt) < new Date()) {
    await updateNovapayFlow(flow.flowId, {
      state: 'EXPIRED',
      resultCode: NovapayResultCode.HOLD_EXPIRED,
    });
    return { resultCode: NovapayResultCode.HOLD_EXPIRED };
  }
  
  // Clean card number
  const cleanCardNumber = request.cardNumber.replace(/\s/g, '');
  
  // Validate NovaPay card format
  if (!isNovapayCard(cleanCardNumber)) {
    await updateNovapayFlow(flow.flowId, {
      state: 'DENIED',
      resultCode: NovapayResultCode.NOT_NOVAPAY_CARD,
      declineReason: 'Card is not a NovaPay card',
    });
    dispatchFlowEvent({ ...flow, state: 'DENIED' }, 'flow.denied');
    return { resultCode: NovapayResultCode.NOT_NOVAPAY_CARD };
  }
  
  // Look up the card in the database
  const allCards = await getAllCards();
  const card = findMatchingCard(allCards, cleanCardNumber, request.expiryMonth, request.expiryYear, request.securityCode);
  
  if (!card) {
    await updateNovapayFlow(flow.flowId, {
      state: 'DENIED',
      resultCode: NovapayResultCode.CARD_NOT_FOUND,
      declineReason: 'Card not found or invalid details',
    });
    dispatchFlowEvent({ ...flow, state: 'DENIED' }, 'flow.denied');
    return { resultCode: NovapayResultCode.CARD_NOT_FOUND };
  }
  
  // Check card status
  if (card.status !== 'active') {
    await updateNovapayFlow(flow.flowId, {
      state: 'DENIED',
      resultCode: NovapayResultCode.CARD_INACTIVE,
      declineReason: 'Card is not active',
    });
    dispatchFlowEvent({ ...flow, state: 'DENIED' }, 'flow.denied');
    return { resultCode: NovapayResultCode.CARD_INACTIVE };
  }
  
  // Check card expiry
  if (isCardExpired(card.expiryDate)) {
    await updateNovapayFlow(flow.flowId, {
      state: 'DENIED',
      resultCode: NovapayResultCode.CARD_EXPIRED,
      declineReason: 'Card has expired',
    });
    dispatchFlowEvent({ ...flow, state: 'DENIED' }, 'flow.denied');
    return { resultCode: NovapayResultCode.CARD_EXPIRED };
  }
  
  // Get card owner
  const payer = await getUserById(card.userId);
  if (!payer) {
    await updateNovapayFlow(flow.flowId, {
      state: 'DENIED',
      resultCode: NovapayResultCode.INTERNAL_ERROR,
      declineReason: 'Card owner not found',
    });
    return { resultCode: NovapayResultCode.INTERNAL_ERROR };
  }
  
  // Check balance
  const payerBalances = payer.balances || [{ currency: 'USD', amount: payer.balance || 0 }];
  const currencyBalance = payerBalances.find(b => b.currency === flow.currency);
  
  if (!currencyBalance || currencyBalance.amount < flow.amount) {
    await updateNovapayFlow(flow.flowId, {
      state: 'DENIED',
      resultCode: NovapayResultCode.INSUFFICIENT_FUNDS,
      declineReason: 'Insufficient funds',
    });
    dispatchFlowEvent({ ...flow, state: 'DENIED' }, 'flow.denied');
    return { resultCode: NovapayResultCode.INSUFFICIENT_FUNDS };
  }
  
  // Create hold - deduct from available balance
  const holdId = `hold_${uuidv4()}`;
  const updatedBalances = payerBalances.map(b =>
    b.currency === flow.currency
      ? { ...b, amount: b.amount - flow.amount }
      : b
  );
  
  await updateUser(payer.id, { balances: updatedBalances });
  
  // Update flow to HELD state
  const updatedFlow = await updateNovapayFlow(flow.flowId, {
    state: 'HELD',
    resultCode: NovapayResultCode.HOLD_CREATED,
    cardId: card.id,
    payerId: payer.id,
    holdId,
    heldAmount: flow.amount,
    heldAt: new Date().toISOString(),
    customerEmail: request.cardholderEmail || flow.customerEmail,
  });
  
  // Dispatch webhook
  if (updatedFlow) {
    dispatchFlowEvent(updatedFlow, 'flow.held');
  }
  
  return {
    resultCode: NovapayResultCode.HOLD_CREATED,
    flow: updatedFlow || undefined,
  };
}

/**
 * Charge (commit) a held flow
 */
export async function chargeFlow(
  flowId: string,
  merchantId: string,
  partialAmount?: number
): Promise<{ resultCode: NovapayResultCode; flow?: NovapayFlow; netAmount?: number; fee?: number }> {
  // Get the flow
  const flow = await getNovapayFlowById(flowId);
  if (!flow) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  // Verify ownership
  if (flow.merchantId !== merchantId) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  // Check state
  if (flow.state !== 'HELD') {
    return { resultCode: NovapayResultCode.INVALID_STATE_TRANSITION };
  }
  
  // Check if hold has expired
  if (flow.expiresAt && new Date(flow.expiresAt) < new Date()) {
    // Release the hold back to customer
    if (flow.payerId && flow.heldAmount) {
      await releaseHoldToCustomer(flow.payerId, flow.currency, flow.heldAmount);
    }
    await updateNovapayFlow(flow.flowId, {
      state: 'EXPIRED',
      resultCode: NovapayResultCode.HOLD_EXPIRED,
    });
    return { resultCode: NovapayResultCode.HOLD_EXPIRED };
  }
  
  // Determine amount to charge
  const chargeAmount = partialAmount !== undefined ? partialAmount : flow.heldAmount || flow.amount;
  
  if (chargeAmount <= 0 || chargeAmount > (flow.heldAmount || flow.amount)) {
    return { resultCode: NovapayResultCode.INVALID_AMOUNT };
  }
  
  // Calculate fee
  const fee = chargeAmount * NOVAPAY_FEE_PERCENTAGE;
  const netAmount = chargeAmount - fee;
  
  // Get merchant
  const merchant = await getUserById(merchantId);
  if (!merchant) {
    return { resultCode: NovapayResultCode.MERCHANT_NOT_FOUND };
  }
  
  // Credit merchant
  const merchantBalances = merchant.balances || [{ currency: 'USD', amount: merchant.balance || 0 }];
  const merchantCurrencyBalance = merchantBalances.find(b => b.currency === flow.currency);
  
  const updatedMerchantBalances = merchantCurrencyBalance
    ? merchantBalances.map(b =>
        b.currency === flow.currency
          ? { ...b, amount: b.amount + netAmount }
          : b
      )
    : [...merchantBalances, { currency: flow.currency, amount: netAmount }];
  
  await updateUser(merchantId, { balances: updatedMerchantBalances });
  
  // If partial capture, release remaining to customer
  const remainingAmount = (flow.heldAmount || flow.amount) - chargeAmount;
  if (remainingAmount > 0 && flow.payerId) {
    await releaseHoldToCustomer(flow.payerId, flow.currency, remainingAmount);
  }
  
  // Create transaction record
  const transactionId = uuidv4();
  await createTransaction({
    id: transactionId,
    userId: merchantId,
    type: 'receive',
    amount: netAmount,
    currency: flow.currency,
    fee,
    description: `NovaPay: ${flow.memo}`,
    status: 'completed',
    senderId: flow.payerId,
    createdAt: new Date().toISOString(),
  });
  
  // Create transaction for payer (they already had funds deducted at hold)
  await createTransaction({
    id: uuidv4(),
    userId: flow.payerId || '',
    type: 'send',
    amount: -chargeAmount,
    currency: flow.currency,
    description: `NovaPay payment: ${flow.memo}`,
    status: 'completed',
    recipientId: merchantId,
    createdAt: new Date().toISOString(),
  });
  
  // Update flow
  const updatedFlow = await updateNovapayFlow(flow.flowId, {
    state: 'SETTLED',
    resultCode: NovapayResultCode.CHARGE_COMPLETE,
    settledAmount: chargeAmount,
    heldAmount: 0,
    settledAt: new Date().toISOString(),
    chargeTransactionId: transactionId,
  });
  
  // Dispatch webhook
  if (updatedFlow) {
    dispatchFlowEvent(updatedFlow, 'flow.settled');
  }
  
  return {
    resultCode: NovapayResultCode.CHARGE_COMPLETE,
    flow: updatedFlow || undefined,
    netAmount,
    fee,
  };
}

/**
 * Void (cancel) a held flow
 */
export async function voidFlow(
  flowId: string,
  merchantId: string
): Promise<{ resultCode: NovapayResultCode; flow?: NovapayFlow; releasedAmount?: number }> {
  // Get the flow
  const flow = await getNovapayFlowById(flowId);
  if (!flow) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  // Verify ownership
  if (flow.merchantId !== merchantId) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  // Check state - can void from CREATED or HELD
  if (flow.state !== 'CREATED' && flow.state !== 'HELD') {
    return { resultCode: NovapayResultCode.INVALID_STATE_TRANSITION };
  }
  
  const releasedAmount = flow.heldAmount || 0;
  
  // If there's a hold, release it back to customer
  if (flow.state === 'HELD' && flow.payerId && releasedAmount > 0) {
    await releaseHoldToCustomer(flow.payerId, flow.currency, releasedAmount);
  }
  
  // Update flow
  const updatedFlow = await updateNovapayFlow(flow.flowId, {
    state: 'VOIDED',
    resultCode: NovapayResultCode.VOID_COMPLETE,
    heldAmount: 0,
    voidedAt: new Date().toISOString(),
  });
  
  // Dispatch webhook
  if (updatedFlow) {
    dispatchFlowEvent(updatedFlow, 'flow.voided');
  }
  
  return {
    resultCode: NovapayResultCode.VOID_COMPLETE,
    flow: updatedFlow || undefined,
    releasedAmount,
  };
}

/**
 * Refund a settled flow
 */
export async function refundFlow(
  flowId: string,
  merchantId: string,
  partialAmount?: number,
  reason?: string
): Promise<{ resultCode: NovapayResultCode; flow?: NovapayFlow; refundedAmount?: number; totalRefunded?: number }> {
  // Get the flow
  const flow = await getNovapayFlowById(flowId);
  if (!flow) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  // Verify ownership
  if (flow.merchantId !== merchantId) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  // Check state
  if (flow.state !== 'SETTLED') {
    return { resultCode: NovapayResultCode.INVALID_STATE_TRANSITION };
  }
  
  // Calculate refundable amount
  const alreadyRefunded = flow.returnedAmount || 0;
  const settledAmount = flow.settledAmount || 0;
  const maxRefundable = settledAmount - alreadyRefunded;
  
  // Determine refund amount
  const refundAmount = partialAmount !== undefined ? partialAmount : maxRefundable;
  
  if (refundAmount <= 0 || refundAmount > maxRefundable) {
    return { resultCode: NovapayResultCode.REFUND_EXCEEDS_ORIGINAL };
  }
  
  // Get merchant
  const merchant = await getUserById(merchantId);
  if (!merchant) {
    return { resultCode: NovapayResultCode.MERCHANT_NOT_FOUND };
  }
  
  // Check merchant has funds
  const merchantBalances = merchant.balances || [{ currency: 'USD', amount: merchant.balance || 0 }];
  const merchantCurrencyBalance = merchantBalances.find(b => b.currency === flow.currency);
  
  if (!merchantCurrencyBalance || merchantCurrencyBalance.amount < refundAmount) {
    return { resultCode: NovapayResultCode.INSUFFICIENT_FUNDS };
  }
  
  // Deduct from merchant
  const updatedMerchantBalances = merchantBalances.map(b =>
    b.currency === flow.currency
      ? { ...b, amount: b.amount - refundAmount }
      : b
  );
  await updateUser(merchantId, { balances: updatedMerchantBalances });
  
  // Credit to customer
  if (flow.payerId) {
    const payer = await getUserById(flow.payerId);
    if (payer) {
      const payerBalances = payer.balances || [{ currency: 'USD', amount: payer.balance || 0 }];
      const payerCurrencyBalance = payerBalances.find(b => b.currency === flow.currency);
      
      const updatedPayerBalances = payerCurrencyBalance
        ? payerBalances.map(b =>
            b.currency === flow.currency
              ? { ...b, amount: b.amount + refundAmount }
              : b
          )
        : [...payerBalances, { currency: flow.currency, amount: refundAmount }];
      
      await updateUser(flow.payerId, { balances: updatedPayerBalances });
    }
  }
  
  // Create refund transaction
  const refundTransactionId = uuidv4();
  await createTransaction({
    id: refundTransactionId,
    userId: merchantId,
    type: 'send',
    amount: -refundAmount,
    currency: flow.currency,
    description: `NovaPay refund: ${flow.memo}${reason ? ` - ${reason}` : ''}`,
    status: 'completed',
    recipientId: flow.payerId,
    createdAt: new Date().toISOString(),
  });
  
  // Calculate new totals
  const totalRefunded = alreadyRefunded + refundAmount;
  const isFullyRefunded = totalRefunded >= settledAmount;
  
  // Update flow
  const updatedFlow = await updateNovapayFlow(flow.flowId, {
    state: isFullyRefunded ? 'RETURNED' : 'SETTLED',
    resultCode: NovapayResultCode.REFUND_COMPLETE,
    returnedAmount: totalRefunded,
    returnedAt: new Date().toISOString(),
    refundTransactionIds: [...(flow.refundTransactionIds || []), refundTransactionId],
  });
  
  // Dispatch webhook if fully refunded
  if (updatedFlow && isFullyRefunded) {
    dispatchFlowEvent(updatedFlow, 'flow.returned');
  }
  
  return {
    resultCode: NovapayResultCode.REFUND_COMPLETE,
    flow: updatedFlow || undefined,
    refundedAmount: refundAmount,
    totalRefunded,
  };
}

/**
 * Look up a flow
 */
export async function lookupFlow(
  flowId: string,
  merchantId: string
): Promise<{ resultCode: NovapayResultCode; data?: NovapayLookupResponseData }> {
  const flow = await getNovapayFlowById(flowId);
  if (!flow) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  // Verify ownership
  if (flow.merchantId !== merchantId) {
    return { resultCode: NovapayResultCode.FLOW_NOT_FOUND };
  }
  
  return {
    resultCode: NovapayResultCode.APPROVED,
    data: {
      flowId: flow.flowId,
      state: flow.state,
      amount: flow.amount,
      currency: flow.currency,
      memo: flow.memo,
      merchantRef: flow.merchantRef,
      heldAmount: flow.heldAmount,
      settledAmount: flow.settledAmount,
      returnedAmount: flow.returnedAmount,
      createdAt: flow.createdAt,
      heldAt: flow.heldAt,
      settledAt: flow.settledAt,
      voidedAt: flow.voidedAt,
      returnedAt: flow.returnedAt,
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find a matching card from the database
 */
function findMatchingCard(
  cards: Card[],
  cardNumber: string,
  expiryMonth: string,
  expiryYear: string,
  securityCode: string
): Card | undefined {
  return cards.find(c => {
    const dbCardNumber = c.cardNumber?.replace(/\s/g, '') ?? '';
    // Parse stored expiry (MM/YY format)
    const [storedMonth, storedYear] = (c.expiryDate || '').split('/');
    
    return (
      dbCardNumber === cardNumber &&
      storedMonth === expiryMonth &&
      storedYear === expiryYear &&
      c.cvv === securityCode
    );
  });
}

/**
 * Check if a card has expired
 */
function isCardExpired(expiryDate: string): boolean {
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
  expiry.setMonth(expiry.getMonth() + 1); // End of expiry month
  return expiry < new Date();
}

/**
 * Release held funds back to customer
 */
async function releaseHoldToCustomer(
  userId: string,
  currency: NovapayCurrency,
  amount: number
): Promise<void> {
  const user = await getUserById(userId);
  if (!user) return;
  
  const balances = user.balances || [{ currency: 'USD', amount: user.balance || 0 }];
  const currencyBalance = balances.find(b => b.currency === currency);
  
  const updatedBalances = currencyBalance
    ? balances.map(b =>
        b.currency === currency
          ? { ...b, amount: b.amount + amount }
          : b
      )
    : [...balances, { currency, amount }];
  
  await updateUser(userId, { balances: updatedBalances });
}
