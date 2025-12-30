import { prisma } from '@/lib/prisma';
import { SubscriptionStats } from '../types';

export class SubscriptionService {
  /**
   * Get subscription statistics
   */
  static async getSubscriptionStats(): Promise<SubscriptionStats> {
    const [
      total,
      active,
      expired,
      cancelled,
    ] = await Promise.all([
      prisma.orders.count({
        where: {
          type: {
            in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
          },
        },
      }),
      prisma.orders.count({
        where: {
          type: {
            in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
          },
          status: 'PAID',
        },
      }),
      prisma.orders.count({
        where: {
          type: {
            in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
          },
          status: 'FAILED',
        },
      }),
      prisma.orders.count({
        where: {
          type: {
            in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
          },
          status: 'CANCELLED',
        },
      }),
    ]);

    // Calculate total revenue from all membership orders
    const allOrders = await prisma.orders.findMany({
      where: {
        type: {
          in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
        },
        status: 'PAID',
      },
      select: {
        gross_amount: true,
      },
    });

    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + parseFloat(order.gross_amount.toString());
    }, 0);

    // Calculate monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = await prisma.orders.findMany({
      where: {
        type: {
          in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
        },
        status: 'PAID',
        created_at: {
          gte: startOfMonth,
        },
      },
      select: {
        gross_amount: true,
      },
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
      return sum + parseFloat(order.gross_amount.toString());
    }, 0);

    return {
      total_subscriptions: total,
      active_subscriptions: active,
      expired_subscriptions: expired,
      cancelled_subscriptions: cancelled,
      total_revenue: totalRevenue,
      monthly_revenue: monthlyRevenue,
    };
  }

  /**
   * Get subscription activity/history
   */
  static async getSubscriptionActivity(options?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      type: {
        in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
      },
    };

    // Map activity type filter to order status
    if (options?.status && options.status !== 'all') {
      const statusUpper = options.status.toUpperCase();
      
      if (statusUpper === 'CREATED') {
        where.type = 'MEMBERSHIP_PURCHASE';
      } else if (statusUpper === 'RENEWED') {
        where.type = 'MEMBERSHIP_RENEWAL';
      } else if (statusUpper === 'UPGRADED') {
        where.type = 'MEMBERSHIP_UPGRADE';
      } else if (statusUpper === 'DOWNGRADED') {
        where.type = 'MEMBERSHIP_DOWNGRADE';
      } else if (statusUpper === 'CANCELLED') {
        where.status = 'CANCELLED';
      } else if (statusUpper === 'EXPIRED') {
        where.status = 'FAILED';
      }
    }

    if (options?.search) {
      where.OR = [
        {
          users: {
            name: {
              contains: options.search,
              mode: 'insensitive',
            },
          },
        },
        {
          users: {
            email: {
              contains: options.search,
              mode: 'insensitive',
            },
          },
        },
        {
          order_number: {
            contains: options.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payments: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
            take: 1,
            orderBy: {
              created_at: 'desc',
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.orders.count({ where }),
    ]);

    const activities = await Promise.all(
      orders.map(async (order) => {
        // Map order type to activity type
        let activityType: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'EXPIRED' | 'RENEWED' | 'DOWNGRADED' = 'CREATED';
        let description = '';

        if (order.type === 'MEMBERSHIP_PURCHASE') {
          activityType = 'CREATED';
          description = `New membership purchase for ${order.users.name}`;
        } else if (order.type === 'MEMBERSHIP_RENEWAL') {
          activityType = 'RENEWED';
          description = `Membership renewed for ${order.users.name}`;
        } else if (order.type === 'MEMBERSHIP_UPGRADE') {
          activityType = 'UPDATED';
          description = `Membership upgraded for ${order.users.name}`;
        } else if (order.type === 'MEMBERSHIP_DOWNGRADE') {
          activityType = 'DOWNGRADED';
          description = `Membership downgraded for ${order.users.name}`;
        }

        if (order.status === 'CANCELLED') {
          activityType = 'CANCELLED';
          description = `Order cancelled for ${order.users.name}`;
        } else if (order.status === 'FAILED') {
          activityType = 'EXPIRED';
          description = `Order failed for ${order.users.name}`;
        }

        // Get membership info from order metadata or reference
        let membership = null;
        let membershipLevel = null;

        if (order.reference_id && order.reference_type === 'membership') {
          membership = await prisma.memberships.findUnique({
            where: { id: order.reference_id },
            include: {
              membership_levels: true,
            },
          });

          if (membership) {
            membershipLevel = {
              id: membership.membership_levels.id,
              name: membership.membership_levels.name,
              price: parseFloat(membership.membership_levels.price.toString()),
            };
          }
        }

        // Fallback to breakdown data if membership not found
        const breakdown = order.breakdown as any;
        if (!membershipLevel && breakdown?.items && breakdown.items.length > 0) {
          const item = breakdown.items[0];
          membershipLevel = {
            id: 0,
            name: item.description || 'Membership',
            price: parseFloat(item.amount || order.gross_amount.toString()),
          };
        }

        // Default membership level
        if (!membershipLevel) {
          membershipLevel = {
            id: 0,
            name: 'Membership',
            price: parseFloat(order.gross_amount.toString()),
          };
        }

        return {
          id: order.id,
          user_id: order.user_id,
          user: order.users,
          membership_id: order.reference_id || order.id,
          membership: {
            id: order.reference_id || order.id,
            status: order.status === 'PAID' ? 'ACTIVE' : order.status === 'CANCELLED' ? 'CANCELLED' : order.status === 'FAILED' ? 'EXPIRED' : 'PENDING',
            start_date: membership?.start_date || order.created_at,
            end_date: membership?.end_date || order.expires_at || new Date(new Date(order.created_at).setMonth(new Date(order.created_at).getMonth() + 1)),
            membership_level: membershipLevel,
          },
          activity_type: activityType,
          description,
          created_at: order.created_at,
        };
      })
    );

    return {
      data: activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get subscription activity for a specific user
   */
  static async getUserSubscriptionActivity(userId: number, options?: {
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Get all orders with payments for this user that are membership-related
    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: {
          user_id: userId,
          type: {
            in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
          },
        },
        include: {
          payments: {
            select: {
              id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    }),
      prisma.orders.count({
        where: {
          user_id: userId,
          type: {
            in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE', 'MEMBERSHIP_DOWNGRADE'],
          },
        },
      }),
    ]);

    // Map orders to activities
    const activities = await Promise.all(
      orders.map(async (order) => {
        // Determine activity type from order type
        let activityType: 'NEW' | 'EXTEND' | 'UPGRADE' | 'DOWNGRADE' | 'CANCELLED' | 'EXPIRED' = 'NEW';
        if (order.type === 'MEMBERSHIP_RENEWAL') {
          activityType = 'EXTEND';
        } else if (order.type === 'MEMBERSHIP_UPGRADE') {
          activityType = 'UPGRADE';
        } else if (order.type === 'MEMBERSHIP_DOWNGRADE') {
          activityType = 'DOWNGRADE';
        } else if (order.type === 'MEMBERSHIP_PURCHASE') {
          activityType = 'NEW';
        }

        // Override with order status if cancelled or failed
        if (order.status === 'CANCELLED') {
          activityType = 'CANCELLED';
        } else if (order.status === 'FAILED') {
          activityType = 'EXPIRED';
        }

        // Get membership info from reference or breakdown
        let membership = null;
        let membershipLevel = null;

        if (order.reference_id && order.reference_type === 'membership') {
          membership = await prisma.memberships.findUnique({
            where: { id: order.reference_id },
            include: {
              membership_levels: true,
            },
          });

          if (membership) {
            membershipLevel = {
              id: membership.membership_levels.id,
              name: membership.membership_levels.name,
              price: parseFloat(membership.membership_levels.price.toString()),
            };
          }
        }

        // Fallback to breakdown data
        const breakdown = order.breakdown as any;
        if (!membershipLevel && breakdown?.items && breakdown.items.length > 0) {
          const item = breakdown.items[0];
          membershipLevel = {
            id: 0,
            name: item.description || 'Membership',
            price: parseFloat(item.amount || order.gross_amount.toString()),
          };
        }

        // Default fallback
        if (!membershipLevel) {
          membershipLevel = {
            id: 0,
            name: 'Membership',
            price: parseFloat(order.gross_amount.toString()),
          };
        }

        return {
          id: order.id,
          user_id: order.user_id,
          membership_id: order.reference_id || null,
          membership: {
            id: order.reference_id || order.id,
            status: order.status === 'PAID' ? 'ACTIVE' : order.status === 'CANCELLED' ? 'CANCELLED' : order.status === 'FAILED' ? 'EXPIRED' : 'PENDING',
            start_date: membership?.start_date || order.created_at,
            end_date: membership?.end_date || order.expires_at || new Date(new Date(order.created_at).setMonth(new Date(order.created_at).getMonth() + 1)),
            membership_level: membershipLevel,
          },
          activity_type: activityType,
          description: `${membershipLevel.name} - ${activityType}`,
          created_at: order.created_at,
        };
      })
    );

    return {
      data: activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
