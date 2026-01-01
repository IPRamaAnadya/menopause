import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/features/event/services/event.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/events/upcoming - Get first upcoming public event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const event = await EventService.getFirstUpcomingEvent(locale);

    if (!event) {
      return NextResponse.json(
        {
          success: true,
          data: null,
          message: 'No upcoming events found',
        },
        { status: 200 }
      );
    }

    return successResponse(event);
  } catch (error) {
    console.error('Error fetching upcoming event:', error);
    return ApiErrors.internal('Failed to fetch upcoming event');
  }
}
