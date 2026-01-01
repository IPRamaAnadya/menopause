import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/features/event/services/event.service';
import { successResponse, paginatedResponse, ApiErrors } from '@/lib/api-response';

// GET /api/events - Get public events with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const search = searchParams.get('search') || undefined;
    const highlighted = searchParams.get('highlighted') === 'true' ? true : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    
    // Enhanced filters
    const timeFilter = searchParams.get('timeFilter') || 'all';
    const locationFilter = searchParams.get('locationFilter') || 'all';
    const paymentFilter = searchParams.get('paymentFilter') || 'all';
    
    const result = await EventService.getEventsForList({ 
      status: 'PUBLISHED',
      is_public: true,
      locale,
      page,
      pageSize,
      timeFilter: timeFilter as any,
      locationFilter: locationFilter as any,
      visibilityFilter: 'public',
      paymentFilter: paymentFilter as any,
      highlighted,
      limit,
    });

    return paginatedResponse(
      result.data,
      result.pagination.page,
      result.pagination.pageSize,
      result.pagination.total
    );
  } catch (error) {
    console.error('Error fetching public events:', error);
    return ApiErrors.internal('Failed to fetch events');
  }
}
