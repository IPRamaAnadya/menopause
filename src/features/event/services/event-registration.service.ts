import { prisma } from "@/lib/prisma";
import { EventRegistrationStatus, OrderType, PaymentProvider, OrderStatus, PaymentStatus } from "@/generated/prisma";
import { CreateEventRegistrationDTO, EventRegistration } from "../types";
import { eventRegistrationRepository } from "../repositories/event-registration.repository";
import { orderService } from "@/features/orders/services/order.service";

export class EventRegistrationService {

  /**
   * Validate and prepare event registration
   * Returns price and validation info, but doesn't create registration yet
   */
  static async validateRegistration(data: CreateEventRegistrationDTO): Promise<{
    event: any;
    priceRule: any;
    price: number;
  }> {
    // 1️⃣ Validate event
    const event = await prisma.events.findUnique({
      where: { id: data.event_id },
      include: { 
        prices: true,
        translations: true,
      },
    });

    if (!event) throw new Error("Event not found");
    if (!event.is_public) throw new Error("Event is not public");
    if (event.status !== "PUBLISHED") throw new Error("Event is not available");

    // 2️⃣ Capacity check
    if (event.capacity) {
      const totalRegistrations = await eventRegistrationRepository.countByEventId(data.event_id);
      if (totalRegistrations >= event.capacity) {
        throw new Error("Event is full");
      }
    }

    // 3️⃣ Determine price
    const priceRule = event.prices.find(p =>
      p.membership_level_id === (data.membership_level_id ?? null)
    );

    // If no price rule found or not active, treat as free event (price = 0)
    if (!priceRule) {
      console.log('[EventRegistration] No price rule found, treating as free event');
      return {
        event,
        priceRule: null,
        price: 0,
      };
    }

    if (!priceRule.is_active) {
      throw new Error("Price rule is not active");
    }

    // 4️⃣ Quota check (price level)
    if (priceRule.quota) {
      const quotaUsed = await eventRegistrationRepository.countByEventAndMembershipLevel(
        data.event_id,
        priceRule.membership_level_id
      );
      if (quotaUsed >= priceRule.quota) {
        throw new Error("Quota exceeded");
      }
    }

    // 5️⃣ Check for duplicate registration (member)
    if (data.user_id) {
      const existingRegistration = await eventRegistrationRepository.existsByUserAndEvent(
        data.user_id,
        data.event_id
      );
      
      if (existingRegistration) {
        // If already paid or attended, don't allow re-registration
        if (existingRegistration.status === 'PAID' || existingRegistration.status === 'ATTENDED') {
          throw new Error("Already registered");
        }
        // If pending or cancelled, allow re-registration by deleting old one
        if (existingRegistration.status === 'PENDING' || existingRegistration.status === 'CANCELLED') {
          await prisma.event_registrations.delete({
            where: { id: existingRegistration.id },
          });
        }
      }
    }

    return {
      event,
      priceRule,
      price: Number(priceRule.price),
    };
  }

  /**
   * Create registration only (after payment validation or for free events)
   */
  static async createRegistration(
    data: CreateEventRegistrationDTO & { 
      price: number;
      status: EventRegistrationStatus;
    },
    locale?: string
  ): Promise<EventRegistration> {
    const registration = await eventRegistrationRepository.create({
      event_id: data.event_id,
      user_id: data.user_id,
      membership_level_id: data.membership_level_id,
      price: data.price,
      status: data.status,
      guest: data.guest,
    });

    return this.transformRegistration(registration, locale);
  }

  /**
   * Register user / guest to event with payment flow
   * This creates a registration in PENDING status and returns payment info
   */
  static async registerEvent(
    data: CreateEventRegistrationDTO
  ): Promise<EventRegistration> {
    // Validate first
    const { event, priceRule, price } = await this.validateRegistration(data);

    // Create registration in PENDING status
    const registration = await this.createRegistration({
      ...data,
      price,
      status: EventRegistrationStatus.PENDING,
    });

    return registration;
  }

  /**
   * Get registrations by event
   */
  static async getRegistrationsByEvent(
    event_id: number,
    locale?: string
  ): Promise<EventRegistration[]> {
    const registrations = await eventRegistrationRepository.findByEventId(event_id);
    return registrations.map(reg => this.transformRegistration(reg, locale));
  }

  /**
   * Get registration by ID
   */
  static async getRegistrationById(id: number, locale?: string): Promise<EventRegistration | null> {
    const registration = await eventRegistrationRepository.findById(id);
    return registration ? this.transformRegistration(registration, locale) : null;
  }

  /**
   * Get registration by public ID
   */
  static async getRegistrationByPublicId(publicId: string, locale?: string): Promise<EventRegistration | null> {
    const registration = await eventRegistrationRepository.findByPublicId(publicId);
    return registration ? this.transformRegistration(registration, locale) : null;
  }

