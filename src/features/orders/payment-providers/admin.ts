import { PaymentProvider, PaymentStatus } from '@/generated/prisma';
import { IPaymentProvider } from './interface';
import { PaymentIntentResult, PaymentResult } from '../types';

/**
 * Admin Payment Provider
 * Used for manual payments created by administrators
 * No actual payment processing - immediately marks as paid
 */
export class AdminPaymentProvider implements IPaymentProvider {
  readonly provider = PaymentProvider.ADMIN;

  /**
   * Create a payment intent for admin payment
   * Admin payments don't need client secrets as they're immediately completed
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: number;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntentResult> {
    // Generate a reference ID for tracking
    const referenceId = `admin-${Date.now()}-${params.orderId}`;

    return {
      clientSecret: '', // No client secret needed for admin payments
      paymentIntentId: referenceId,
      amount: params.amount,
      currency: params.currency,
    };
  }

  /**
   * Process webhook - not applicable for admin payments
   */
  async processWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<{ event: string; data: any }> {
    throw new Error('Webhooks are not supported for admin payments');
  }

  /**
   * Confirm payment - admin payments are auto-confirmed
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    return {
      success: true,
      paymentId: undefined,
      transactionId: paymentIntentId,
      status: PaymentStatus.SUCCEEDED,
      message: 'Admin payment automatically confirmed',
    };
  }

  /**
   * Refund a payment - admin can manually mark as refunded
   */
  async refundPayment(params: {
    paymentIntentId: string;
    amount?: number;
    reason?: string;
  }): Promise<{
    success: boolean;
    refundId?: string;
    amount?: number;
    error?: string;
  }> {
    // Generate refund ID
    const refundId = `admin-refund-${Date.now()}`;

    return {
      success: true,
      refundId,
      amount: params.amount,
    };
  }

  /**
   * Get payment details for admin payment
   */
  async getPaymentDetails(paymentIntentId: string): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    feeAmount?: number;
    netAmount?: number;
    metadata?: Record<string, any>;
  }> {
    // Admin payments don't have detailed tracking
    // Return minimal details
    return {
      id: paymentIntentId,
      amount: 0, // Will be set from payment record
      currency: 'HKD',
      status: 'succeeded',
      paymentMethod: 'admin',
      feeAmount: 0,
      netAmount: 0,
    };
  }
}
