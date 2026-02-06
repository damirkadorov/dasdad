/**
 * NovaPay Void API
 * POST /api/novapay/void
 * 
 * Cancels a held flow and releases funds back to customer
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateNovapayRequest,
  novapayJsonResponse,
  getIdempotencyKey,
  NOVAPAY_CORS_HEADERS,
} from '@/lib/novapay/middleware';
import {
  voidFlow,
  checkIdempotency,
  storeIdempotencyResponse,
} from '@/lib/novapay/service';
import {
  NovapayResultCode,
  NovapayVoidRequest,
  NovapayVoidResponseData,
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
    let body: NovapayVoidRequest;
    try {
      body = await request.json();
    } catch {
      return novapayJsonResponse(NovapayResultCode.INVALID_REQUEST);
    }
    
    // Validate flowId
    if (!body.flowId) {
      return novapayJsonResponse(NovapayResultCode.MISSING_FIELD);
    }
    
    // Void the flow
    const result = await voidFlow(
      body.flowId,
      auth.apiKey.userId
    );
    
    if (result.resultCode !== NovapayResultCode.VOID_COMPLETE || !result.flow) {
      return novapayJsonResponse(result.resultCode, undefined, body.flowId);
    }
    
    // Build response data
    const responseData: NovapayVoidResponseData = {
      flowId: result.flow.flowId,
      state: result.flow.state,
      releasedAmount: result.releasedAmount || 0,
    };
    
    const response = createNovapayResponse(
      NovapayResultCode.VOID_COMPLETE,
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
    
    return NextResponse.json(response, { headers: NOVAPAY_CORS_HEADERS });
  } catch (error) {
    console.error('NovaPay void error:', error);
    return novapayJsonResponse(NovapayResultCode.INTERNAL_ERROR);
  }
}
