import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EventRegistrationService } from '@/features/event/services/event-registration.service';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

// GET /api/admin/events/[id]/registrations - Get event registrations with pagination and filters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    const eventId = parseInt(id);
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      event_id: eventId,
    };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        {
          users: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          guests: {
            OR: [
              { full_name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }
    
    // Get total count
    const total = await prisma.event_registrations.count({ where });
    
    // Fetch registrations
    const registrations = await prisma.event_registrations.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        registered_at: 'desc',
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        guests: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return successResponse({
      data: registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return ApiErrors.internal('Failed to fetch registrations');
  }
}
