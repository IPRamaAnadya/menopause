import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EventService } from '@/features/event/services/event.service';
import { successResponse, paginatedResponse, ApiErrors } from '@/lib/api-response';
import { EventStatus } from '@/generated/prisma';

// GET /api/admin/events - Get paginated events optimized for list display (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const status = searchParams.get('status') as EventStatus | null;
    const is_public = searchParams.get('is_public');
    const upcomingOnly = searchParams.get('upcomingOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    
    // Enhanced filters
    const timeFilter = searchParams.get('timeFilter') || 'all';
    const locationFilter = searchParams.get('locationFilter') || 'all';
    const visibilityFilter = searchParams.get('visibilityFilter') || 'all';
    const paymentFilter = searchParams.get('paymentFilter') || 'all';
    
    const result = await EventService.getEventsForList({ 
      status: status || undefined,
      is_public: is_public ? is_public === 'true' : undefined,
      upcomingOnly,
      locale,
      page,
      pageSize,
      timeFilter: timeFilter as any,
      locationFilter: locationFilter as any,
      visibilityFilter: visibilityFilter as any,
      paymentFilter: paymentFilter as any,
    });

    return paginatedResponse(
      result.data,
      result.pagination.page,
      result.pagination.pageSize,
      result.pagination.total
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return ApiErrors.internal('Failed to fetch events');
  }
}

// POST /api/admin/events - Create event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const translationsStr = formData.get('translations') as string;
    const pricesStr = formData.get('prices') as string;

    const data = {
      slug: formData.get('slug') as string,
      image: image || undefined,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      start_time: formData.get('start_time') as string || undefined,
      end_time: formData.get('end_time') as string || undefined,
      is_online: formData.get('is_online') === 'true',
      meeting_url: formData.get('meeting_url') as string || undefined,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
      is_paid: formData.get('is_paid') === 'true',
      capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : undefined,
      is_public: formData.get('is_public') === 'true',
      is_highlighted: formData.get('is_highlighted') === 'true',
      status: formData.get('status') as EventStatus,
      created_by: parseInt(session.user.id),
      translations: JSON.parse(translationsStr),
      prices: pricesStr ? JSON.parse(pricesStr) : [],
    };

    const event = await EventService.createEvent(data);
    return successResponse(event, 201);
  } catch (error: any) {
    console.error('Error creating event:', error);
    return ApiErrors.internal(error.message || 'Failed to create event');
  }
}
