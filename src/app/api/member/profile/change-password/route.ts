import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { passwordService } from "@/features/auth/services/password.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Validate password strength
    const validation = passwordService.validatePassword(newPassword);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: { message: validation.error } },
        { status: 400 }
      );
    }

    // Change password using service
    const result = await passwordService.changePassword(
      Number(session.user.id),
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: result.error } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to change password" },
      },
      { status: 500 }
    );
  }
}
