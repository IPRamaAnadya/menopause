import { OrderStatus, PaymentProvider, PaymentStatus } from '@/generated/prisma';
import { orderRepository } from '../repositories/order.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { paymentProviderFactory } from '../payment-providers';
import { CreateOrderInput } from '../types';

export class OrderService {
  /**
   * Create an admin order (manually created by admin)
   * This is immediately marked as paid with provider "ADMIN"
   */
  async createAdminOrder(data: Omit<CreateOrderInput, 'expiresInMinutes'>) {
    // Create order with PAID status
    const order = await orderRepository.create({
      ...data,
    });

    // Update order status to PAID immediately
    await orderRepository.updateStatus(order.id, OrderStatus.PAID, new Date());

    // Create payment record with ADMIN provider
    const provider = paymentProviderFactory.getProvider(PaymentProvider.ADMIN);
    const paymentIntent = await provider.createPaymentIntent({
      amount: data.grossAmount,
      currency: data.currency,
      orderId: order.id,
      metadata: data.metadata,
    });

    const payment = await paymentRepository.create({
      orderId: order.id,
      provider: PaymentProvider.ADMIN,
      amount: data.grossAmount,
      currency: data.currency,
      providerRef: paymentIntent.paymentIntentId,
      paymentMethod: 'admin',
    });

    // Mark payment as succeeded immediately
    await paymentRepository.updateStatus(payment.id, {
      status: PaymentStatus.SUCCEEDED,
      processedAt: new Date(),
      netAmount: data.grossAmount,
      feeAmount: 0,
    });

    return {
      order: {
        id: order.id,
        publicId: order.public_id,
        orderNumber: order.order_number,
        status: OrderStatus.PAID,
        grossAmount: Number(order.gross_amount),
        currency: order.currency,
      },
      payment: {
        id: payment.id,
        publicId: payment.public_id,
        provider: payment.provider,
      },
    };
  }

  /**
   * Create a new order and payment intent
   */
  async createOrder(data: CreateOrderInput & {
    paymentProvider?: PaymentProvider;
  }) {
    // Create order
    const order = await orderRepository.create(data);

    // Create payment intent with the specified provider (default: STRIPE)
    const provider = paymentProviderFactory.getProvider(
      data.paymentProvider || PaymentProvider.STRIPE
    );

    const paymentIntent = await provider.createPaymentIntent({
      amount: data.grossAmount,
      currency: data.currency,
      orderId: order.id,
      metadata: data.metadata,
    });

    // Create payment record
    const payment = await paymentRepository.create({
      orderId: order.id,
      provider: provider.provider,
      amount: data.grossAmount,
      currency: data.currency,
      providerRef: paymentIntent.paymentIntentId,
      providerPayload: {
        clientSecret: paymentIntent.clientSecret,
      },
    });

    return {
      order: {
        id: order.id,
        publicId: order.public_id,
        orderNumber: order.order_number,
        status: order.status,
        grossAmount: Number(order.gross_amount),
        currency: order.currency,
        expiresAt: order.expires_at,
      },
      payment: {
        id: payment.id,
        publicId: payment.public_id,
        provider: payment.provider,
        clientSecret: paymentIntent.clientSecret,
      },
    };
  }

