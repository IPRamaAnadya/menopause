import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MembershipService } from '@/features/membership/services/membership.service';

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
    const membership = await MembershipService.getCurrentUserMembership(userId);

    return NextResponse.json({
      success: true,
      data: membership
    });
  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { message: 'Failed to fetch membership' } 
      },
      { status: 500 }
    );
  }
}
