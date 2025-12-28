import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return ApiErrors.validation({ email, password }, 'Email and password are required');
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return ApiErrors.alreadyExists('User with this email');
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: 'EMAIL',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    // Assign default "Member" role
    const memberRole = await prisma.roles.findUnique({
      where: { slug: 'member' },
    });

    if (memberRole) {
      await prisma.user_roles.create({
        data: {
          user_id: user.id,
          role_id: memberRole.id,
        },
      });
    }

    // Assign free membership
    const freeMembership = await prisma.membership_levels.findFirst({
      where: { slug: 'free' },
    });

    if (freeMembership) {
      await prisma.memberships.create({
        data: {
          user_id: user.id,
          membership_level_id: freeMembership.id,
          start_date: new Date(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          status: 'ACTIVE',
        },
      });
    }

    return successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return ApiErrors.internal('Something went wrong during registration');
  }
}
