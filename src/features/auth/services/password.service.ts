import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export class PasswordService {
  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      // Get user from database
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
      });

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      if (!user.password) {
        return {
          success: false,
          error: "Cannot change password for OAuth accounts",
        };
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: "Current password is incorrect",
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.users.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error("Failed to change password");
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password) {
      return { valid: false, error: "Password is required" };
    }

    if (password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters" };
    }

    // Add more validation rules as needed
    // e.g., require uppercase, lowercase, numbers, special characters

    return { valid: true };
  }

  /**
   * Reset password (for forgot password flow)
   */
  async resetPassword(userId: number, newPassword: string) {
    try {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset flag
      await prisma.users.update({
        where: { id: userId },
        data: { 
          password: hashedPassword,
          is_reset_password: false,
        },
      });

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      console.error("Error resetting password:", error);
      throw new Error("Failed to reset password");
    }
  }
}

export const passwordService = new PasswordService();
