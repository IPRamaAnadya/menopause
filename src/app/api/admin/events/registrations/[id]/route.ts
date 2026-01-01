import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

// PATCH /api/admin/events/registrations/[id] - Update registration status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiErrors.unauthorized();
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { 
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    const isAdmin = user?.user_roles.some(ur => ur.roles.name === 'ADMIN');
    if (!isAdmin) {
      return ApiErrors.forbidden();
    }

    const resolvedParams = await params;
    const registrationId = parseInt(resolvedParams.id);

    if (isNaN(registrationId)) {
      return ApiErrors.badRequest('Invalid registration ID');
    }

    const { status } = await request.json();

    if (!status) {
      return ApiErrors.badRequest('Status is required');
    }

    // Update registration status
    const updatedRegistration = await prisma.event_registrations.update({
      where: { id: registrationId },
      data: { 
        status,
        updated_at: new Date(),
      },
    });

    return successResponse({ data: updatedRegistration });
  } catch (error) {
    console.error('Error updating registration:', error);
    return ApiErrors.internal();
  }
}

// DELETE /api/admin/events/registrations/[id] - Delete a registration (DEV ONLY)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiErrors.unauthorized();
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { 
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    const isAdmin = user?.user_roles.some(ur => ur.roles.name === 'ADMIN');
    if (!isAdmin) {
      return ApiErrors.forbidden();
    }

    const resolvedParams = await params;
    const registrationId = parseInt(resolvedParams.id);

    if (isNaN(registrationId)) {
      return ApiErrors.badRequest('Invalid registration ID');
    }

    // Delete the registration (cascade will delete guest record if exists)
    await prisma.event_registrations.delete({
      where: { id: registrationId },
    });

    return successResponse({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return ApiErrors.internal('Failed to delete registration');
  }
}
