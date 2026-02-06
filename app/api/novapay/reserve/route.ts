/**
 * NovaPay Reserve API
 * POST /api/novapay/reserve
 * 
 * Creates a new payment flow and returns a checkout URL
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateNovapayRequest,
  novapayJsonResponse,
  getIdempotencyKey,
  NOVAPAY_CORS_HEADERS,
} from '@/lib/novapay/middleware';
import {
  createReservation,
  checkIdempotency,
  storeIdempotencyResponse,
} from '@/lib/novapay/service';
import {
  NovapayResultCode,
  NovapayReserveRequest,
  NovapayReserveResponseData,
} from '@/lib/novapay/types';
import { createNovapayResponse } from '@/lib/novapay/middleware';

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: NOVAPAY_CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateNovapayRequest(request);
    if (!auth.authenticated || !auth.apiKey) {
      return auth.error!;
    }
    
    // Check idempotency
    const idempotencyKey = getIdempotencyKey(request);
    if (idempotencyKey) {
      const idempotencyResult = await checkIdempotency(idempotencyKey, auth.apiKey.id);
      if (idempotencyResult.cached && idempotencyResult.response) {
        return NextResponse.json(idempotencyResult.response, { headers: NOVAPAY_CORS_HEADERS });
      }
    }
    
    // Parse request body
    let body: NovapayReserveRequest;
    try {
      body = await request.json();
    } catch {
      return novapayJsonResponse(NovapayResultCode.INVALID_REQUEST);
    }
    
    // Get base URL for checkout link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Create reservation
    const result = await createReservation(
      auth.apiKey.userId,
      auth.apiKey.id,
      body,
      baseUrl
    );
    
    if (result.resultCode !== NovapayResultCode.APPROVED || !result.flow) {
      return novapayJsonResponse(result.resultCode);
    }
    
    // Build response data
    const responseData: NovapayReserveResponseData = {
      flowId: result.flow.flowId,
      checkoutUrl: result.checkoutUrl!,
      state: result.flow.state,
      expiresAt: result.flow.expiresAt!,
    };
    
    const response = createNovapayResponse(
      NovapayResultCode.APPROVED,
      responseData,
      result.flow.flowId
    );
    
    // Store idempotency record
    if (idempotencyKey) {
      await storeIdempotencyResponse(
        idempotencyKey,
        auth.apiKey.id,
        result.flow.flowId,
        response
      );
    }
    
    return NextResponse.json(response, {
      status: 201,
      headers: NOVAPAY_CORS_HEADERS,
    });
  } catch (error) {
    console.error('NovaPay reserve error:', error);
    return novapayJsonResponse(NovapayResultCode.INTERNAL_ERROR);
  }
}
