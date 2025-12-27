import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServicesService } from '@/features/services/services/services.service';

// POST /api/admin/services/reorder - Bulk update service order (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.services || !Array.isArray(body.services)) {
      return NextResponse.json(
        { error: 'Services array is required' },
        { status: 400 }
      );
    }

    // Validate that each item has id and order
    const isValid = body.services.every(
      (item: any) => typeof item.id === 'number' && typeof item.order === 'number'
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Each service must have id and order' },
        { status: 400 }
      );
    }

    await ServicesService.bulkUpdateOrder(body.services);

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating service order:', error);
    return NextResponse.json(
      { error: 'Failed to update service order' },
      { status: 500 }
    );
  }
}
