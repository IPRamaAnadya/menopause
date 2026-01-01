import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ImageServiceFactory } from '@/features/image/image.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMINISTRATOR') {
      return ApiErrors.unauthorized();
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return ApiErrors.validation({ image: 'Required' }, 'No image provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return ApiErrors.validation({ image: 'Must be an image file' }, 'Invalid file type. Only images are allowed.');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return ApiErrors.validation({ image: 'File too large. Maximum size is 5MB.' }, 'File too large. Maximum size is 5MB.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name}`;
    const imageService = ImageServiceFactory.getService();
    const imageUrl = await imageService.upload(buffer, filename);

    return successResponse({ url: imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    return ApiErrors.internal('Failed to upload image');
  }
}
