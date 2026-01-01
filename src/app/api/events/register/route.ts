import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EventRegistrationService } from '@/features/event/services/event-registration.service';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { EventRegistrationStatus } from '@/generated/prisma';

// POST /api/events/register - Create event registration (free events only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { event_id, membership_level_id, guest } = body;

    if (!event_id) {
      return ApiErrors.badRequest('Event ID is required');
    }

    // Validate registration and get price
    const validationResult = await EventRegistrationService.validateRegistration({
      event_id,
      user_id: session?.user?.id ? parseInt(session.user.id) : undefined,
      membership_level_id: membership_level_id || null,
    });

    // Only allow free registrations through this endpoint
    if (validationResult.price > 0) {
      return ApiErrors.badRequest('Paid events must use checkout endpoint');
    }

    // Create registration
    const registration = await EventRegistrationService.createRegistration({
      event_id,
      user_id: session?.user?.id ? parseInt(session.user.id) : undefined,
      membership_level_id: membership_level_id || null,
      price: 0,
      status: EventRegistrationStatus.PAID, // Free events are immediately confirmed
      guest: !session?.user ? guest : undefined,
    });

    // Ensure registration has required fields
    if (!registration || !registration.public_id) {
      throw new Error('Failed to create registration');
    }

    // Send confirmation email
    try {
      const registrationWithDetails = await EventRegistrationService.getRegistrationById(registration.id);
      if (registrationWithDetails) {
        await EventRegistrationService.sendRegistrationConfirmationEmail(registrationWithDetails);
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    return successResponse({ 
      id: registration.id,
      public_id: registration.public_id,
      status: registration.status,
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    if (error instanceof Error) {
      return ApiErrors.badRequest(error.message);
    }
    return ApiErrors.internal('Failed to create registration');
  }
}
