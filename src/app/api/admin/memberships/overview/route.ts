import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        apiResponse.error('Unauthorized'),
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // For now, allowing any authenticated user

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        include: {
          memberships: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
            include: {
              membership_levels: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  duration_days: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.users.count({ where }),
    ]);

    const membersWithLastMembership = users.map(user => {
      const lastMembership = user.memberships[0];
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        last_membership: lastMembership ? {
          id: lastMembership.id,
          status: lastMembership.status,
          start_date: lastMembership.start_date,
          end_date: lastMembership.end_date,
          membership_level: {
            id: lastMembership.membership_levels.id,
            name: lastMembership.membership_levels.name,
            price: parseFloat(lastMembership.membership_levels.price.toString()),
            duration_days: lastMembership.membership_levels.duration_days,
          },
          created_at: lastMembership.created_at,
        } : null,
      };
    });

    return NextResponse.json(
      apiResponse.success({
        data: membersWithLastMembership,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error: any) {
    console.error('Error fetching membership overview:', error);
    return NextResponse.json(
      apiResponse.error(error.message || 'Failed to fetch membership overview'),
      { status: 500 }
    );
  }
}
