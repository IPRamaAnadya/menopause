import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MembershipService } from '@/features/membership/services/membership.service';
import { apiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        apiResponse.error('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { membership_level_id, type } = body;

    if (!membership_level_id) {
      return NextResponse.json(
        apiResponse.error('membership_level_id is required'),
        { status: 400 }
      );
    }

    if (!type || !['UPGRADE', 'DOWNGRADE'].includes(type)) {
      return NextResponse.json(
        apiResponse.error('type must be UPGRADE or DOWNGRADE'),
        { status: 400 }
      );
    }

    const membership = await MembershipService.changeMembershipLevel(
      parseInt(session.user.id),
      parseInt(membership_level_id),
      type
    );

    return NextResponse.json(apiResponse.success(membership));
  } catch (error: any) {
    console.error('Error changing membership level:', error);
    return NextResponse.json(
      apiResponse.error(error.message || 'Failed to change membership level'),
      { status: 400 }
    );
  }
}
