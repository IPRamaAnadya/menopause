import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/features/event/services/event.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/events/[slug] - Get event by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const locale = request.headers.get('locale') || 'en';
    
    const event = await EventService.getEventBySlug(slug, locale);

    if (!event) {
      return ApiErrors.notFound('Event');
    }

    // Only return published and public events
    if (event.status !== 'PUBLISHED' || !event.is_public) {
      return ApiErrors.notFound('Event');
    }

    return successResponse(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return ApiErrors.internal('Failed to fetch event');
  }
}
