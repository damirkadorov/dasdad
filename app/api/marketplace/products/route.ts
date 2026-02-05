import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getAllProducts, createProduct, getProductsBySellerId } from '@/lib/db/database';
import { Product, Currency } from '@/lib/db/types';

// GET - Get all products or seller's products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sellerId = searchParams.get('sellerId');

    if (sellerId) {
      const products = await getProductsBySellerId(sellerId);
      return NextResponse.json({ products });
    }

    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const { name, description, price, currency, category, imageUrl, stock } = await request.json();

    // Validate inputs
    if (!name || !price || !currency || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    if (stock !== undefined && stock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      );
    }

    // Create product
    const product: Product = {
      id: uuidv4(),
      sellerId: authUser!.userId,
      name,
      description: description || '',
      price,
      currency: currency as Currency,
      category,
      imageUrl,
      stock: stock !== undefined ? stock : 999,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await createProduct(product);

    return NextResponse.json({
      success: true,
      product
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
