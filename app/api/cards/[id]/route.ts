import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getCardById, updateCard, deleteCard } from '@/lib/db/database';

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
    const card = getCardById(id);

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

    return NextResponse.json(
      { card },
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
    const card = getCardById(id);

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

    const updatedCard = updateCard(id, { status });

    return NextResponse.json(
      {
        message: `Card ${status === 'frozen' ? 'frozen' : 'unfrozen'} successfully`,
        card: updatedCard
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
    const card = getCardById(id);

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

    deleteCard(id);

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
