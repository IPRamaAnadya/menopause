import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Simple check - in production you should check actual user permissions
    // For now, we trust that only authenticated users can access this

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (eventId) {
      where.event_id = parseInt(eventId);
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          users: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          users: {
            email: { contains: search, mode: "insensitive" },
          },
        },
        {
          guests: {
            full_name: { contains: search, mode: "insensitive" },
          },
        },
        {
          guests: {
            email: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    // Get registrations with pagination
    const [registrations, total] = await Promise.all([
      prisma.event_registrations.findMany({
        where,
        include: {
          events: {
            include: {
              translations: {
                where: { locale: "en" },
              },
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          guests: true,
          membership_levels: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
        orderBy: { registered_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.event_registrations.count({ where }),
    ]);

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch event registrations" },
      { status: 500 }
    );
  }
}
