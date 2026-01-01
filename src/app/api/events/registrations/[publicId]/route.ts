import { NextRequest, NextResponse } from 'next/server';
import { EventRegistrationService } from '@/features/event/services/event-registration.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/events/registrations/[publicId] - Get registration by public ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { publicId } = resolvedParams;

    // Get locale from header or default to 'en'
    const locale = request.headers.get('locale') || 'en';

    const registration = await EventRegistrationService.getRegistrationByPublicId(publicId, locale);

    if (!registration) {
      return ApiErrors.notFound('Registration not found');
    }

    return successResponse(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    return ApiErrors.internal('Failed to fetch registration');
  }
}
