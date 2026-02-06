/**
 * NovaPay Authentication Middleware
 * Handles API key validation for merchant requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyByKey, updateApiKey } from '../db/database';
import { NovapayApiResponse, NovapayResultCode, NovapayResultMessages, NOVAPAY_API_KEY_PREFIX } from './types';
import { ApiKey } from '../db/types';

// CORS headers for external websites
export const NOVAPAY_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-NovaPay-Key, Idempotency-Key',
};

/**
 * Create a standardized NovaPay API response
 */
export function createNovapayResponse<T>(
  resultCode: NovapayResultCode,
  data?: T,
  flowId?: string
): NovapayApiResponse<T> {
  return {
    ok: resultCode >= 1000 && resultCode < 2000,
    resultCode,
    message: NovapayResultMessages[resultCode] || 'Unknown result',
    data,
    flowId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send a NovaPay JSON response
 */
export function novapayJsonResponse<T>(
  resultCode: NovapayResultCode,
  data?: T,
  flowId?: string,
  status?: number
): NextResponse {
  const response = createNovapayResponse(resultCode, data, flowId);
  const httpStatus = status || (response.ok ? 200 : getHttpStatusForResultCode(resultCode));
  
  return NextResponse.json(response, {
    status: httpStatus,
    headers: NOVAPAY_CORS_HEADERS,
  });
}

/**
 * Map NovaPay result codes to HTTP status codes
 */
function getHttpStatusForResultCode(code: NovapayResultCode): number {
  if (code >= 1000 && code < 2000) return 200; // Success
  if (code >= 4000 && code < 4100) return 400; // Client errors
  if (code >= 4100 && code < 5000) return 404; // Not found errors
  if (code >= 5000 && code < 6000) return 422; // Business logic errors
  return 500; // System errors
}

/**
 * Authentication result
 */
export interface NovapayAuthResult {
  authenticated: boolean;
  apiKey?: ApiKey;
  error?: NextResponse;
}

/**
 * Authenticate a NovaPay API request
 * Checks for X-NovaPay-Key header and validates the API key
 */
export async function authenticateNovapayRequest(request: NextRequest): Promise<NovapayAuthResult> {
  // Get API key from header
  const apiKeyHeader = request.headers.get('X-NovaPay-Key');
  
  if (!apiKeyHeader) {
    return {
      authenticated: false,
      error: NextResponse.json(
        createNovapayResponse(NovapayResultCode.INVALID_REQUEST, undefined, undefined),
        { status: 401, headers: NOVAPAY_CORS_HEADERS }
      ),
    };
  }
  
  // Check API key format - can be either np_ prefix (new) or pk_ prefix (legacy)
  if (!apiKeyHeader.startsWith(NOVAPAY_API_KEY_PREFIX) && !apiKeyHeader.startsWith('pk_')) {
    return {
      authenticated: false,
      error: NextResponse.json(
        createNovapayResponse(NovapayResultCode.INVALID_REQUEST, undefined, undefined),
        { status: 401, headers: NOVAPAY_CORS_HEADERS }
      ),
    };
  }
  
  // Look up the API key
  const apiKey = await getApiKeyByKey(apiKeyHeader);
  
  if (!apiKey) {
    return {
      authenticated: false,
      error: NextResponse.json(
        createNovapayResponse(NovapayResultCode.INVALID_REQUEST, undefined, undefined),
        { status: 401, headers: NOVAPAY_CORS_HEADERS }
      ),
    };
  }
  
  // Update last used timestamp (non-blocking)
  updateApiKey(apiKey.id, { lastUsed: new Date().toISOString() }).catch(console.error);
  
  return {
    authenticated: true,
    apiKey,
  };
}

/**
 * Get idempotency key from request headers
 */
export function getIdempotencyKey(request: NextRequest): string | null {
  return request.headers.get('Idempotency-Key');
}
