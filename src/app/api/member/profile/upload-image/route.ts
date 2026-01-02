import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ImageServiceFactory } from '@/features/image/image.service';
import { ProfileService } from '@/features/profile/services/profile.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: 'No image provided' } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid file type. Only images are allowed.' } },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: { message: 'File too large. Maximum size is 5MB.' } },
        { status: 400 }
      );
    }

    // Upload image
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `profile_${userId}_${Date.now()}_${file.name}`;
    const imageService = ImageServiceFactory.getService();
    const imageUrl = await imageService.upload(buffer, filename);

    // Update profile with new image URL
    const updatedProfile = await ProfileService.updateProfileImage(
      userId,
      imageUrl
    );

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile image uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to upload profile image' },
      },
      { status: 500 }
    );
  }
}
