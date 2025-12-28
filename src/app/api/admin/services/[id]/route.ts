import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServicesService } from '@/features/services/services/services.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/admin/services/[id] - Get a single service (admin only)
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
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en'; // Default to 'en'
    
    const service = await ServicesService.getServiceById(parseInt(id), locale);

    if (!service) {
      return ApiErrors.notFound('Service');
    }

    return successResponse(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return ApiErrors.internal('Failed to fetch service');
  }
}

// PUT /api/admin/services/[id] - Update a service (admin only)
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
    const form = await request.formData();
    const image = form.get('image');
    const is_active = form.get('is_active') === 'true';
    const order = Number(form.get('order'));
    const translations = JSON.parse(form.get('translations') as string);
    const body = { image, is_active, order, translations };
    console.log('Updating service:', id);
    console.log('Request body:', JSON.stringify(body, null, 2));

    const service = await ServicesService.updateService(parseInt(id), body);

    return successResponse(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return ApiErrors.internal('Failed to update service');
  }
}

// DELETE /api/admin/services/[id] - Delete a service (admin only)
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
    await ServicesService.deleteService(parseInt(id));

    return successResponse({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return ApiErrors.internal('Failed to delete service');
  }
}
