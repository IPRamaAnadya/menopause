import { NextRequest, NextResponse } from 'next/server';
import { ServicesService } from '@/features/services/services/services.service';

// GET /api/public/services - Get all active services (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    // Get locale from header (default to undefined)
    const locale = request.headers.get('Locale') || undefined;

    console.log('Fetching public services with locale:', locale);

    // Only return active services for public API
    const services = await ServicesService.getServices({ 
      activeOnly: true,
      locale 
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
