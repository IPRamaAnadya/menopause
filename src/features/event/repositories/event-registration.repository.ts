import { prisma } from '@/lib/prisma';
import { EventRegistrationStatus } from '@/generated/prisma';

export class EventRegistrationRepository {
  /**
   * Create a new event registration
   */
  async create(data: {
    event_id: number;
    user_id?: number;
    membership_level_id?: number;
    price: number;
    status: EventRegistrationStatus;
    guest?: {
      full_name: string;
      email: string;
      phone?: string;
    };
  }) {
    return prisma.event_registrations.create({
      data: {
        event_id: data.event_id,
        user_id: data.user_id,
        membership_level_id: data.membership_level_id,
        price: data.price,
        status: data.status,
        ...(data.guest && {
          guests: {
            create: {
              full_name: data.guest.full_name,
              email: data.guest.email,
              phone: data.guest.phone,
            },
          },
        }),
      },
      include: {
        guests: true,
        events: {
          include: {
            translations: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find registration by ID
   */
  async findById(id: number) {
    return prisma.event_registrations.findUnique({
      where: { id },
      include: {
        guests: true,
        events: {
          include: {
            translations: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find registration by public ID
   */
  async findByPublicId(publicId: string) {
    const registration = await prisma.event_registrations.findUnique({
      where: { public_id: publicId },
      include: {
        guests: true,
        events: {
          include: {
            translations: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!registration) return null;

    // Find related order if exists (for paid events with authenticated users)
    let order = null;
    if (registration.user_id) {
      order = await prisma.orders.findFirst({
        where: {
          user_id: registration.user_id,
          type: 'EVENT',
          metadata: {
            path: ['registration_id'],
            equals: registration.id,
          },
        },
        include: {
          payments: true,
        },
      });
    }

    return {
      ...registration,
      order,
    };
  }

  /**
   * Update registration status
   */
  async updateStatus(id: number, status: EventRegistrationStatus) {
    return prisma.event_registrations.update({
      where: { id },
      data: { 
        status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get registrations by event
   */
  async findByEventId(eventId: number) {
    return prisma.event_registrations.findMany({
      where: { event_id: eventId },
      include: {
        guests: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { registered_at: 'desc' },
    });
  }

  /**
   * Get registrations by user
   */
  async findByUserId(userId: number) {
    return prisma.event_registrations.findMany({
      where: { user_id: userId },
      include: {
        events: {
          include: {
            translations: true,
          },
        },
      },
      orderBy: { registered_at: 'desc' },
    });
  }

  /**
   * Check if user already registered for event and return registration
   */
  async existsByUserAndEvent(userId: number, eventId: number) {
    const registration = await prisma.event_registrations.findFirst({
      where: {
        user_id: userId,
        event_id: eventId,
      },
      orderBy: {
        registered_at: 'desc',
      },
    });
    return registration;
  }

  /**
   * Count registrations by event
   */
  async countByEventId(eventId: number) {
    return prisma.event_registrations.count({
      where: { event_id: eventId },
    });
  }

  /**
   * Count registrations by event and membership level
   */
  async countByEventAndMembershipLevel(
    eventId: number,
    membershipLevelId: number | null
  ) {
    return prisma.event_registrations.count({
      where: {
        event_id: eventId,
        membership_level_id: membershipLevelId,
      },
    });
  }
}

export const eventRegistrationRepository = new EventRegistrationRepository();
