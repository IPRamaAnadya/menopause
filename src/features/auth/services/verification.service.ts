import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/features/email/services/email.service";

export class VerificationService {
  /**
   * Generate and send email verification token
   */
  async sendVerificationEmail(userId: number, email: string, locale: string = 'en') {
    try {
      // Delete any existing unused verification tokens for this user
      await prisma.email_verification_tokens.deleteMany({
        where: {
          user_id: userId,
          type: 'EMAIL_VERIFICATION',
          used_at: null,
        },
      });

      // Create new verification token (expires in 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const verificationToken = await prisma.email_verification_tokens.create({
        data: {
          user_id: userId,
          type: 'EMAIL_VERIFICATION',
          expires_at: expiresAt,
        },
      });

      // Generate verification URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/${locale}/auth/verify-email?token=${verificationToken.token}`;

      // Send email
      await sendVerificationEmail(email, verificationUrl, locale);

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    try {
      // Find the token
      const verificationToken = await prisma.email_verification_tokens.findUnique({
        where: { token },
        include: { users: true },
      });

      if (!verificationToken) {
        return {
          success: false,
          error: 'Invalid verification token',
        };
      }

      // Check if already used
      if (verificationToken.used_at) {
        return {
          success: false,
          error: 'Verification token has already been used',
        };
      }

      // Check if expired
      if (new Date() > verificationToken.expires_at) {
        return {
          success: false,
          error: 'Verification token has expired',
        };
      }

      // Mark token as used
      await prisma.email_verification_tokens.update({
        where: { id: verificationToken.id },
        data: { used_at: new Date() },
      });

      // Update user's email_verified field
      await prisma.users.update({
        where: { id: verificationToken.user_id },
        data: { email_verified: new Date() },
      });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw new Error('Failed to verify email');
    }
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: number): Promise<boolean> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email_verified: true },
    });

    return user?.email_verified !== null;
  }
}

export const verificationService = new VerificationService();
