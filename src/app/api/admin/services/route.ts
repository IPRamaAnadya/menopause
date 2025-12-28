import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServicesService } from '@/features/services/services/services.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/admin/services - Get all services (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const locale = request.headers.get('locale') || 'en'; // Get locale from header

    const services = await ServicesService.getServices({ activeOnly, locale });

    return successResponse(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return ApiErrors.internal('Failed to fetch services');
  }
}

// POST /api/admin/services - Create a new service (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const form = await request.formData();
    const image = form.get('image'); // File
    const is_active = form.get('is_active') === 'true';
    const order = Number(form.get('order'));
    const translations = JSON.parse(form.get('translations') as string);
    const body = { image, is_active, order, translations };

    if (!body.translations || !Array.isArray(body.translations) || body.translations.length === 0) {
      return ApiErrors.validation({ translations: 'Required and must be an array' }, 'Translations are required');
    }

    // Validate each translation has title and description
    const hasValidTranslations = body.translations.every(
      (t: any) => t.locale && t.title && t.description
    );

    if (!hasValidTranslations) {
      return ApiErrors.validation({ translations: 'Each translation must have locale, title, and description' });
    }

    const service = await ServicesService.createService(body);

    return successResponse(service, 201);
  } catch (error) {
    console.error('Error creating service:', error);
    return ApiErrors.internal('Failed to create service');
  }
}
