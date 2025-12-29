import { prisma } from '@/lib/prisma';
import { OrderStatus, OrderType, Prisma } from '@/generated/prisma';
import { CreateOrderInput, OrderWithPayments } from '../types';

export class OrderRepository {
  /**
   * Transform database order to OrderWithPayments type
   */
  private transformOrder(order: any): OrderWithPayments {
    return {
      id: order.id,
      publicId: order.public_id,
      userId: order.user_id,
      orderNumber: order.order_number,
      type: order.type,
      status: order.status,
      grossAmount: Number(order.gross_amount),
      currency: order.currency,
      breakdown: order.breakdown,
      referenceId: order.reference_id,
      referenceType: order.reference_type,
      metadata: order.metadata,
      notes: order.notes,
      expiresAt: order.expires_at,
      paidAt: order.paid_at,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      payments: order.payments?.map((p: any) => ({
        id: p.id,
        publicId: p.public_id,
        provider: p.provider,
        status: p.status,
        amount: Number(p.amount),
        currency: p.currency,
        feeAmount: p.fee_amount ? Number(p.fee_amount) : null,
        netAmount: p.net_amount ? Number(p.net_amount) : null,
        providerRef: p.provider_ref,
        paymentMethod: p.payment_method,
        failureReason: p.failure_reason,
        processedAt: p.processed_at,
        createdAt: p.created_at,
      })) || [],
    };
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get count of orders today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const count = await prisma.orders.count({
      where: {
        created_at: {
          gte: startOfDay,
        },
      },
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    return `ORD-${year}${month}-${sequence}`;
  }

  /**
   * Create a new order
   */
  async create(data: CreateOrderInput) {
    const orderNumber = await this.generateOrderNumber();
    
    const expiresAt = data.expiresInMinutes
      ? new Date(Date.now() + data.expiresInMinutes * 60 * 1000)
      : null;

    return prisma.orders.create({
      data: {
        user_id: data.userId,
        order_number: orderNumber,
        type: data.type,
        status: OrderStatus.PENDING,
        gross_amount: new Prisma.Decimal(data.grossAmount),
        currency: data.currency,
        breakdown: data.breakdown as any,
        reference_id: data.referenceId,
        reference_type: data.referenceType,
        metadata: data.metadata as any,
        notes: data.notes,
        expires_at: expiresAt,
      },
      include: {
        payments: true,
      },
    });
  }

  /**
   * Get order by ID
   */
  async findById(id: number): Promise<OrderWithPayments | null> {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
    return order ? this.transformOrder(order) : null;
  }

  /**
   * Get order by public ID
   */
  async findByPublicId(publicId: string): Promise<OrderWithPayments | null> {
    const order = await prisma.orders.findUnique({
      where: { public_id: publicId },
      include: {
        payments: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
    return order ? this.transformOrder(order) : null;
  }

  /**
   * Get order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderWithPayments | null> {
    const order = await prisma.orders.findUnique({
      where: { order_number: orderNumber },
      include: {
        payments: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
    return order ? this.transformOrder(order) : null;
  }

  /**
   * Get order by reference
   */
  async findByReference(referenceId: number, referenceType: string): Promise<OrderWithPayments | null> {
    const order = await prisma.orders.findFirst({
      where: { 
        reference_id: referenceId,
        reference_type: referenceType,
      },
      include: {
        payments: {
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return order ? this.transformOrder(order) : null;
  }

  /**
   * Get orders by user
   */
  async findByUserId(userId: number, options?: {
    status?: OrderStatus;
    type?: OrderType;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.ordersWhereInput = {
      user_id: userId,
    };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.type) {
      where.type = options.type;
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        include: {
          payments: {
            orderBy: { created_at: 'desc' },
          },
        },
        orderBy: { created_at: 'desc' },
        take: options?.limit || 10,
        skip: options?.offset || 0,
      }),
      prisma.orders.count({ where }),
    ]);

    return { 
      orders: orders.map(order => this.transformOrder(order)),
      total 
    };
  }

  /**
   * Update order status
   */
  async updateStatus(id: number, status: OrderStatus, paidAt?: Date) {
    return prisma.orders.update({
      where: { id },
      data: {
        status,
        paid_at: paidAt,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Mark expired orders
   */
  async markExpiredOrders() {
    return prisma.orders.updateMany({
      where: {
        status: OrderStatus.PENDING,
        expires_at: {
          lte: new Date(),
        },
      },
      data: {
        status: OrderStatus.CANCELLED,
        updated_at: new Date(),
      },
    });
  }
}

export const orderRepository = new OrderRepository();
