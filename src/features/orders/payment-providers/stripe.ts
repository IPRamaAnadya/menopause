import Stripe from 'stripe';
import { PaymentProvider, PaymentStatus } from '@/generated/prisma';
import { IPaymentProvider } from './interface';
import { PaymentIntentResult, PaymentResult } from '../types';
import { stripe } from '@/lib/stripe';

export class StripePaymentProvider implements IPaymentProvider {
  readonly provider = PaymentProvider.STRIPE;
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = stripe;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: number;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntentResult> {
    try {
      // Convert amount to cents (Stripe expects smallest currency unit)
      const amountInCents = Math.round(params.amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: params.currency.toLowerCase(),
        metadata: {
          orderId: params.orderId.toString(),
          ...params.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        amount: params.amount,
        currency: params.currency,
      };
    } catch (error: any) {
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }

  async processWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<{ event: string; data: any }> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      return {
        event: event.type,
        data: event.data.object,
      };
    } catch (error: any) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      let status: PaymentStatus;
      switch (paymentIntent.status) {
        case 'succeeded':
          status = PaymentStatus.SUCCEEDED;
          break;
        case 'processing':
          status = PaymentStatus.PROCESSING;
          break;
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          status = PaymentStatus.PENDING;
          break;
        case 'canceled':
          status = PaymentStatus.CANCELLED;
          break;
        default:
          status = PaymentStatus.FAILED;
      }

      return {
        success: status === PaymentStatus.SUCCEEDED,
        transactionId: paymentIntent.id,
        status,
        message: paymentIntent.status,
      };
    } catch (error: any) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        error: error.message,
      };
    }
  }

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
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
      };

      if (params.amount) {
        refundParams.amount = Math.round(params.amount * 100);
      }

      if (params.reason) {
        refundParams.reason = params.reason as Stripe.RefundCreateParams.Reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

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
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['latest_charge'],
      });

      const charge = paymentIntent.latest_charge as Stripe.Charge | null;
      const balanceTransaction = charge?.balance_transaction as Stripe.BalanceTransaction | null;

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        paymentMethod: charge?.payment_method_details?.type,
        feeAmount: balanceTransaction ? balanceTransaction.fee / 100 : undefined,
        netAmount: balanceTransaction ? balanceTransaction.net / 100 : undefined,
        metadata: paymentIntent.metadata,
      };
    } catch (error: any) {
      throw new Error(`Failed to get payment details: ${error.message}`);
    }
  }
}
