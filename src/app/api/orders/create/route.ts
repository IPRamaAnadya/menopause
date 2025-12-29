import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderService } from '@/features/orders';
import { OrderType, PaymentProvider } from '@/generated/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiErrors.unauthorized('Please login to create an order');
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return ApiErrors.badRequest('Invalid user ID');
    }

    const body = await req.json();
    const {
      type,
      grossAmount,
      currency,
      breakdown,
      referenceId,
      referenceType,
      metadata,
      notes,
      expiresInMinutes,
      paymentProvider,
    } = body;

    // Validation
    if (!type || !Object.values(OrderType).includes(type)) {
      return ApiErrors.badRequest('Invalid order type');
    }

    if (!grossAmount || grossAmount <= 0) {
      return ApiErrors.badRequest('Invalid gross amount');
    }

    if (!currency || currency.length !== 3) {
      return ApiErrors.badRequest('Invalid currency code');
    }

    if (!breakdown || typeof breakdown !== 'object') {
      return ApiErrors.badRequest('Invalid breakdown');
    }

    // Create order with payment intent
    const result = await orderService.createOrder({
      userId,
      type,
      grossAmount,
      currency: currency.toUpperCase(),
      breakdown,
      referenceId,
      referenceType,
      metadata,
      notes,
      expiresInMinutes: expiresInMinutes || 30,
      paymentProvider: paymentProvider || PaymentProvider.STRIPE,
    });

    return successResponse(result, 201);
  } catch (error: any) {
    console.error('Create order error:', error);
    return ApiErrors.internal(error.message || 'Failed to create order');
  }
}
