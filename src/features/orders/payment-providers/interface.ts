import { PaymentProvider } from '@/generated/prisma';
import { PaymentIntentResult, PaymentResult } from '../types';

/**
 * Payment Provider Interface
 * Implement this interface for each payment provider (Stripe, Midtrans, Xendit, etc.)
 */
export interface IPaymentProvider {
  readonly provider: PaymentProvider;

  /**
   * Create a payment intent/session
   * This prepares a payment and returns client secret for frontend
   */
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: number;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntentResult>;

  /**
   * Verify and process webhook events
   * Called when payment provider sends webhook
   */
  processWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<{
    event: string;
    data: any;
  }>;

  /**
   * Confirm payment status
   * Query the provider to check payment status
   */
  confirmPayment(paymentIntentId: string): Promise<PaymentResult>;

  /**
   * Refund a payment
   */
  refundPayment(params: {
    paymentIntentId: string;
    amount?: number; // Partial refund if specified
    reason?: string;
  }): Promise<{
    success: boolean;
    refundId?: string;
    amount?: number;
    error?: string;
  }>;

  /**
   * Get payment details
   */
  getPaymentDetails(paymentIntentId: string): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    feeAmount?: number;
    netAmount?: number;
    metadata?: Record<string, any>;
  }>;
}

/**
 * Payment Provider Factory
 * Returns the appropriate payment provider implementation
 */
export interface IPaymentProviderFactory {
  getProvider(provider: PaymentProvider): IPaymentProvider;
}
