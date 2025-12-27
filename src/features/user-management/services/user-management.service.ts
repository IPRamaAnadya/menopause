import { prisma } from '@/lib/prisma';
import { GetUsersParams, PaginatedUsers, User } from '../types';

export class UserManagementService {
  /**
   * Get all users with filtering, searching, and pagination
   */
  static async getUsers(params: GetUsersParams): Promise<PaginatedUsers> {
    const {
      search = '',
      role,
      status,
      page = 1,
      limit = 10,
    } = params;

    // Build where clause for filtering
    const where: any = {};

    // Search filter (name or email)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Role filter - need to join with user_roles and roles
    let roleFilter: any = undefined;
    if (role) {
      roleFilter = {
        user_roles: {
          some: {
            roles: {
              name: role,
            },
          },
        },
      };
    }

    const finalWhere = roleFilter ? { ...where, ...roleFilter } : where;

    // Get total count for pagination
    const total = await prisma.users.count({
      where: finalWhere,
    });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Fetch users with relations
    const users = await prisma.users.findMany({
      where: finalWhere,
      skip,
      take: limit,
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
        memberships: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            membership_levels: true,
          },
          orderBy: {
            end_date: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Transform data to match User interface
    const transformedUsers: User[] = users.map((user) => {
      // Get primary role (first role or 'Member' as default)
      const primaryRole = user.user_roles[0]?.roles.name || 'Member';

      // Get active membership level
      const activeMembership = user.memberships[0]?.membership_levels.name || 'Free';

      // Calculate last active (for now, use updated_at)
      const lastActive = this.formatLastActive(user.updated_at);

      return {
        id: user.id,
        publicId: user.public_id,
        name: user.name,
        email: user.email,
        role: primaryRole,
        status: user.status as 'ACTIVE' | 'SUSPENDED',
        membershipLevel: activeMembership,
        joinedDate: user.created_at.toISOString().split('T')[0],
        lastActive,
        image: user.image,
        isResetPassword: user.is_reset_password,
      };
    });

    return {
      users: transformedUsers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Format last active date to relative time
   */
  private static formatLastActive(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const totalUsers = await prisma.users.count();

    const activeToday = await prisma.users.count({
      where: {
        updated_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const premiumMembers = await prisma.memberships.count({
      where: {
        status: 'ACTIVE',
        membership_levels: {
          slug: {
            in: ['platinum', 'gold'],
          },
        },
      },
    });

    const administrators = await prisma.user_roles.count({
      where: {
        roles: {
          name: 'Administrator',
        },
      },
    });

    return {
      totalUsers,
      activeToday,
      premiumMembers,
      administrators,
    };
  }

  /**
   * Update user status
   */
  static async updateUserStatus(userId: number, status: 'ACTIVE' | 'SUSPENDED') {
    const user = await prisma.users.update({
      where: { id: userId },
      data: { status },
    });

    return user;
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId: number, roleName: string) {
    // First, get the role ID
    const role = await prisma.roles.findFirst({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    // Remove existing roles
    await prisma.user_roles.deleteMany({
      where: { user_id: userId },
    });

    // Add new role
    await prisma.user_roles.create({
      data: {
        user_id: userId,
        role_id: role.id,
      },
    });

    return { success: true };
  }

  /**
   * Set user password reset flag
   */
  static async setPasswordReset(userId: number, resetPassword: boolean) {
    const user = await prisma.users.update({
      where: { id: userId },
      data: { is_reset_password: resetPassword },
    });

    return user;
  }

  /**
   * Create a new user
   */
  static async createUser(data: {
    email: string;
    name: string;
    roleName: string;
    membershipSlug?: string;
  }) {
    const { email, name, roleName, membershipSlug = 'free' } = data;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Get role
    const role = await prisma.roles.findFirst({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    // Get membership level
    const membershipLevel = await prisma.membership_levels.findFirst({
      where: { slug: membershipSlug },
    });

    if (!membershipLevel) {
      throw new Error(`Membership level '${membershipSlug}' not found`);
    }

    // Get default password from environment
    const defaultPassword = process.env.DEFAULT_PASSWORD || 'Welcome@123';
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Create user
    const user = await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
        provider: 'EMAIL',
        status: 'ACTIVE',
        is_reset_password: true, // User should reset password on first login
      },
    });

    // Assign role
    await prisma.user_roles.create({
      data: {
        user_id: user.id,
        role_id: role.id,
      },
    });

    // Create membership
    await prisma.memberships.create({
      data: {
        user_id: user.id,
        membership_level_id: membershipLevel.id,
        start_date: new Date(),
        end_date: new Date(Date.now() + membershipLevel.duration_days * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    });

    return user;
  }
}
