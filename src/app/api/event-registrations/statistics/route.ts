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
    const eventId = searchParams.get("eventId");

    // Build where clause for registrations
    const where: any = {};
    if (eventId) {
      where.event_id = parseInt(eventId);
    }

    // Get statistics
    const [
      totalRegistrations,
      paidRegistrations,
      pendingRegistrations,
      cancelledRegistrations,
      attendedRegistrations,
      totalRevenue,
      registrationsByEvent,
    ] = await Promise.all([
      // Total registrations
      prisma.event_registrations.count({ where }),
      
      // Paid registrations
      prisma.event_registrations.count({
        where: { ...where, status: "PAID" },
      }),
      
      // Pending registrations
      prisma.event_registrations.count({
        where: { ...where, status: "PENDING" },
      }),
      
      // Cancelled registrations
      prisma.event_registrations.count({
        where: { ...where, status: "CANCELLED" },
      }),
      
      // Attended registrations
      prisma.event_registrations.count({
        where: { ...where, status: "ATTENDED" },
      }),
      
      // Total revenue (only from PAID and ATTENDED registrations)
      prisma.event_registrations.aggregate({
        where: {
          ...where,
          status: { in: ["PAID", "ATTENDED"] },
        },
        _sum: {
          price: true,
        },
      }),
      
      // Registrations grouped by event (top 5)
      eventId ? null : prisma.event_registrations.groupBy({
        by: ["event_id"],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 5,
      }),
    ]);

    // Get event details for top events
    let topEvents: Array<{ event_id: number; event_title: string; count: number }> = [];
    if (registrationsByEvent && registrationsByEvent.length > 0) {
      const eventIds = registrationsByEvent.map((r) => r.event_id);
      const events = await prisma.events.findMany({
        where: { id: { in: eventIds } },
        include: {
          translations: {
            where: { locale: "en" },
          },
        },
      });

      topEvents = registrationsByEvent.map((r) => {
        const event = events.find((e) => e.id === r.event_id);
        return {
          event_id: r.event_id,
          event_title: event?.translations?.[0]?.title || "Untitled",
          count: r._count.id,
        };
      });
    }

    // Get recent registrations
    const recentRegistrations = await prisma.event_registrations.findMany({
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
      },
      orderBy: { registered_at: "desc" },
      take: 10,
    });

    return NextResponse.json({
      statistics: {
        total: totalRegistrations,
        paid: paidRegistrations,
        pending: pendingRegistrations,
        cancelled: cancelledRegistrations,
        attended: attendedRegistrations,
        revenue: Number(totalRevenue._sum.price || 0),
      },
      topEvents,
      recentRegistrations,
    });
  } catch (error) {
    console.error("Error fetching event registration statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
