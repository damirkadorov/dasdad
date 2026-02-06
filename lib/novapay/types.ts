/**
 * NovaPay - Proprietary Closed-Loop Payment Network
 * 
 * Philosophy: A simple, secure, serverless-friendly payment system
 * designed for educational and sandbox banking environments.
 * 
 * All NovaPay cards start with digit "7" to distinguish them from other networks.
 * 
 * This is NOT a clone of any existing payment network.
 * It uses proprietary terminology, statuses, and flows.
 */

// Currency types supported by NovaPay
export type NovapayCurrency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'JPY' | 'CAD' | 'AUD';

/**
 * NovaPay Flow State Machine:
 * 
 * ┌─────────────┐
 * │   CREATED   │  Initial state after authorization request
 * └──────┬──────┘
 *        │ reserve()
 *        ▼
 * ┌─────────────┐         ┌─────────────┐
 * │   HELD      │────────►│   VOIDED    │  Released/cancelled
 * └──────┬──────┘  void() └─────────────┘
 *        │
 *        │ charge()
 *        ▼
 * ┌─────────────┐         ┌─────────────┐
 * │  SETTLED    │────────►│  RETURNED   │  Refunded
 * └─────────────┘ refund()└─────────────┘
 * 
 * Error states can occur at any transition:
 * ┌─────────────┐
 * │   DENIED    │  Authorization failed
 * └─────────────┘
 * ┌─────────────┐
 * │   EXPIRED   │  Hold expired (auto-void after 7 days)
 * └─────────────┘
 */

// NovaPay Flow States
export type NovapayFlowState = 
  | 'CREATED'    // Flow initiated, awaiting card details
  | 'HELD'       // Funds reserved on card
  | 'SETTLED'    // Funds transferred to merchant
  | 'VOIDED'     // Reservation cancelled, funds released
  | 'RETURNED'   // Settled payment refunded
  | 'DENIED'     // Authorization failed
  | 'EXPIRED';   // Hold expired (auto-release)

// NovaPay Result Codes (proprietary)
export enum NovapayResultCode {
  // Success codes (1xxx)
  APPROVED = 1000,
  HOLD_CREATED = 1001,
  CHARGE_COMPLETE = 1002,
  VOID_COMPLETE = 1003,
  REFUND_COMPLETE = 1004,
  
  // Client errors (4xxx)
  INVALID_REQUEST = 4000,
  MISSING_FIELD = 4001,
  INVALID_AMOUNT = 4002,
  INVALID_CURRENCY = 4003,
  INVALID_CARD_FORMAT = 4004,
  NOT_NOVAPAY_CARD = 4005,
  FLOW_NOT_FOUND = 4006,
  INVALID_STATE_TRANSITION = 4007,
  DUPLICATE_REQUEST = 4008,
  CARD_NOT_FOUND = 4009,
  CARD_INACTIVE = 4010,
  CARD_EXPIRED = 4011,
  INVALID_SECURITY_CODE = 4012,
  
  // Decline codes (5xxx)
  INSUFFICIENT_FUNDS = 5000,
  ACCOUNT_FROZEN = 5001,
  MERCHANT_NOT_FOUND = 5002,
  HOLD_EXPIRED = 5003,
  REFUND_EXCEEDS_ORIGINAL = 5004,
  
  // System errors (9xxx)
  INTERNAL_ERROR = 9000,
  SERVICE_UNAVAILABLE = 9001,
  TIMEOUT = 9002,
}

