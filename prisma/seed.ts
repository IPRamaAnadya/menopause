import { prisma } from '@/lib/prisma';
import { AuthProvider, UserStatus, MembershipStatus } from '../src/generated/prisma/client';


async function main() {
  console.log('🌱 Seeding database...');

  // Create Roles
  console.log('📝 Creating roles...');
  const adminRole = await prisma.roles.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Administrator',
      slug: 'admin',
    },
  });

  const moderatorRole = await prisma.roles.upsert({
    where: { slug: 'moderator' },
    update: {},
    create: {
      name: 'Moderator',
      slug: 'moderator',
    },
  });

  const creatorRole = await prisma.roles.upsert({
    where: { slug: 'creator' },
    update: {},
    create: {
      name: 'Content Creator',
      slug: 'creator',
    },
  });

  const memberRole = await prisma.roles.upsert({
    where: { slug: 'member' },
    update: {},
    create: {
      name: 'Member',
      slug: 'member',
    },
  });

  console.log('✅ Roles created');

  // Create Permissions
  console.log('📝 Creating permissions...');
  const manageUsersPermission = await prisma.permissions.upsert({
    where: { slug: 'manage_users' },
    update: {},
    create: {
      name: 'Manage Users',
      slug: 'manage_users',
    },
  });

  const createContentPermission = await prisma.permissions.upsert({
    where: { slug: 'create_content' },
    update: {},
    create: {
      name: 'Create Content',
      slug: 'create_content',
    },
  });

  const approveContentPermission = await prisma.permissions.upsert({
    where: { slug: 'approve_content' },
    update: {},
    create: {
      name: 'Approve Content',
      slug: 'approve_content',
    },
  });

  const deleteContentPermission = await prisma.permissions.upsert({
    where: { slug: 'delete_content' },
    update: {},
    create: {
      name: 'Delete Content',
      slug: 'delete_content',
    },
  });

  const viewAnalyticsPermission = await prisma.permissions.upsert({
    where: { slug: 'view_analytics' },
    update: {},
    create: {
      name: 'View Analytics',
      slug: 'view_analytics',
    },
  });

  console.log('✅ Permissions created');

  // Assign Permissions to Roles
  console.log('📝 Assigning permissions to roles...');

  // Admin gets all permissions
  const adminPermissions = [
    manageUsersPermission,
    createContentPermission,
    approveContentPermission,
    deleteContentPermission,
    viewAnalyticsPermission,
  ];

  for (const permission of adminPermissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: permission.id,
      },
    });
  }

  // Moderator permissions
  const moderatorPermissions = [
    approveContentPermission,
    deleteContentPermission,
    createContentPermission,
  ];

  for (const permission of moderatorPermissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: moderatorRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: moderatorRole.id,
        permission_id: permission.id,
      },
    });
  }

  // Creator permissions
  await prisma.role_permissions.upsert({
    where: {
      role_id_permission_id: {
        role_id: creatorRole.id,
        permission_id: createContentPermission.id,
      },
    },
    update: {},
    create: {
      role_id: creatorRole.id,
      permission_id: createContentPermission.id,
    },
  });

  console.log('✅ Permissions assigned to roles');

  // Create Membership Levels
  console.log('📝 Creating membership levels...');

  await prisma.membership_levels.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      name: 'Free',
      slug: 'free',
      priority: 1,
      price: 0,
      duration_days: 365, // 1 year
    },
  });

  await prisma.membership_levels.upsert({
    where: { slug: 'silver' },
    update: {},
    create: {
      name: 'Silver',
      slug: 'silver',
      priority: 2,
      price: 9.99,
      duration_days: 30, // 1 month
    },
  });

  await prisma.membership_levels.upsert({
    where: { slug: 'gold' },
    update: {},
    create: {
      name: 'Gold',
      slug: 'gold',
      priority: 3,
      price: 24.99,
      duration_days: 90, // 3 months
    },
  });

  await prisma.membership_levels.upsert({
    where: { slug: 'platinum' },
    update: {},
    create: {
      name: 'Platinum',
      slug: 'platinum',
      priority: 4,
      price: 89.99,
      duration_days: 365, // 1 year
    },
  });

  console.log('✅ Membership levels created');

  // Create a test admin user
  console.log('📝 Creating test admin user...');
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2b$12$Zrc82eAhhJ3MX.Vf6aGiT.7a.YHrS9bN8x.c04gV/qknXMwfm7sOW', // hashed "password123"
      provider: AuthProvider.EMAIL,
      status: UserStatus.ACTIVE,
    },
  });

  // Assign admin role to admin user
  await prisma.user_roles.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: adminRole.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      role_id: adminRole.id,
    },
  });

  // Create free membership for admin user
  const freeMembership = await prisma.membership_levels.findFirst({
    where: { slug: 'free' },
  });

  if (freeMembership) {
    await prisma.memberships.create({
      data: {
        user_id: adminUser.id,
        membership_level_id: freeMembership.id,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        status: MembershipStatus.ACTIVE,
      },
    });
  }

  console.log('✅ Test admin user created');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
