import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileService } from '@/features/profile/services/profile.service';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await req.json();

    if (!body.image || typeof body.image !== 'string') {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid image URL' } },
        { status: 400 }
      );
    }

    const updatedProfile = await ProfileService.updateProfileImage(
      userId,
      body.image
    );

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile image updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to update profile image' },
      },
      { status: 500 }
    );
  }
}
