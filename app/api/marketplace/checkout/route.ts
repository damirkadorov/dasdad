import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserById, updateUser, getProductById, updateProduct, createOrder, createTransaction } from '@/lib/db/database';
import { Order, Currency } from '@/lib/db/types';

// POST - Process marketplace checkout
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { error, user: authUser } = await requireAuth();
    if (error) return error;

    const buyerId = authUser!.userId;
    const { productId, quantity, shippingAddress } = await request.json();

    // Validate inputs
    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Get product
    const product = await getProductById(productId);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.status !== 'active') {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Check if buyer is not the seller
    if (product.sellerId === buyerId) {
      return NextResponse.json(
        { error: 'Cannot buy your own product' },
        { status: 400 }
      );
    }

    // Get buyer
    const buyer = await getUserById(buyerId);
    
    if (!buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      );
    }

    // Calculate total
    const totalAmount = product.price * quantity;
    const currency = product.currency;

    // Initialize buyer balances if they don't exist
    const buyerBalances = buyer.balances || [{ currency: 'USD', amount: buyer.balance || 0 }];
    
    // Find the balance for the product's currency
    const buyerBalance = buyerBalances.find(b => b.currency === currency);
    
    if (!buyerBalance || buyerBalance.amount < totalAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get seller
    const seller = await getUserById(product.sellerId);
    
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Initialize seller balances if they don't exist
    const sellerBalances = seller.balances || [{ currency: 'USD', amount: seller.balance || 0 }];
    
    // Calculate marketplace fee (2%)
    const fee = totalAmount * 0.02;
    const sellerAmount = totalAmount - fee;

    // Update buyer balance (deduct)
    const updatedBuyerBalances = buyerBalances.map(b => 
      b.currency === currency 
        ? { ...b, amount: b.amount - totalAmount }
        : b
    );
    
    // Update seller balance (add)
    let sellerCurrencyBalance = sellerBalances.find(b => b.currency === currency);
    const updatedSellerBalances = sellerCurrencyBalance
      ? sellerBalances.map(b => 
          b.currency === currency
            ? { ...b, amount: b.amount + sellerAmount }
            : b
        )
      : [...sellerBalances, { currency: currency as Currency, amount: sellerAmount }];

    // Update product stock
    const newStock = product.stock - quantity;
    const productStatus = newStock === 0 ? 'sold_out' : 'active';

    // Create order
    const order: Order = {
      id: uuidv4(),
      buyerId,
      sellerId: product.sellerId,
      productId: product.id,
      productName: product.name,
      quantity,
      totalAmount,
      currency,
      status: 'completed',
      shippingAddress,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    // Update all entities
    await updateUser(buyerId, { balances: updatedBuyerBalances });
    await updateUser(seller.id, { balances: updatedSellerBalances });
    await updateProduct(productId, { stock: newStock, status: productStatus });
    await createOrder(order);

    // Create transaction for buyer (debit)
    await createTransaction({
      id: uuidv4(),
      userId: buyerId,
      type: 'marketplace_purchase',
      amount: -totalAmount,
      currency,
      description: `Purchased ${quantity}x ${product.name}`,
      status: 'completed',
      recipientId: seller.id,
      orderId: order.id,
      productId: product.id,
      createdAt: new Date().toISOString()
    });

    // Create transaction for seller (credit)
    await createTransaction({
      id: uuidv4(),
      userId: seller.id,
      type: 'marketplace_sale',
      amount: sellerAmount,
      currency,
      fee,
      description: `Sold ${quantity}x ${product.name}`,
      status: 'completed',
      senderId: buyerId,
      orderId: order.id,
      productId: product.id,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      order,
      message: 'Purchase successful'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
