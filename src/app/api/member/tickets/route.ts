import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EventRegistrationService } from '@/features/event/services/event-registration.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const locale = req.nextUrl.searchParams.get('locale') || 'en';

    const registrations = await EventRegistrationService.getUserRegistrations(userId, locale);

    return NextResponse.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch tickets' },
      },
      { status: 500 }
    );
  }
}
