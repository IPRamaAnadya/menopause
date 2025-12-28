import { NextRequest, NextResponse } from 'next/server';
import { ServicesService } from '@/features/services/services/services.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

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
      return ApiErrors.notFound('Service');
    }

    // Only return if service is active
    if (!service.is_active) {
      return ApiErrors.notFound('Service');
    }

    return successResponse(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return ApiErrors.internal('Failed to fetch service');
  }
}
