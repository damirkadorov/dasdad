/**
 * NovaPay Lookup API
 * GET /api/novapay/lookup
 * 
 * Retrieves the current state and details of a payment flow
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateNovapayRequest,
  novapayJsonResponse,
  NOVAPAY_CORS_HEADERS,
} from '@/lib/novapay/middleware';
import { lookupFlow } from '@/lib/novapay/service';
import { NovapayResultCode } from '@/lib/novapay/types';
import { createNovapayResponse } from '@/lib/novapay/middleware';

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: NOVAPAY_CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateNovapayRequest(request);
    if (!auth.authenticated || !auth.apiKey) {
      return auth.error!;
    }
    
    // Get flowId from query params
    const searchParams = request.nextUrl.searchParams;
    const flowId = searchParams.get('flowId');
    
    if (!flowId) {
      return novapayJsonResponse(NovapayResultCode.MISSING_FIELD);
    }
    
    // Look up the flow
    const result = await lookupFlow(flowId, auth.apiKey.userId);
    
    if (result.resultCode !== NovapayResultCode.APPROVED || !result.data) {
      return novapayJsonResponse(result.resultCode, undefined, flowId);
    }
    
    const response = createNovapayResponse(
      NovapayResultCode.APPROVED,
      result.data,
      flowId
    );
    
    return NextResponse.json(response, { headers: NOVAPAY_CORS_HEADERS });
  } catch (error) {
    console.error('NovaPay lookup error:', error);
    return novapayJsonResponse(NovapayResultCode.INTERNAL_ERROR);
  }
}
