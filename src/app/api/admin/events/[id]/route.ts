import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EventService } from '@/features/event/services/event.service';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { EventStatus } from '@/generated/prisma';

// GET /api/admin/events/[id] - Get single event
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
    const locale = request.headers.get('locale') || undefined;
    
    const event = await EventService.getEventById(parseInt(id), locale);

    if (!event) {
      return ApiErrors.notFound('Event');
    }

    return successResponse(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return ApiErrors.internal('Failed to fetch event');
  }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const translationsStr = formData.get('translations') as string;
    const pricesStr = formData.get('prices') as string;

    const data: any = {
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
      translations: JSON.parse(translationsStr),
      prices: pricesStr ? JSON.parse(pricesStr) : [],
    };

    const event = await EventService.updateEvent(parseInt(id), data);
    return successResponse(event);
  } catch (error: any) {
    console.error('Error updating event:', error);
    return ApiErrors.internal(error.message || 'Failed to update event');
  }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    await EventService.deleteEvent(parseInt(id));
    return successResponse({ deleted: true });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return ApiErrors.internal(error.message || 'Failed to delete event');
  }
}
