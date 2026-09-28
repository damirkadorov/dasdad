import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getCardById, updateCard, deleteCard, getUserById } from '@/lib/db/database';
import { Currency } from '@/lib/db/types';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    // Get card from MongoDB
    const card = await getCardById(id);

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Verify card belongs to user
    if (card.userId !== user!.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const userRecord = await getUserById(user!.userId);
    const userBalances = userRecord?.balances && userRecord.balances.length > 0
      ? userRecord.balances
      : [{ currency: 'USD' as Currency, amount: userRecord?.balance || 0 }];
    const match = userBalances.find(b => b.currency === card.currency);
    const bal = match ? match.amount : (card.currency === 'USD' ? (userRecord?.balance || 0) : 0);

    return NextResponse.json(
      { card: { ...card, balance: bal } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    // Get card from MongoDB
    const card = await getCardById(id);

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Verify card belongs to user
    if (card.userId !== user!.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'frozen'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "frozen"' },
        { status: 400 }
      );
    }

    // Update card in MongoDB
    const updatedCard = await updateCard(id, { status });
    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Failed to update card' },
        { status: 500 }
      );
    }

    const userRecord = await getUserById(user!.userId);
    const userBalances = userRecord?.balances && userRecord.balances.length > 0
      ? userRecord.balances
      : [{ currency: 'USD' as Currency, amount: userRecord?.balance || 0 }];
    const match = userBalances.find(b => b.currency === updatedCard.currency);
    const bal = match ? match.amount : (updatedCard.currency === 'USD' ? (userRecord?.balance || 0) : 0);

    return NextResponse.json(
      {
        message: `Card ${status === 'frozen' ? 'frozen' : 'unfrozen'} successfully`,
        card: { ...updatedCard, balance: bal }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    // Get card from MongoDB
    const card = await getCardById(id);

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Verify card belongs to user
    if (card.userId !== user!.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete card from MongoDB
    await deleteCard(id);

    return NextResponse.json(
      { message: 'Card deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
