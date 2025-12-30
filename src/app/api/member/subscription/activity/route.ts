import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/features/membership/services/subscription.service';
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

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    const result = await SubscriptionService.getUserSubscriptionActivity(
      parseInt(session.user.id),
      { page, limit }
    );

    return NextResponse.json(apiResponse.success(result));
  } catch (error: any) {
    console.error('Error fetching subscription activity:', error);
    return NextResponse.json(
      apiResponse.error(error.message || 'Failed to fetch subscription activity'),
      { status: 500 }
    );
  }
}
