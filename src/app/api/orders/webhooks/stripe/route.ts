import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { orderWebhookService } from '@/features/orders/services/order.webhook.service';
import { PaymentProvider } from '@/generated/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

// Disable body parsing to get raw body for Stripe signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return ApiErrors.badRequest('Missing stripe signature');
    }

    // Process webhook
    const result = await orderWebhookService.processWebhook(
      PaymentProvider.STRIPE,
      body,
      signature
    );

    return successResponse(result);
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return ApiErrors.internal(error.message || 'Webhook processing failed');
  }
}
