/**
 * NovaPay Refund API
 * POST /api/novapay/refund
 * 
 * Refunds a settled payment back to the customer
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateNovapayRequest,
  novapayJsonResponse,
  getIdempotencyKey,
  NOVAPAY_CORS_HEADERS,
} from '@/lib/novapay/middleware';
import {
  refundFlow,
  checkIdempotency,
  storeIdempotencyResponse,
} from '@/lib/novapay/service';
import {
  NovapayResultCode,
  NovapayRefundRequest,
  NovapayRefundResponseData,
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
    let body: NovapayRefundRequest;
    try {
      body = await request.json();
    } catch {
      return novapayJsonResponse(NovapayResultCode.INVALID_REQUEST);
    }
    
    // Validate flowId
    if (!body.flowId) {
      return novapayJsonResponse(NovapayResultCode.MISSING_FIELD);
    }
    
    // Refund the flow
    const result = await refundFlow(
      body.flowId,
      auth.apiKey.userId,
      body.amount,
      body.reason
    );
    
    if (result.resultCode !== NovapayResultCode.REFUND_COMPLETE || !result.flow) {
      return novapayJsonResponse(result.resultCode, undefined, body.flowId);
    }
    
    // Build response data
    const responseData: NovapayRefundResponseData = {
      flowId: result.flow.flowId,
      state: result.flow.state,
      refundedAmount: result.refundedAmount || 0,
      totalRefunded: result.totalRefunded || 0,
    };
    
    const response = createNovapayResponse(
      NovapayResultCode.REFUND_COMPLETE,
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
    console.error('NovaPay refund error:', error);
    return novapayJsonResponse(NovapayResultCode.INTERNAL_ERROR);
  }
}
