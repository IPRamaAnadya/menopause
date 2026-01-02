import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileService } from '@/features/profile/services/profile.service';
import { UpdateProfileDTO } from '@/features/profile/types';

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
    const profile = await ProfileService.getProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { message: 'Profile not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch profile' },
      },
      { status: 500 }
    );
  }
}

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
    const body: UpdateProfileDTO = await req.json();

    // Validate input
    if (body.name !== undefined && typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid name format' } },
        { status: 400 }
      );
    }

    if (body.profession !== undefined && typeof body.profession !== 'string') {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid profession format' } },
        { status: 400 }
      );
    }

    if (body.is_hidden !== undefined && typeof body.is_hidden !== 'boolean') {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid is_hidden format' } },
        { status: 400 }
      );
    }

    const updatedProfile = await ProfileService.updateProfile(userId, body);

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to update profile' },
      },
      { status: 500 }
    );
  }
}
