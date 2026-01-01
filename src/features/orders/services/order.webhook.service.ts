import { OrderStatus, PaymentStatus, PaymentProvider } from '@/generated/prisma';
import { orderRepository } from '../repositories/order.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { paymentProviderFactory } from '../payment-providers';

export enum TransactionType {
  MEMBERSHIP = 'membership',
  EVENT_MEMBER = 'event_member',
  EVENT_GUEST = 'event_guest',
}

export class OrderWebhookService {
  /**
   * Process payment webhook
   */
  async processWebhook(
    provider: PaymentProvider,
    payload: string | Buffer,
    signature: string
  ) {
    console.log('========================================');
    console.log('[WebhookService] Starting webhook processing');
    console.log('[WebhookService] Provider:', provider);
    console.log('========================================');
    
    const paymentProvider = paymentProviderFactory.getProvider(provider);
    
    // Verify and parse webhook
    const { event, data } = await paymentProvider.processWebhook(payload, signature);

    // Handle based on event type
    console.log(`[WebhookService] Event type: ${event}`);
    console.log('[WebhookService] Event data keys:', Object.keys(data));

    
    if (event.includes('checkout.session.completed')) {
      console.log('[WebhookService] Handling checkout.session.completed');
      return this.handleCheckoutSessionCompleted(data);
    } else if (event.includes('payment_intent.succeeded') || event.includes('charge.succeeded')) {
      console.log('[WebhookService] Handling payment success');
      return this.handlePaymentSuccess(data);
    } else if (event.includes('payment_intent.payment_failed') || event.includes('charge.failed')) {
      console.log('[WebhookService] Handling payment failure');
      return this.handlePaymentFailure(data);
    }

    console.log(`[WebhookService] Event ${event} not handled - no action required`);
    return { processed: true, event };
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutSessionCompleted(data: any) {
    console.log('[WebhookService] Checkout session completed', { 
      sessionId: data.id,
      metadata: data.metadata 
    });
    
    const metadata = data.metadata || {};
    const transactionType = metadata.transaction_type;

    console.log('[WebhookService] Transaction type:', transactionType);

    // Route based on transaction type
    switch (transactionType) {
      case TransactionType.MEMBERSHIP:
        return this.handleMembershipTransaction(data, metadata);
      
      case TransactionType.EVENT_MEMBER:
        return this.handleEventMemberTransaction(data, metadata);
      
      case TransactionType.EVENT_GUEST:
        return this.handleEventGuestTransaction(data, metadata);
      
      default:
        console.log('[WebhookService] Unknown transaction type, using legacy flow');
        return this.handleLegacyTransaction(data, metadata);
    }
  }

  /**
   * Handle membership subscription transaction
   */
  private async handleMembershipTransaction(data: any, metadata: any) {
    console.log('[WebhookService] Processing membership transaction');

    let payment;

    // Try payment_id first (numeric ID)
    if (metadata.payment_id) {
      const paymentId = parseInt(metadata.payment_id);
      if (!isNaN(paymentId)) {
        payment = await paymentRepository.findById(paymentId);
        if (payment) {
          console.log(`[WebhookService] Found payment ${payment.id} by payment_id`);
        }
      }
    }

    // Try payment_public_id (UUID)
    if (!payment && metadata.payment_public_id) {
      payment = await paymentRepository.findByPublicId(metadata.payment_public_id);
      if (payment) {
        console.log(`[WebhookService] Found payment ${payment.id} by payment_public_id`);
      }
    }

    // Fallback to payment_intent
    if (!payment) {
      const paymentIntentId = data.payment_intent;
      if (paymentIntentId) {
        payment = await paymentRepository.findByProviderRef(paymentIntentId);
        if (payment) {
          console.log(`[WebhookService] Found payment ${payment.id} by payment_intent`);
        }
      }
    }

    if (!payment) {
      console.log('[WebhookService] Payment not found for membership transaction');
      return { success: true, message: 'Payment not tracked in system' };
    }

    console.log(`[WebhookService] Found payment ${payment.id}, updating status`);

    // Get payment details
    const paymentIntentId = data.payment_intent;
    let feeAmount: number | undefined = undefined;
    let netAmount: number | undefined = undefined;

    if (paymentIntentId) {
      const provider = paymentProviderFactory.getProvider(payment.provider);
      try {
        const paymentDetails = await provider.getPaymentDetails(paymentIntentId);
        feeAmount = paymentDetails.feeAmount;
        netAmount = paymentDetails.netAmount;
      } catch (error) {
        console.error('[WebhookService] Error getting payment details:', error);
      }
    }

    // Update payment status
    await paymentRepository.updateStatus(payment.id, {
      status: PaymentStatus.SUCCEEDED,
      feeAmount,
      netAmount,
      providerPayload: data,
      processedAt: new Date(),
    });

    // Update order status
    await orderRepository.updateStatus(
      payment.order_id,
      OrderStatus.PAID,
      new Date()
    );

    // Get order and process membership change
    const order = await orderRepository.findById(payment.order_id);
    if (order && order.metadata) {
      const orderMetadata = order.metadata as any;
      
      if (orderMetadata.membership_level_id && orderMetadata.operation_type) {
        console.log('[WebhookService] Processing membership change');
        await this.processMembershipChange(
          order.userId,
          parseInt(orderMetadata.membership_level_id),
          orderMetadata.operation_type
        );
        console.log('[WebhookService] ✓ Membership change processed');
      }
    }

    return { success: true, orderId: payment.order_id };
  }

  /**
   * Handle event registration by member (with order)
   */
  private async handleEventMemberTransaction(data: any, metadata: any) {
    console.log('[WebhookService] Processing event member transaction', {
      registration_id: metadata.registration_id,
      event_id: metadata.event_id,
      user_id: metadata.user_id,
      payment_id: metadata.payment_id,
    });

    let payment;

    // Try payment_id first (numeric ID)
    if (metadata.payment_id) {
      const paymentId = parseInt(metadata.payment_id);
      if (!isNaN(paymentId)) {
        payment = await paymentRepository.findById(paymentId);
        if (payment) {
          console.log(`[WebhookService] Found payment ${payment.id} by payment_id`);
        }
      }
    }

    // Try payment_public_id (UUID)
    if (!payment && metadata.payment_public_id) {
      payment = await paymentRepository.findByPublicId(metadata.payment_public_id);
      if (payment) {
        console.log(`[WebhookService] Found payment ${payment.id} by payment_public_id`);
      }
    }

    // Fallback to payment_intent
    if (!payment) {
      const paymentIntentId = data.payment_intent;
      if (paymentIntentId) {
        payment = await paymentRepository.findByProviderRef(paymentIntentId);
        if (payment) {
          console.log(`[WebhookService] Found payment ${payment.id} by payment_intent`);
        }
      }
    }

    if (!payment) {
      console.log('[WebhookService] Payment not found for event member transaction');
      return { success: true, message: 'Payment not tracked in system' };
    }

    console.log(`[WebhookService] Found payment ${payment.id}, updating status`);

    // Get payment details
    const paymentIntentId = data.payment_intent;
    let feeAmount: number | undefined = undefined;
    let netAmount: number | undefined = undefined;

    if (paymentIntentId) {
      const provider = paymentProviderFactory.getProvider(payment.provider);
      try {
        const paymentDetails = await provider.getPaymentDetails(paymentIntentId);
        feeAmount = paymentDetails.feeAmount;
        netAmount = paymentDetails.netAmount;
      } catch (error) {
        console.error('[WebhookService] Error getting payment details:', error);
      }
    }

    // Update payment status
    await paymentRepository.updateStatus(payment.id, {
      status: PaymentStatus.SUCCEEDED,
      feeAmount,
      netAmount,
      providerPayload: data,
      processedAt: new Date(),
    });

    // Update order status
    await orderRepository.updateStatus(
      payment.order_id,
      OrderStatus.PAID,
      new Date()
    );

    // Process event registration
    const registrationId = parseInt(metadata.registration_id);
    if (registrationId && !isNaN(registrationId)) {
      console.log('[WebhookService] Processing event registration');
      await this.processEventRegistration(registrationId);
      console.log('[WebhookService] ✓ Event registration processed');
    }

    return { success: true, orderId: payment.order_id };
  }

  /**
   * Handle event registration by guest (no order)
   */
  private async handleEventGuestTransaction(data: any, metadata: any) {
    console.log('[WebhookService] Processing event guest transaction', {
      registration_id: metadata.registration_id,
      registration_public_id: metadata.registration_public_id,
      event_id: metadata.event_id,
      guest_email: metadata.guest_email,
      guest_name: metadata.guest_name,
    });

    try {
      const registrationId = parseInt(metadata.registration_id);
      if (!registrationId || isNaN(registrationId)) {
        throw new Error('Invalid registration_id in metadata');
      }

      // Process the event registration
      await this.processEventRegistration(registrationId);

      console.log('[WebhookService] ✓ Guest event registration processed successfully');
      return { 
        success: true, 
        message: 'Guest event registration processed',
        registrationId 
      };
    } catch (error) {
      console.error('[WebhookService] ERROR processing guest registration:', error);
      throw error;
    }
  }

  /**
   * Legacy transaction handler (for backwards compatibility)
   */
  private async handleLegacyTransaction(data: any, metadata: any) {
    console.log('[WebhookService] Using legacy transaction handler');

    const paymentPublicId = metadata.payment_public_id;
    let payment;

    if (paymentPublicId) {
      payment = await paymentRepository.findByPublicId(paymentPublicId);
    }

    if (!payment) {
      const paymentIntentId = data.payment_intent;
      if (!paymentIntentId) {
        console.log('[WebhookService] No payment intent in checkout session');
        return { success: true, message: 'No payment intent found' };
      }

      payment = await paymentRepository.findByProviderRef(paymentIntentId);
      
      if (!payment) {
        console.log('[WebhookService] Payment not found');
        return { success: true, message: 'Payment not tracked in system' };
      }
    }

    // Get payment details
    const paymentIntentId = data.payment_intent;
    let feeAmount: number | undefined = undefined;
    let netAmount: number | undefined = undefined;

    if (paymentIntentId) {
      const provider = paymentProviderFactory.getProvider(payment.provider);
      try {
        const paymentDetails = await provider.getPaymentDetails(paymentIntentId);
        feeAmount = paymentDetails.feeAmount;
        netAmount = paymentDetails.netAmount;
      } catch (error) {
        console.error('[WebhookService] Error getting payment details:', error);
      }
    }

    // Update payment status
    await paymentRepository.updateStatus(payment.id, {
      status: PaymentStatus.SUCCEEDED,
      feeAmount,
      netAmount,
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
   * Handle payment success (payment_intent.succeeded / charge.succeeded)
   */
  private async handlePaymentSuccess(data: any) {
    const paymentIntentId = data.id;
    const payment = await paymentRepository.findByProviderRef(paymentIntentId);

    if (!payment) {
      console.log('Payment not found for paymentIntentId:', paymentIntentId);
      return { success: true, message: 'Payment not tracked in system' };
    }

    // Get payment details
    const provider = paymentProviderFactory.getProvider(payment.provider);
    const paymentResult = await provider.confirmPayment(paymentIntentId);

    // Update payment status
    await paymentRepository.updateStatus(payment.id, {
      status: paymentResult.status,
      providerPayload: data,
      processedAt: new Date(),
    });

    // Update order status if payment succeeded
    if (paymentResult.status === PaymentStatus.SUCCEEDED) {
      await orderRepository.updateStatus(
        payment.order_id,
        OrderStatus.PAID,
        new Date()
      );
    }

    return { success: true, paymentId: payment.id };
  }

  /**
   * Handle payment failure
   */
  private async handlePaymentFailure(data: any) {
    const paymentIntentId = data.id;
    const payment = await paymentRepository.findByProviderRef(paymentIntentId);

    if (!payment) {
      console.log('Payment not found for paymentIntentId:', paymentIntentId);
      return { success: true, message: 'Payment not tracked in system' };
    }

    // Update payment status
    await paymentRepository.updateStatus(payment.id, {
      status: PaymentStatus.FAILED,
      failureReason: data.last_payment_error?.message || 'Payment failed',
      providerPayload: data,
      processedAt: new Date(),
    });

    // Update order status
    await orderRepository.updateStatus(
      payment.order_id,
      OrderStatus.FAILED,
      new Date()
    );

    return { success: true, paymentId: payment.id };
  }

  /**
   * Process event registration after successful payment
   */
  private async processEventRegistration(registrationId: number) {
    const EventRegistrationService = (await import('@/features/event/services/event-registration.service')).EventRegistrationService;

    console.log(`[WebhookService] Processing event registration ${registrationId}`);

    try {
      await EventRegistrationService.processEventPayment(registrationId);
      console.log(`[WebhookService] ✓ Processed event registration ${registrationId}`);
    } catch (error) {
      console.error(`[WebhookService] ERROR processing event registration:`, error);
      throw error;
    }
  }

  /**
   * Process membership change after successful payment
   */
  private async processMembershipChange(
    userId: number,
    membershipLevelId: number,
    operationType: string
  ) {
    const MembershipService = (await import('@/features/membership/services/membership.service')).MembershipService;

    console.log(`[WebhookService] Processing membership change for user ${userId}, level ${membershipLevelId}, operation: ${operationType}`);

    try {
      if (operationType === 'EXTEND') {
        console.log(`[WebhookService] Extending membership...`);
        await MembershipService.extendMembership(userId, membershipLevelId);
        console.log(`[WebhookService] ✓ Extended membership for user ${userId}`);
      } else if (operationType === 'UPGRADE') {
        console.log(`[WebhookService] Upgrading membership...`);
        await MembershipService.changeMembershipLevel(userId, membershipLevelId, 'UPGRADE');
        console.log(`[WebhookService] ✓ Upgraded membership for user ${userId}`);
      } else if (operationType === 'DOWNGRADE') {
        console.log(`[WebhookService] Downgrading membership...`);
        await MembershipService.changeMembershipLevel(userId, membershipLevelId, 'DOWNGRADE');
        console.log(`[WebhookService] ✓ Downgraded membership for user ${userId}`);
      } else if (operationType === 'NEW') {
        console.log(`[WebhookService] Creating new membership...`);
        // For new membership, calculate dates
        const levels = await MembershipService.getAvailableMembershipLevels();
        const level = levels.find(l => l.id === membershipLevelId);
        
        if (!level) {
          console.error(`[WebhookService] ERROR: Level ${membershipLevelId} not found`);
          throw new Error(`Membership level ${membershipLevelId} not found`);
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + level.duration_days);

        console.log(`[WebhookService] Creating membership with dates:`, {
          startDate,
          endDate,
          durationDays: level.duration_days
        });

        const result = await MembershipService.createMembership({
          user_id: userId,
          membership_level_id: membershipLevelId,
          start_date: startDate,
          end_date: endDate,
        });

        console.log(`[WebhookService] ✓ Created new membership ${result.id} for user ${userId}`);
      } else {
        console.error(`[WebhookService] ERROR: Unknown operation type: ${operationType}`);
        throw new Error(`Unknown operation type: ${operationType}`);
      }
    } catch (error) {
      console.error(`[WebhookService] ERROR processing membership change:`, error);
      console.error(`[WebhookService] Error details:`, {
        userId,
        membershipLevelId,
        operationType,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

export const orderWebhookService = new OrderWebhookService();
