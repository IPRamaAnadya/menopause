import { prisma } from '@/lib/prisma';
import { PaymentProvider, PaymentStatus, Prisma } from '@/generated/prisma';
import { CreatePaymentInput } from '../types';

export class PaymentRepository {
  /**
   * Create a new payment record
   */
  async create(data: CreatePaymentInput & {
    providerRef?: string;
    providerPayload?: any;
  }) {
    return prisma.payments.create({
      data: {
        order_id: data.orderId,
        provider: data.provider,
        status: PaymentStatus.PENDING,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency,
        payment_method: data.paymentMethod,
        provider_ref: data.providerRef,
        provider_payload: data.providerPayload as any,
      },
    });
  }

  /**
   * Find payment by ID
   */
  async findById(id: number) {
    return prisma.payments.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });
  }

  /**
   * Find payment by public ID
   */
  async findByPublicId(publicId: string) {
    return prisma.payments.findUnique({
      where: { public_id: publicId },
      include: {
        orders: true,
      },
    });
  }

  /**
   * Find payment by provider reference (payment_intent_id, transaction_id, etc.)
   */
  async findByProviderRef(providerRef: string) {
    return prisma.payments.findFirst({
      where: { provider_ref: providerRef },
      include: {
        orders: true,
      },
    });
  }

  /**
   * Update payment status and details
   */
  async updateStatus(id: number, data: {
    status: PaymentStatus;
    feeAmount?: number;
    netAmount?: number;
    providerPayload?: any;
    failureReason?: string;
    processedAt?: Date;
  }) {
    return prisma.payments.update({
      where: { id },
      data: {
        status: data.status,
        fee_amount: data.feeAmount ? new Prisma.Decimal(data.feeAmount) : undefined,
        net_amount: data.netAmount ? new Prisma.Decimal(data.netAmount) : undefined,
        provider_payload: data.providerPayload as any,
        failure_reason: data.failureReason,
        processed_at: data.processedAt,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get payments by order
   */
  async findByOrderId(orderId: number) {
    return prisma.payments.findMany({
      where: { order_id: orderId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get successful payment for order
   */
  async findSuccessfulPaymentForOrder(orderId: number) {
    return prisma.payments.findFirst({
      where: {
        order_id: orderId,
        status: PaymentStatus.SUCCEEDED,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}

export const paymentRepository = new PaymentRepository();
