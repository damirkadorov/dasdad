/**
 * NovaPay Charge API
 * POST /api/novapay/charge
 * 
 * Commits a held flow and transfers funds to merchant
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateNovapayRequest,
  novapayJsonResponse,
  getIdempotencyKey,
  NOVAPAY_CORS_HEADERS,
} from '@/lib/novapay/middleware';
import {
  chargeFlow,
  checkIdempotency,
  storeIdempotencyResponse,
} from '@/lib/novapay/service';
import {
  NovapayResultCode,
  NovapayChargeRequest,
  NovapayChargeResponseData,
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
    let body: NovapayChargeRequest;
    try {
      body = await request.json();
    } catch {
      return novapayJsonResponse(NovapayResultCode.INVALID_REQUEST);
    }
    
    // Validate flowId
    if (!body.flowId) {
      return novapayJsonResponse(NovapayResultCode.MISSING_FIELD);
    }
    
    // Charge the flow
    const result = await chargeFlow(
      body.flowId,
      auth.apiKey.userId,
      body.amount
    );
    
    if (result.resultCode !== NovapayResultCode.CHARGE_COMPLETE || !result.flow) {
      return novapayJsonResponse(result.resultCode, undefined, body.flowId);
    }
    
    // Build response data
    const responseData: NovapayChargeResponseData = {
      flowId: result.flow.flowId,
      state: result.flow.state,
      settledAmount: result.flow.settledAmount || 0,
      netAmount: result.netAmount || 0,
      fee: result.fee || 0,
    };
    
    const response = createNovapayResponse(
      NovapayResultCode.CHARGE_COMPLETE,
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
    console.error('NovaPay charge error:', error);
    return novapayJsonResponse(NovapayResultCode.INTERNAL_ERROR);
  }
}
