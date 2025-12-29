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
      prisma.memberships.count(),
      prisma.memberships.count({ where: { status: 'ACTIVE' } }),
      prisma.memberships.count({ where: { status: 'EXPIRED' } }),
      prisma.memberships.count({ where: { status: 'CANCELLED' } }),
    ]);

    // Calculate total revenue from all memberships
    const memberships = await prisma.memberships.findMany({
      include: {
        membership_levels: {
          select: {
            price: true,
          },
        },
      },
    });

    const totalRevenue = memberships.reduce((sum, m) => {
      return sum + parseFloat(m.membership_levels.price.toString());
    }, 0);

    // Calculate monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyMemberships = await prisma.memberships.findMany({
      where: {
        created_at: {
          gte: startOfMonth,
        },
      },
      include: {
        membership_levels: {
          select: {
            price: true,
          },
        },
      },
    });

    const monthlyRevenue = monthlyMemberships.reduce((sum, m) => {
      return sum + parseFloat(m.membership_levels.price.toString());
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

    const where: any = {};

    // Map activity type filter to membership status
    if (options?.status && options.status !== 'all') {
      const statusUpper = options.status.toUpperCase();
      
      if (statusUpper === 'CREATED' || statusUpper === 'RENEWED') {
        // Both CREATED and RENEWED are ACTIVE memberships
        where.status = 'ACTIVE';
      } else if (statusUpper === 'CANCELLED') {
        where.status = 'CANCELLED';
      } else if (statusUpper === 'EXPIRED') {
        where.status = 'EXPIRED';
      } else {
        // Direct status match (ACTIVE, EXPIRED, CANCELLED)
        where.status = statusUpper;
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
          membership_levels: {
            name: {
              contains: options.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const [memberships, total] = await Promise.all([
      prisma.memberships.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          membership_levels: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.memberships.count({ where }),
    ]);

    const activities = memberships.map(m => {
      let activityType: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'EXPIRED' | 'RENEWED' = 'CREATED';
      let description = '';

      if (m.status === 'CANCELLED') {
        activityType = 'CANCELLED';
        description = `Membership cancelled for ${m.users.name}`;
      } else if (m.status === 'EXPIRED') {
        activityType = 'EXPIRED';
        description = `Membership expired for ${m.users.name}`;
      } else if (m.status === 'ACTIVE') {
        const daysSinceCreated = Math.floor(
          (new Date().getTime() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreated > 7) {
          activityType = 'RENEWED';
          description = `Membership renewed for ${m.users.name} - ${m.membership_levels.name}`;
        } else {
          activityType = 'CREATED';
          description = `New ${m.membership_levels.name} membership for ${m.users.name}`;
        }
      }

      return {
        id: m.id,
        user_id: m.user_id,
        user: m.users,
        membership_id: m.id,
        membership: {
          id: m.id,
          status: m.status,
          start_date: m.start_date,
          end_date: m.end_date,
          membership_level: {
            id: m.membership_levels.id,
            name: m.membership_levels.name,
            price: parseFloat(m.membership_levels.price.toString()),
          },
        },
        activity_type: activityType,
        description,
        created_at: m.created_at,
      };
    });

    // Post-filter for specific activity types (CREATED vs RENEWED)
    let filteredActivities = activities;
    if (options?.status && options.status !== 'all') {
      const statusUpper = options.status.toUpperCase();
      if (statusUpper === 'CREATED') {
        filteredActivities = activities.filter(a => a.activity_type === 'CREATED');
      } else if (statusUpper === 'RENEWED') {
        filteredActivities = activities.filter(a => a.activity_type === 'RENEWED');
      }
    }

    return {
      data: filteredActivities,
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
  static async getUserSubscriptionActivity(userId: number) {
    // Get all orders with payments for this user that are membership-related
    const orders = await prisma.orders.findMany({
      where: {
        user_id: userId,
        order_type: {
          in: ['MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_UPGRADE'],
        },
      },
      include: {
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            metadata: true,
          },
        },
        membership_levels: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Map orders to activities
    const activities = await Promise.all(
      orders.map(async (order) => {
        // Get the payment metadata to find operation type and membership ID
        const payment = order.payments[0];
        const metadata = payment?.metadata as any;
        
        // Determine activity type from order type and metadata
        let activityType: 'NEW' | 'EXTEND' | 'UPGRADE' | 'DOWNGRADE' | 'CANCELLED' | 'EXPIRED' = 'NEW';
        if (metadata?.operation_type) {
          activityType = metadata.operation_type;
        } else if (order.order_type === 'MEMBERSHIP_RENEWAL') {
          activityType = 'EXTEND';
        } else if (order.order_type === 'MEMBERSHIP_UPGRADE') {
          activityType = 'UPGRADE';
        } else if (order.order_type === 'MEMBERSHIP_PURCHASE') {
          activityType = 'NEW';
        }

        // Get the membership created/updated by this order
        let membershipStatus = 'ACTIVE';
        if (metadata?.membership_id) {
          const membership = await prisma.memberships.findUnique({
            where: { id: parseInt(metadata.membership_id) },
            select: { status: true },
          });
          if (membership) {
            membershipStatus = membership.status;
          }
        }

        return {
          id: order.id,
          user_id: order.user_id,
          membership_id: metadata?.membership_id || null,
          membership: {
            id: metadata?.membership_id || order.id,
            status: membershipStatus,
            start_date: order.created_at,
            end_date: new Date(new Date(order.created_at).setMonth(new Date(order.created_at).getMonth() + 1)),
            membership_level: {
              id: order.membership_levels?.id || 0,
              name: order.membership_levels?.name || 'Unknown',
              price: order.total_amount ? parseFloat(order.total_amount.toString()) : 0,
            },
          },
          activity_type: activityType,
          description: `${order.membership_levels?.name || 'Membership'} - ${activityType}`,
          created_at: order.created_at,
        };
      })
    );

    return activities;
  }
}
