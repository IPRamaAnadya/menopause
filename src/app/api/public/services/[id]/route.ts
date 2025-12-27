import { NextRequest, NextResponse } from 'next/server';
import { ServicesService } from '@/features/services/services/services.service';

// GET /api/public/services/[id] - Get a single active service (public, no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || undefined;

    const service = await ServicesService.getServiceById(parseInt(id), locale);

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Only return if service is active
    if (!service.is_active) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