  /**
   * Get order details
   */
  async getOrder(publicId: string) {
    const order = await orderRepository.findByPublicId(publicId);
    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: number, options?: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
  }) {
    const result = await orderRepository.findByUserId(userId, options);
    
    return {
      orders: result.orders,
      total: result.total,
    };
  }

  /**
   * Process payment webhook
   */
  async processWebhook(
    provider: PaymentProvider,
    payload: string | Buffer,
    signature: string
  ) {
    const paymentProvider = paymentProviderFactory.getProvider(provider);
    
    // Verify and parse webhook
    const { event, data } = await paymentProvider.processWebhook(payload, signature);

    // Handle based on event type
    if (event.includes('payment_intent.succeeded') || event.includes('charge.succeeded')) {
      return this.handlePaymentSuccess(data);
    } else if (event.includes('payment_intent.payment_failed') || event.includes('charge.failed')) {
      return this.handlePaymentFailure(data);
    }

    return { processed: true, event };
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(data: any) {
    const payment = await paymentRepository.findByProviderRef(data.id);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Get payment details from provider
    const provider = paymentProviderFactory.getProvider(payment.provider);
    const details = await provider.getPaymentDetails(data.id);

    // Update payment status
    await paymentRepository.updateStatus(payment.id, {
      status: PaymentStatus.SUCCEEDED,
      feeAmount: details.feeAmount,
      netAmount: details.netAmount,
      providerPayload: data,
      processedAt: new Date(),
    });

    // Update order status
    await orderRepository.updateStatus(
      payment.order_id,
      OrderStatus.PAID,
      new Date()
    );

    return { success: true, orderId: payment.order_id };
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(data: any) {
    const payment = await paymentRepository.findByProviderRef(data.id);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    await paymentRepository.updateStatus(payment.id, {
      status: PaymentStatus.FAILED,
      failureReason: data.last_payment_error?.message || 'Payment failed',
      providerPayload: data,
      processedAt: new Date(),
    });

    // Update order status
    await orderRepository.updateStatus(payment.order_id, OrderStatus.FAILED);

    return { success: false, orderId: payment.order_id };
  }

  /**
   * Confirm payment manually
   */
  async confirmPayment(paymentPublicId: string) {
    const payment = await paymentRepository.findByPublicId(paymentPublicId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.provider_ref) {
      throw new Error('Payment provider reference not found');
    }

    const provider = paymentProviderFactory.getProvider(payment.provider);
    const result = await provider.confirmPayment(payment.provider_ref);

    if (result.success) {
      const details = await provider.getPaymentDetails(payment.provider_ref);
      
      await paymentRepository.updateStatus(payment.id, {
        status: PaymentStatus.SUCCEEDED,
        feeAmount: details.feeAmount,
        netAmount: details.netAmount,
        processedAt: new Date(),
      });

      await orderRepository.updateStatus(
        payment.order_id,
        OrderStatus.PAID,
        new Date()
      );
    } else {
      await paymentRepository.updateStatus(payment.id, {
        status: result.status,
        failureReason: result.error,
      });
    }

    return result;
  }

  /**
   * Refund order
   */
  async refundOrder(orderPublicId: string, reason?: string) {
    const order = await orderRepository.findByPublicId(orderPublicId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new Error('Only paid orders can be refunded');
    }

    // Find successful payment
    const payment = await paymentRepository.findSuccessfulPaymentForOrder(order.id);
    
    if (!payment || !payment.provider_ref) {
      throw new Error('No successful payment found for this order');
    }

    // Process refund
    const provider = paymentProviderFactory.getProvider(payment.provider);
    const result = await provider.refundPayment({
      paymentIntentId: payment.provider_ref,
      reason,
    });

    if (result.success) {
      await orderRepository.updateStatus(order.id, OrderStatus.REFUNDED);
    }

    return result;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderPublicId: string) {
    const order = await orderRepository.findByPublicId(orderPublicId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be cancelled');
    }

    await orderRepository.updateStatus(order.id, OrderStatus.CANCELLED);

    return { success: true };
  }

  /**
   * Cancel order by reference
   * Used when deleting referenced entities (e.g., membership)
   */
  async cancelOrderByReference(referenceId: number, referenceType: string) {
    const order = await orderRepository.findByReference(referenceId, referenceType);
    
    if (!order) {
      // No order found, nothing to cancel
      return { success: true, message: 'No order found for reference' };
    }

    // Only cancel if order is not already in a terminal state
    if (order.status === OrderStatus.PAID || order.status === OrderStatus.PENDING) {
      await orderRepository.updateStatus(order.id, OrderStatus.CANCELLED);
    }

    return { success: true };
  }
}

export const orderService = new OrderService();
