import { prisma } from '@/lib/prisma';
import { OrderType, MembershipStatus as PrismaMembershipStatus } from '@/generated/prisma';
import { CreateMembershipInput, MembershipStatus, UpdateMembershipInput } from '../types';
import { orderService } from '@/features/orders/services/order.service';

export class MembershipService {
  /**
   * Get all memberships with user and level details
   * Returns only the latest membership per user
   */
  static async getAllMemberships(options?: {
    page?: number;
    limit?: number;
    status?: MembershipStatus;
    search?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build user filter for search
    const userWhere: any = {};
    if (options?.search) {
      userWhere.OR = [
        {
          name: {
            contains: options.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: options.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get all users with memberships
    const users = await prisma.users.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // For each user, get their latest membership
    const latestMemberships = await Promise.all(
      users.map(async (user) => {
        const membership = await prisma.memberships.findFirst({
          where: {
            user_id: user.id,
            ...(options?.status && { status: options.status }),
          },
          include: {
            membership_levels: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                duration_days: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        return membership ? { ...membership, users: user } : null;
      })
    );

    // Filter out null values (users without memberships)
    const validMemberships = latestMemberships.filter(m => m !== null);

    // Sort by created_at desc
    validMemberships.sort((a, b) => {
      return new Date(b!.created_at).getTime() - new Date(a!.created_at).getTime();
    });

    // Apply pagination
    const total = validMemberships.length;
    const paginatedMemberships = validMemberships.slice(skip, skip + limit);

    return {
      data: paginatedMemberships.map(m => ({
        id: m!.id,
        user_id: m!.user_id,
        membership_level_id: m!.membership_level_id,
        start_date: m!.start_date,
        end_date: m!.end_date,
        status: m!.status,
        created_at: m!.created_at,
        updated_at: m!.updated_at,
        user: m!.users,
        membership_level: {
          ...m!.membership_levels,
          price: parseFloat(m!.membership_levels.price.toString()),
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }



  /**
   * Get membership by ID
   */
  static async getMembershipById(id: number) {
    const membership = await prisma.memberships.findUnique({
      where: { id },
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
            slug: true,
            price: true,
            duration_days: true,
          },
        },
      },
    });

    if (!membership) return null;

    return {
      id: membership.id,
      user_id: membership.user_id,
      membership_level_id: membership.membership_level_id,
      start_date: membership.start_date,
      end_date: membership.end_date,
      status: membership.status,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
      user: membership.users,
      membership_level: {
        ...membership.membership_levels,
        price: parseFloat(membership.membership_levels.price.toString()),
      },
    };
  }

  /**
   * Get current user's active membership
   */
  static async getCurrentUserMembership(userId: number) {
    const membership = await prisma.memberships.findFirst({
      where: {
        user_id: userId,
        status: {
          in: [PrismaMembershipStatus.ACTIVE],
        },
      },
      include: {
        membership_levels: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!membership) return null;

    return {
      id: membership.id,
      user_id: membership.user_id,
      membership_level_id: membership.membership_level_id,
      start_date: membership.start_date,
      end_date: membership.end_date,
      status: membership.status,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
      membership_level: {
        name: membership.membership_levels.name,
      },
    };
  }

  /**
   * Create a new membership
   */
  static async createMembership(data: CreateMembershipInput) {
    console.log('[createMembership] Starting for user', data.user_id);
    
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: data.user_id },
    });

    if (!user) {
      console.error('[createMembership] User not found:', data.user_id);
      throw new Error('User not found');
    }

    // Check if user already has an ACTIVE membership
    const existingActiveMembership = await prisma.memberships.findFirst({
      where: {
        user_id: data.user_id,
        status: 'ACTIVE',
      },
    });

    if (existingActiveMembership) {
      console.error('[createMembership] User already has active membership:', existingActiveMembership.id);
      throw new Error('User already has an active membership. Please edit the existing membership instead.');
    }

    // Check if membership level exists
    const level = await prisma.membership_levels.findUnique({
      where: { id: data.membership_level_id },
    });

    if (!level) {
      console.error('[createMembership] Membership level not found:', data.membership_level_id);
      throw new Error('Membership level not found');
    }

    // Calculate dates
    const startDate = data.start_date ? new Date(data.start_date) : new Date();
    const endDate = data.end_date 
      ? new Date(data.end_date) 
      : new Date(startDate.getTime() + level.duration_days * 24 * 60 * 60 * 1000);

    console.log('[createMembership] Creating membership with:', {
      userId: data.user_id,
      levelId: data.membership_level_id,
      levelName: level.name,
      startDate,
      endDate
    });

    // Create membership
    const membership = await prisma.memberships.create({
      data: {
        user_id: data.user_id,
        membership_level_id: data.membership_level_id,
        start_date: startDate,
        end_date: endDate,
        status: 'ACTIVE',
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
            slug: true,
            price: true,
            duration_days: true,
          },
        },
      },
    });

    console.log('[createMembership] Membership created successfully:', membership.id);

    // Create order and payment for this membership (admin created)
    try {
      await orderService.createAdminOrder({
        userId: data.user_id,
        type: OrderType.SUBSCRIPTION,
        grossAmount: parseFloat(level.price.toString()),
        currency: 'HKD',
        breakdown: {
          base: parseFloat(level.price.toString()),
        },
        referenceId: membership.id,
        referenceType: 'membership',
        metadata: {
          membership_level: level.name,
          duration_days: level.duration_days,
          created_by: 'admin',
        },
        notes: `Admin created membership: ${level.name}`,
      });
    } catch (error) {
      // If order creation fails, log but don't fail membership creation
      console.error('Failed to create order for membership:', error);
    }

    return {
      id: membership.id,
      user_id: membership.user_id,
      membership_level_id: membership.membership_level_id,
      start_date: membership.start_date,
      end_date: membership.end_date,
      status: membership.status,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
      user: membership.users,
      membership_level: {
        ...membership.membership_levels,
        price: parseFloat(membership.membership_levels.price.toString()),
      },
    };
  }

  /**
   * Update membership
   */
  static async updateMembership(id: number, data: UpdateMembershipInput) {
    // Check if membership exists
    const existing = await prisma.memberships.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Membership not found');
    }

    // Update membership
    const membership = await prisma.memberships.update({
      where: { id },
      data: {
        ...(data.membership_level_id && { membership_level_id: data.membership_level_id }),
        ...(data.start_date && { start_date: new Date(data.start_date) }),
        ...(data.end_date && { end_date: new Date(data.end_date) }),
        ...(data.status && { status: data.status }),
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
            slug: true,
            price: true,
            duration_days: true,
          },
        },
      },
    });

    return {
      id: membership.id,
      user_id: membership.user_id,
      membership_level_id: membership.membership_level_id,
      start_date: membership.start_date,
      end_date: membership.end_date,
      status: membership.status,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
      user: membership.users,
      membership_level: {
        ...membership.membership_levels,
        price: parseFloat(membership.membership_levels.price.toString()),
      },
    };
  }

  /**
   * Delete membership
   */
  static async deleteMembership(id: number) {
    // Check if membership exists
    const existing = await prisma.memberships.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Membership not found');
    }

    // Cancel associated order if exists
    try {
      await orderService.cancelOrderByReference(id, 'membership');
    } catch (error) {
      // If order cancellation fails, log but don't fail membership deletion
      console.error('Failed to cancel order for membership:', error);
    }

    await prisma.memberships.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Cancel membership
   */
  static async cancelMembership(id: number) {
    // Check if membership exists
    const existing = await prisma.memberships.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Membership not found');
    }

    if (existing.status === 'CANCELLED') {
      throw new Error('Membership is already cancelled');
    }

    // Cancel membership
    const membership = await prisma.memberships.update({
      where: { id },
      data: {
        status: 'CANCELLED',
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
            slug: true,
            price: true,
            duration_days: true,
          },
        },
      },
    });

    return {
      id: membership.id,
      user_id: membership.user_id,
      membership_level_id: membership.membership_level_id,
      start_date: membership.start_date,
      end_date: membership.end_date,
      status: membership.status,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
      user: membership.users,
      membership_level: {
        ...membership.membership_levels,
        price: parseFloat(membership.membership_levels.price.toString()),
      },
    };
  }

  /**
   * Get user's current active membership
   */
  static async getUserActiveMembership(userId: number) {
    const membership = await prisma.memberships.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
      },
      include: {
        membership_levels: true,
      },
      orderBy: {
        end_date: 'desc',
      },
    });

    if (!membership) {
      return null;
    }

    return {
      id: membership.id,
      user_id: membership.user_id,
      membership_level_id: membership.membership_level_id,
      start_date: membership.start_date,
      end_date: membership.end_date,
      status: membership.status,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
      membership_level: {
        id: membership.membership_levels.id,
        name: membership.membership_levels.name,
        slug: membership.membership_levels.slug,
        priority: membership.membership_levels.priority,
        duration_days: membership.membership_levels.duration_days,
        price: parseFloat(membership.membership_levels.price.toString()),
      },
    };
  }

  /**
   * Get all available membership levels
   */
  static async getAvailableMembershipLevels() {
    const levels = await prisma.membership_levels.findMany({
      orderBy: {
        priority: 'asc',
      },
    });

    return levels.map(level => ({
      id: level.id,
      name: level.name,
      slug: level.slug,
      priority: level.priority,
      price: parseFloat(level.price.toString()),
      duration_days: level.duration_days,
      created_at: level.created_at,
      updated_at: level.updated_at,
    }));
  }

  /**
   * Extend current membership - adds duration to existing end date
   * Works with ACTIVE or EXPIRED memberships
   */
  static async extendMembership(userId: number, membershipLevelId: number) {
    console.log('[extendMembership] Starting for user', userId, 'level', membershipLevelId);
    
    // Get current membership (ACTIVE or EXPIRED)
    const currentMembership = await prisma.memberships.findFirst({
      where: {
        user_id: userId,
        status: {
          in: ['ACTIVE', 'EXPIRED'],
        },
      },
      include: {
        membership_levels: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    
    if (!currentMembership) {
      console.error('[extendMembership] No membership found to extend');
      throw new Error('No membership found to extend');
    }

    console.log('[extendMembership] Found membership:', {
      id: currentMembership.id,
      status: currentMembership.status,
      currentEndDate: currentMembership.end_date
    });

    // Get the membership level to extend with
    const level = await prisma.membership_levels.findUnique({
      where: { id: membershipLevelId },
    });

    if (!level) {
      console.error('[extendMembership] Membership level not found:', membershipLevelId);
      throw new Error('Membership level not found');
    }

    // Calculate new end date by adding duration to current end date
    const currentEndDate = new Date(currentMembership.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + level.duration_days);

    console.log('[extendMembership] Extending membership:', {
      oldEndDate: currentEndDate,
      newEndDate: newEndDate,
      daysAdded: level.duration_days
    });

    // Update existing membership and set status to ACTIVE
    const updatedMembership = await prisma.memberships.update({
      where: { id: currentMembership.id },
      data: {
        end_date: newEndDate,
        status: PrismaMembershipStatus.ACTIVE,
        updated_at: new Date(),
      },
      include: {
        membership_levels: true,
      },
    });

    console.log('[extendMembership] Membership extended successfully:', {
      id: updatedMembership.id,
      newEndDate: updatedMembership.end_date,
      status: updatedMembership.status
    });

    return {
      id: updatedMembership.id,
      user_id: updatedMembership.user_id,
      membership_level_id: updatedMembership.membership_level_id,
      start_date: updatedMembership.start_date,
      end_date: updatedMembership.end_date,
      status: updatedMembership.status,
      created_at: updatedMembership.created_at,
      updated_at: updatedMembership.updated_at,
      membership_level: {
        ...updatedMembership.membership_levels,
        price: parseFloat(updatedMembership.membership_levels.price.toString()),
      },
    };
  }

  /**
   * Change membership level (upgrade or downgrade)
   * Creates a NEW membership and sets old one to STOPPED
   * Duration follows the new level's duration from today
   */
  static async changeMembershipLevel(
    userId: number,
    newMembershipLevelId: number,
    type: 'UPGRADE' | 'DOWNGRADE'
  ) {
    // Get current membership (any status, not just ACTIVE)
    const currentMembership = await prisma.memberships.findFirst({
      where: {
        user_id: userId,
        status: {
          in: ['ACTIVE', 'EXPIRED'],
        },
      },
      include: {
        membership_levels: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    
    if (!currentMembership) {
      throw new Error('No membership found to change');
    }

    if (currentMembership.membership_level_id === newMembershipLevelId) {
      throw new Error('Cannot change to the same membership level');
    }

    // Get the new membership level
    const newLevel = await prisma.membership_levels.findUnique({
      where: { id: newMembershipLevelId },
    });

    if (!newLevel) {
      throw new Error('Membership level not found');
    }

    // Validate upgrade/downgrade based on priority
    if (type === 'UPGRADE' && newLevel.priority <= currentMembership.membership_levels.priority) {
      throw new Error('New level must be higher priority for upgrade');
    }

    if (type === 'DOWNGRADE' && newLevel.priority >= currentMembership.membership_levels.priority) {
      throw new Error('New level must be lower priority for downgrade');
    }

    // Calculate new dates - duration follows new level from today
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + newLevel.duration_days);

    console.log('[changeMembershipLevel] Starting transaction for user', userId);
    console.log('[changeMembershipLevel] Old membership:', {
      id: currentMembership.id,
      status: currentMembership.status,
      level: currentMembership.membership_levels.name
    });

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Set old membership to STOPPED
      console.log('[changeMembershipLevel] Setting old membership to STOPPED');
      await tx.memberships.update({
        where: { id: currentMembership.id },
        data: {
          status: PrismaMembershipStatus.STOPPED,
          updated_at: new Date(),
        },
      });

      // 2. Create new membership
      console.log('[changeMembershipLevel] Creating new membership', {
        userId,
        levelId: newMembershipLevelId,
        startDate,
        endDate
      });
      
      const newMembership = await tx.memberships.create({
        data: {
          user_id: userId,
          membership_level_id: newMembershipLevelId,
          start_date: startDate,
          end_date: endDate,
          status: PrismaMembershipStatus.ACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          membership_levels: true,
        },
      });

      console.log('[changeMembershipLevel] New membership created:', {
        id: newMembership.id,
        status: newMembership.status,
        level: newMembership.membership_levels.name
      });

      return newMembership;
    });

    console.log('[changeMembershipLevel] Transaction completed successfully');

    return {
      id: result.id,
      user_id: result.user_id,
      membership_level_id: result.membership_level_id,
      start_date: result.start_date,
      end_date: result.end_date,
      status: result.status,
      created_at: result.created_at,
      updated_at: result.updated_at,
      membership_level: {
        ...result.membership_levels,
        price: parseFloat(result.membership_levels.price.toString()),
      },
    };
  }
}
