import { prisma } from '@/lib/prisma';
import { UserProfile, UpdateProfileDTO } from '../types';

export class ProfileService {
  /**
   * Get user profile by user ID
   */
  static async getProfile(userId: number): Promise<UserProfile | null> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        public_id: true,
        email: true,
        name: true,
        profession: true,
        is_hidden: true,
        image: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      public_id: user.public_id,
      email: user.email,
      name: user.name,
      profession: user.profession,
      is_hidden: user.is_hidden,
      image: user.image,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: number,
    data: UpdateProfileDTO
  ): Promise<UserProfile> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.profession !== undefined) {
      updateData.profession = data.profession;
    }

    if (data.is_hidden !== undefined) {
      updateData.is_hidden = data.is_hidden;
    }

    if (data.image !== undefined) {
      updateData.image = data.image;
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        public_id: true,
        email: true,
        name: true,
        profession: true,
        is_hidden: true,
        image: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      id: updatedUser.id,
      public_id: updatedUser.public_id,
      email: updatedUser.email,
      name: updatedUser.name,
      profession: updatedUser.profession,
      is_hidden: updatedUser.is_hidden,
      image: updatedUser.image,
      email_verified: updatedUser.email_verified,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };
  }

  /**
   * Update user profile image
   */
  static async updateProfileImage(
    userId: number,
    imageUrl: string
  ): Promise<UserProfile> {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        image: imageUrl,
        updated_at: new Date(),
      },
      select: {
        id: true,
        public_id: true,
        email: true,
        name: true,
        profession: true,
        is_hidden: true,
        image: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      id: updatedUser.id,
      public_id: updatedUser.public_id,
      email: updatedUser.email,
      name: updatedUser.name,
      profession: updatedUser.profession,
      is_hidden: updatedUser.is_hidden,
      image: updatedUser.image,
      email_verified: updatedUser.email_verified,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };
  }

  /**
   * Check if user exists
   */
  static async userExists(userId: number): Promise<boolean> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return !!user;
  }
}