// Human-readable messages for result codes
export const NovapayResultMessages: Record<NovapayResultCode, string> = {
  [NovapayResultCode.APPROVED]: 'Request approved',
  [NovapayResultCode.HOLD_CREATED]: 'Funds successfully reserved',
  [NovapayResultCode.CHARGE_COMPLETE]: 'Payment settled successfully',
  [NovapayResultCode.VOID_COMPLETE]: 'Reservation cancelled, funds released',
  [NovapayResultCode.REFUND_COMPLETE]: 'Refund processed successfully',
  
  [NovapayResultCode.INVALID_REQUEST]: 'Invalid request format',
  [NovapayResultCode.MISSING_FIELD]: 'Required field missing',
  [NovapayResultCode.INVALID_AMOUNT]: 'Amount must be positive',
  [NovapayResultCode.INVALID_CURRENCY]: 'Currency not supported',
  [NovapayResultCode.INVALID_CARD_FORMAT]: 'Card number format is invalid',
  [NovapayResultCode.NOT_NOVAPAY_CARD]: 'Card is not a NovaPay card (must start with 7)',
  [NovapayResultCode.FLOW_NOT_FOUND]: 'Payment flow not found',
  [NovapayResultCode.INVALID_STATE_TRANSITION]: 'Cannot perform this action in current state',
  [NovapayResultCode.DUPLICATE_REQUEST]: 'Duplicate request detected',
  [NovapayResultCode.CARD_NOT_FOUND]: 'Card not registered in NovaPay network',
  [NovapayResultCode.CARD_INACTIVE]: 'Card is not active',
  [NovapayResultCode.CARD_EXPIRED]: 'Card has expired',
  [NovapayResultCode.INVALID_SECURITY_CODE]: 'Security code does not match',
  
  [NovapayResultCode.INSUFFICIENT_FUNDS]: 'Insufficient funds in account',
  [NovapayResultCode.ACCOUNT_FROZEN]: 'Account is frozen',
  [NovapayResultCode.MERCHANT_NOT_FOUND]: 'Merchant account not found',
  [NovapayResultCode.HOLD_EXPIRED]: 'Reservation has expired',
  [NovapayResultCode.REFUND_EXCEEDS_ORIGINAL]: 'Refund amount exceeds original payment',
  
  [NovapayResultCode.INTERNAL_ERROR]: 'Internal system error',
  [NovapayResultCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [NovapayResultCode.TIMEOUT]: 'Request timed out',
};

/**
 * NovaPay Flow - Represents a payment flow through the system
 */
export interface NovapayFlow {
  // Identifiers
  flowId: string;              // Unique flow identifier (npf_xxx)
  merchantId: string;          // Merchant's user ID
  apiKeyId: string;            // API key used to create flow
  
  // Flow details
  amount: number;              // Amount in major units
  currency: NovapayCurrency;   // Currency code
  memo: string;                // Payment description/memo
  
  // State
  state: NovapayFlowState;     // Current flow state
  resultCode: NovapayResultCode; // Last result code
  
  // Card details (stored after authorization)
  cardId?: string;             // Reference to card used
  payerId?: string;            // Card owner's user ID
  holdId?: string;             // Internal hold ID
  
  // Amounts tracking
  heldAmount?: number;         // Amount currently on hold
  settledAmount?: number;      // Amount successfully charged
  returnedAmount?: number;     // Total refunded amount
  
  // Merchant data
  merchantRef?: string;        // Merchant's order/reference ID
  merchantData?: Record<string, unknown>; // Custom merchant metadata
  
  // Callbacks
  onComplete?: string;         // URL to redirect on success
  onCancel?: string;           // URL to redirect on cancel
  notifyUrl?: string;          // Webhook URL for notifications
  
  // Customer info (optional)
  customerEmail?: string;
  customerName?: string;
  
  // Timestamps
  createdAt: string;
  heldAt?: string;
  settledAt?: string;
  voidedAt?: string;
  returnedAt?: string;
  expiresAt?: string;          // Hold expiration time
  
  // Transaction IDs
  chargeTransactionId?: string;
  refundTransactionIds?: string[];
  
  // Error info
  declineReason?: string;
}

/**
 * NovaPay Card Validation
 * All NovaPay cards must start with "7"
 */
export interface NovapayCardInput {
  cardNumber: string;          // 16-digit card number starting with 7
  expiryMonth: string;         // MM format
  expiryYear: string;          // YY format
  securityCode: string;        // 3-digit CVV
  cardholderEmail: string;     // Email for receipt
}

/**
 * API Response wrapper for NovaPay endpoints
 */
export interface NovapayApiResponse<T = unknown> {
  ok: boolean;                 // Overall success flag
  resultCode: NovapayResultCode;
  message: string;
  data?: T;
  flowId?: string;
  timestamp: string;
}

/**
 * Reserve (Authorization) Request
 */
export interface NovapayReserveRequest {
  amount: number;              // Amount in major units
  currency: NovapayCurrency;
  memo: string;                // Payment description
  merchantRef?: string;        // Your order/reference ID
  merchantData?: Record<string, unknown>; // Custom metadata
  customerEmail?: string;
  customerName?: string;
  onComplete?: string;         // Redirect URL on success
  onCancel?: string;           // Redirect URL on cancel
  notifyUrl?: string;          // Webhook URL
}

/**
 * Reserve Response Data
 */
export interface NovapayReserveResponseData {
  flowId: string;
  checkoutUrl: string;         // URL to redirect customer
  state: NovapayFlowState;
  expiresAt: string;
}

/**
 * Charge (Commit) Request
 */
export interface NovapayChargeRequest {
  flowId: string;
  amount?: number;             // Optional partial capture
}

/**
 * Charge Response Data
 */
export interface NovapayChargeResponseData {
  flowId: string;
  state: NovapayFlowState;
  settledAmount: number;
  netAmount: number;           // After platform fee
  fee: number;
}

/**
 * Void (Cancel) Request
 */
export interface NovapayVoidRequest {
  flowId: string;
}

/**
 * Void Response Data
 */
export interface NovapayVoidResponseData {
  flowId: string;
  state: NovapayFlowState;
  releasedAmount: number;
}

/**
 * Refund Request
 */
export interface NovapayRefundRequest {
  flowId: string;
  amount?: number;             // Optional partial refund
  reason?: string;
}

/**
 * Refund Response Data
 */
export interface NovapayRefundResponseData {
  flowId: string;
  state: NovapayFlowState;
  refundedAmount: number;
  totalRefunded: number;
}

/**
 * Lookup Response Data
 */
export interface NovapayLookupResponseData {
  flowId: string;
  state: NovapayFlowState;
  amount: number;
  currency: NovapayCurrency;
  memo: string;
  merchantRef?: string;
  heldAmount?: number;
  settledAmount?: number;
  returnedAmount?: number;
  createdAt: string;
  heldAt?: string;
  settledAt?: string;
  voidedAt?: string;
  returnedAt?: string;
}

/**
 * Card Authorization Request (internal, for checkout page)
 */
export interface NovapayCardAuthRequest {
  flowId: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  securityCode: string;
  cardholderEmail: string;
}

/**
 * Idempotency Record
 */
export interface IdempotencyRecord {
  key: string;
  flowId?: string;
  response: NovapayApiResponse;
  createdAt: string;
  expiresAt: string;
}

/**
 * Webhook Event Payload
 */
export interface NovapayWebhookEvent {
  eventType: 'flow.held' | 'flow.settled' | 'flow.voided' | 'flow.returned' | 'flow.denied' | 'flow.expired';
  flowId: string;
  merchantRef?: string;
  state: NovapayFlowState;
  amount: number;
  currency: NovapayCurrency;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Constants
export const NOVAPAY_HOLD_EXPIRY_DAYS = 7;
export const NOVAPAY_FEE_PERCENTAGE = 0.025; // 2.5%
export const NOVAPAY_CARD_PREFIX = '7';
export const NOVAPAY_API_KEY_PREFIX = 'np_';
export const NOVAPAY_FLOW_PREFIX = 'npf_';
export const VALID_CURRENCIES: NovapayCurrency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];
