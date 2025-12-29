import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MembershipService } from '@/features/membership/services/membership.service';
import { apiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        apiResponse.error('Unauthorized'),
        { status: 401 }
      );
    }

    const membership = await MembershipService.getUserActiveMembership(
      parseInt(session.user.id)
    );

    if (!membership) {
      return NextResponse.json(
        apiResponse.error('No active membership found'),
        { status: 404 }
      );
    }

    return NextResponse.json(apiResponse.success(membership));
  } catch (error) {
    console.error('Error fetching current membership:', error);
    return NextResponse.json(
      apiResponse.error('Failed to fetch current membership'),
      { status: 500 }
    );
  }
}
