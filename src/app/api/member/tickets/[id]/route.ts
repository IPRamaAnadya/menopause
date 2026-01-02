import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EventRegistrationService } from '@/features/event/services/event-registration.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { id: publicId } = await params;
    const locale = req.nextUrl.searchParams.get('locale') || 'en';

    const registration = await EventRegistrationService.getRegistrationByPublicId(publicId, locale);

    if (!registration) {
      return NextResponse.json(
        { success: false, error: { message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    // Verify ownership
    if (registration.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error('Error fetching ticket detail:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch ticket' },
      },
      { status: 500 }
    );
  }
}
