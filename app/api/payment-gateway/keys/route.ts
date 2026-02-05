import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { requireAuth } from '@/lib/auth/middleware';
import { getApiKeysByUserId, createApiKey, updateApiKey } from '@/lib/db/database';
import { ApiKey } from '@/lib/db/types';

// GET - Get all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const apiKeys = await getApiKeysByUserId(authUser!.userId);

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const { name, domain } = await request.json();

    // Validate inputs
    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    // Generate a secure API key
    const key = `pk_${crypto.randomBytes(32).toString('hex')}`;

    // Create API key
    const apiKey: ApiKey = {
      id: uuidv4(),
      userId: authUser!.userId,
      key,
      name,
      domain,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await createApiKey(apiKey);

    return NextResponse.json({
      success: true,
      apiKey
    }, { status: 201 });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// PATCH - Update API key (activate/deactivate)
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get all user's API keys to verify ownership
    const userApiKeys = await getApiKeysByUserId(authUser!.userId);
    const apiKey = userApiKeys.find(k => k.id === id);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    // Update API key
    const updatedApiKey = await updateApiKey(id, { status });

    return NextResponse.json({
      success: true,
      apiKey: updatedApiKey
    });
  } catch (error) {
    console.error('Update API key error:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}
