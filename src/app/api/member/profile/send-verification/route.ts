import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verificationService } from "@/features/auth/services/verification.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    if (!session.user.email) {
      return NextResponse.json(
        { success: false, error: { message: "Email not found" } },
        { status: 400 }
      );
    }

    // Get locale from request or default to 'en'
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'en';

    // Send verification email
    const result = await verificationService.sendVerificationEmail(
      Number(session.user.id),
      session.user.email,
      locale
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to send verification email" },
      },
      { status: 500 }
    );
  }
}
