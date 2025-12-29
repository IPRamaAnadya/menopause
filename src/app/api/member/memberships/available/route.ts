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

    const levels = await MembershipService.getAvailableMembershipLevels();

    return NextResponse.json(apiResponse.success(levels));
  } catch (error) {
    console.error('Error fetching membership levels:', error);
    return NextResponse.json(
      apiResponse.error('Failed to fetch membership levels'),
      { status: 500 }
    );
  }
}
