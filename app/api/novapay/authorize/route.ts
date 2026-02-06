/**
 * NovaPay Authorize API
 * POST /api/novapay/authorize
 * 
 * Internal endpoint used by the checkout page to authorize a card
 * This is NOT a merchant-facing API
 */

import { NextRequest, NextResponse } from 'next/server';
import { authorizeCard } from '@/lib/novapay/service';
import { getNovapayFlowById } from '@/lib/novapay/database';
import {
  NovapayResultCode,
  NovapayResultMessages,
  NovapayCardAuthRequest,
} from '@/lib/novapay/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: NovapayCardAuthRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        ok: false,
        resultCode: NovapayResultCode.INVALID_REQUEST,
        message: NovapayResultMessages[NovapayResultCode.INVALID_REQUEST],
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!body.flowId || !body.cardNumber || !body.expiryMonth || !body.expiryYear || !body.securityCode || !body.cardholderEmail) {
      return NextResponse.json({
        ok: false,
        resultCode: NovapayResultCode.MISSING_FIELD,
        message: NovapayResultMessages[NovapayResultCode.MISSING_FIELD],
      }, { status: 400 });
    }
    
    // Authorize the card
    const result = await authorizeCard(body);
    
    if (result.resultCode === NovapayResultCode.HOLD_CREATED && result.flow) {
      // Success - return redirect URLs
      return NextResponse.json({
        ok: true,
        resultCode: result.resultCode,
        message: NovapayResultMessages[result.resultCode],
        flowId: result.flow.flowId,
        state: result.flow.state,
        onComplete: result.flow.onComplete,
        onCancel: result.flow.onCancel,
      });
    }
    
    // Get the flow to check for redirect URLs on failure
    const flow = await getNovapayFlowById(body.flowId);
    
    return NextResponse.json({
      ok: false,
      resultCode: result.resultCode,
      message: NovapayResultMessages[result.resultCode],
      flowId: body.flowId,
      state: result.flow?.state,
      onCancel: flow?.onCancel,
    }, { status: 422 });
  } catch (error) {
    console.error('NovaPay authorize error:', error);
    return NextResponse.json({
      ok: false,
      resultCode: NovapayResultCode.INTERNAL_ERROR,
      message: NovapayResultMessages[NovapayResultCode.INTERNAL_ERROR],
    }, { status: 500 });
  }
}

/**
 * GET endpoint to fetch flow details for the checkout page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flowId = searchParams.get('flowId');
    
    if (!flowId) {
      return NextResponse.json({
        ok: false,
        resultCode: NovapayResultCode.MISSING_FIELD,
        message: 'Flow ID is required',
      }, { status: 400 });
    }
    
    const flow = await getNovapayFlowById(flowId);
    
    if (!flow) {
      return NextResponse.json({
        ok: false,
        resultCode: NovapayResultCode.FLOW_NOT_FOUND,
        message: NovapayResultMessages[NovapayResultCode.FLOW_NOT_FOUND],
      }, { status: 404 });
    }
    
    // Return flow details for checkout page (no sensitive data)
    return NextResponse.json({
      ok: true,
      flow: {
        flowId: flow.flowId,
        amount: flow.amount,
        currency: flow.currency,
        memo: flow.memo,
        state: flow.state,
        customerEmail: flow.customerEmail,
        customerName: flow.customerName,
        onComplete: flow.onComplete,
        onCancel: flow.onCancel,
        expiresAt: flow.expiresAt,
      },
    });
  } catch (error) {
    console.error('NovaPay get flow error:', error);
    return NextResponse.json({
      ok: false,
      resultCode: NovapayResultCode.INTERNAL_ERROR,
      message: NovapayResultMessages[NovapayResultCode.INTERNAL_ERROR],
    }, { status: 500 });
  }
}
