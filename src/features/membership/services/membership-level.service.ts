import { prisma } from '@/lib/prisma';
import { CreateMembershipLevelDTO, UpdateMembershipLevelDTO, MembershipLevelFilters } from '../types';
import { Prisma } from '@/generated/prisma';

export class MembershipLevelService {
  /**
   * Get all membership levels
   */
  static async getMembershipLevels(filters?: MembershipLevelFilters) {
    const sortBy = filters?.sortBy || 'priority';
    const sortOrder = filters?.sortOrder || 'desc';

    const orderBy: Prisma.membership_levelsOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const levels = await prisma.membership_levels.findMany({
      orderBy,
    });

    return levels.map(level => ({
      id: level.id,
      name: level.name,
      slug: level.slug,
      priority: level.priority,
      price: Number(level.price),
      duration_days: level.duration_days,
      created_at: level.created_at.toISOString(),
      updated_at: level.updated_at.toISOString(),
    }));
  }

  /**
   * Get membership level by ID
   */
  static async getMembershipLevelById(id: number) {
    const level = await prisma.membership_levels.findUnique({
      where: { id },
    });

    if (!level) return null;

    return {
      id: level.id,
      name: level.name,
      slug: level.slug,
      priority: level.priority,
      price: Number(level.price),
      duration_days: level.duration_days,
      created_at: level.created_at.toISOString(),
      updated_at: level.updated_at.toISOString(),
    };
  }

  /**
   * Create a new membership level
   */
  static async createMembershipLevel(data: CreateMembershipLevelDTO) {
    // Check if slug already exists
    const existing = await prisma.membership_levels.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new Error('Membership level with this slug already exists');
    }

    // Check if priority already exists
    const existingPriority = await prisma.membership_levels.findUnique({
      where: { priority: data.priority },
    });

    if (existingPriority) {
      throw new Error('Membership level with this priority already exists');
    }

    const level = await prisma.membership_levels.create({
      data: {
        name: data.name,
        slug: data.slug,
        priority: data.priority,
        price: new Prisma.Decimal(data.price),
        duration_days: data.duration_days,
      },
    });

    return {
      id: level.id,
      name: level.name,
      slug: level.slug,
      priority: level.priority,
      price: Number(level.price),
      duration_days: level.duration_days,
      created_at: level.created_at.toISOString(),
      updated_at: level.updated_at.toISOString(),
    };
  }

  /**
   * Update membership level
   */
  static async updateMembershipLevel(id: number, data: UpdateMembershipLevelDTO) {
    // Check if slug is being changed and already exists
    if (data.slug) {
      const existing = await prisma.membership_levels.findFirst({
        where: {
          slug: data.slug,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error('Membership level with this slug already exists');
      }
    }

    // Check if priority is being changed and already exists
    if (data.priority !== undefined) {
      const existingPriority = await prisma.membership_levels.findFirst({
        where: {
          priority: data.priority,
          NOT: { id },
        },
      });

      if (existingPriority) {
        throw new Error('Membership level with this priority already exists');
      }
    }

    const updateData: Prisma.membership_levelsUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.duration_days !== undefined) updateData.duration_days = data.duration_days;

    const level = await prisma.membership_levels.update({
      where: { id },
      data: updateData,
    });

    return {
      id: level.id,
      name: level.name,
      slug: level.slug,
      priority: level.priority,
      price: Number(level.price),
      duration_days: level.duration_days,
      created_at: level.created_at.toISOString(),
      updated_at: level.updated_at.toISOString(),
    };
  }

  /**
   * Delete membership level
   */
  static async deleteMembershipLevel(id: number) {
    // Check if there are any active memberships with this level
    const activeMemberships = await prisma.memberships.count({
      where: {
        membership_level_id: id,
        status: 'ACTIVE',
      },
    });

    if (activeMemberships > 0) {
      throw new Error('Cannot delete membership level with active memberships');
    }

    await prisma.membership_levels.delete({
      where: { id },
    });
  }
}
