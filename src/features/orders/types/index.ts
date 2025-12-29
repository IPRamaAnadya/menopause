import { OrderType, OrderStatus, PaymentProvider, PaymentStatus } from '@/generated/prisma';

export type CreateOrderInput = {
  userId: number;
  type: OrderType;
  grossAmount: number;
  currency: string;
  breakdown: {
    base: number;
    admin_fee?: number;
    tax?: number;
    discount?: number;
  };
  referenceId?: number;
  referenceType?: string;
  metadata?: Record<string, any>;
  notes?: string;
  expiresInMinutes?: number; // Auto-expire pending orders
};

export type CreatePaymentInput = {
  orderId: number;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  paymentMethod?: string;
};

export type PaymentIntentResult = {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
};

export type PaymentResult = {
  success: boolean;
  paymentId?: number;
  transactionId?: string;
  status: PaymentStatus;
  message?: string;
  error?: string;
};

export type OrderWithPayments = {
  id: number;
  publicId: string;
  userId: number;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  grossAmount: number;
  currency: string;
  breakdown: any;
  referenceId?: number | null;
  referenceType?: string | null;
  metadata?: any;
  notes?: string | null;
  expiresAt?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  payments: Array<{
    id: number;
    publicId: string;
    provider: PaymentProvider;
    status: PaymentStatus;
    amount: number;
    currency: string;
    feeAmount?: number | null;
    netAmount?: number | null;
    providerRef?: string | null;
    paymentMethod?: string | null;
    failureReason?: string | null;
    processedAt?: Date | null;
    createdAt: Date;
  }>;
};