  /**
   * Update registration status
   */
  static async updateRegistrationStatus(
    id: number,
    status: EventRegistrationStatus
  ): Promise<void> {
    await eventRegistrationRepository.updateStatus(id, status);
  }

  /**
   * Process event registration payment (called by webhook)
   */
  static async processEventPayment(
    registrationId: number
  ): Promise<void> {
    console.log('[processEventPayment] Processing payment for registration:', registrationId);
    
    const registration = await eventRegistrationRepository.findById(registrationId);
    if (!registration) {
      console.error('[processEventPayment] Registration not found:', registrationId);
      throw new Error('Registration not found');
    }

    // Update status to PAID
    await this.updateRegistrationStatus(registrationId, EventRegistrationStatus.PAID);
    console.log('[processEventPayment] ✓ Registration marked as PAID');

    // Send confirmation email
    try {
      await this.sendRegistrationConfirmationEmail(registration);
      console.log('[processEventPayment] ✓ Confirmation email sent');
    } catch (error) {
      console.error('[processEventPayment] Failed to send confirmation email:', error);
      // Don't throw - payment already processed
    }
  }

  /**
   * Send registration confirmation email
   */
  static async sendRegistrationConfirmationEmail(registration: any): Promise<void> {
    const { emailService } = await import('@/features/email/services/email.service');
    const { EventEmailTemplates } = await import('@/features/email/templates/event-email-templates');

    // Get recipient email
    const recipientEmail = registration.users?.email || registration.guests?.email;
    const recipientName = registration.users?.name || registration.guests?.full_name;

    if (!recipientEmail) {
      console.error('No email found for registration:', registration.id);
      return;
    }

    // Get event translation (prefer English, fallback to first available)
    const translation = registration.events.translations.find((t: any) => t.locale === 'en') 
      || registration.events.translations[0];

    if (!translation) {
      console.error('No translation found for event:', registration.events.id);
      return;
    }

    const template = EventEmailTemplates.registrationConfirmation({
      name: recipientName,
      eventTitle: translation.title,
      eventDate: new Date(registration.events.start_date).toLocaleDateString(),
      eventTime: registration.events.start_time 
        ? new Date(registration.events.start_time).toLocaleTimeString()
        : 'TBA',
      eventLocation: registration.events.is_online 
        ? 'Online' 
        : translation.place_name || 'TBA',
      meetingUrl: registration.events.meeting_url,
    });

    await emailService.sendEmail({
      to: recipientEmail,
      from: process.env.EMAIL_FROM || 'noreply@menopause.hk',
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Transform DB → API
   */
  private static transformRegistration(reg: any, locale?: string): EventRegistration {
    // Get translation by locale, fallback to English, then first available
    let translation = reg.events?.translations?.find((t: any) => t.locale === locale);
    if (!translation) {
      translation = reg.events?.translations?.find((t: any) => t.locale === 'en');
    }
    if (!translation) {
      translation = reg.events?.translations?.[0];
    }
    
    return {
      id: reg.id,
      public_id: reg.public_id,
      event_id: reg.event_id,
      user_id: reg.user_id ?? undefined,
      membership_level_id: reg.membership_level_id ?? undefined,
      price: Number(reg.price),
      status: reg.status,
      registered_at: reg.registered_at.toISOString(),
      // Include related data if available
      event: reg.events ? {
        id: reg.events.id,
        title: translation?.title || null,
        short_description: translation?.short_description || null,
        start_date: reg.events.start_date,
        start_time: reg.events.start_time,
        end_date: reg.events.end_date,
        end_time: reg.events.end_time,
        is_online: reg.events.is_online,
        place_name: translation?.place_name || null,
        place_detail: translation?.place_detail || null,
        meeting_url: reg.events.meeting_url,
        image_url: reg.events.image_url,
      } : undefined,
      user: reg.users ? {
        id: reg.users.id,
        name: reg.users.name,
        email: reg.users.email,
      } : undefined,
      guest: reg.guests ? {
        full_name: reg.guests.full_name,
        email: reg.guests.email,
        phone: reg.guests.phone,
      } : undefined,
      order: reg.order ? {
        id: reg.order.id,
        public_id: reg.order.public_id,
        order_number: reg.order.order_number,
        status: reg.order.status,
        gross_amount: Number(reg.order.gross_amount),
        currency: reg.order.currency,
        paid_at: reg.order.paid_at?.toISOString() || null,
        created_at: reg.order.created_at.toISOString(),
        payment: reg.order.payments?.[0] ? {
          id: reg.order.payments[0].id,
          provider: reg.order.payments[0].provider,
          status: reg.order.payments[0].status,
          amount: Number(reg.order.payments[0].amount),
        } : undefined,
      } : undefined,
    };
  }
}
