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
    const memberships = await prisma.memberships.findMany({
      where: {
        user_id: userId,
      },
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
    });

    return memberships.map(m => ({
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
      activity_type: m.status === 'CANCELLED' ? 'CANCELLED' : m.status === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
      description: `${m.membership_levels.name} - ${m.status}`,
      created_at: m.created_at,
    }));
  }
}
