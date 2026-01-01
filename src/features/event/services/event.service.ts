import { prisma } from '@/lib/prisma'
import {
  Event,
  EventWithTranslations,
  CreateEventDTO,
  UpdateEventDTO,
  EventFilters,
  EventCardData,
  PaginatedResult,
} from '../types'
import { EventStatus } from '@/generated/prisma'
import { ImageServiceFactory } from '@/features/image/image.service'

export class EventService {

  /**
   * Get events optimized for list/card display with pagination
   * Only returns fields needed for cards, with backend translation
   */
  static async getEventsForList(filters: EventFilters = {}): Promise<PaginatedResult<EventCardData>> {
    const { 
      status, 
      is_public, 
      upcomingOnly, 
      locale = 'en', 
      page = 1, 
      pageSize = 10,
      timeFilter = 'upcoming',
      locationFilter = 'all',
      visibilityFilter = 'all',
      paymentFilter = 'all',
      highlighted,
      limit,
    } = filters

    const today = new Date().toISOString().split('T')[0]

    const where: any = {
      ...(status && { status }),
      ...(is_public !== undefined && { is_public }),
      ...(upcomingOnly && {
        start_date: { gte: today },
      }),
      ...(highlighted !== undefined && { is_highlighted: highlighted }),
    }

    // Time-based filters
    if (timeFilter === 'upcoming') {
      where.start_date = { gt: today }
    } else if (timeFilter === 'ongoing') {
      where.AND = [
        { start_date: { lte: today } },
        { end_date: { gte: today } },
      ]
    } else if (timeFilter === 'passed') {
      where.end_date = { lt: today }
    }

    // Location filter
    if (locationFilter === 'online') {
      where.is_online = true
    } else if (locationFilter === 'offline') {
      where.is_online = false
    }

    // Visibility filter
    if (visibilityFilter === 'public') {
      where.is_public = true
    } else if (visibilityFilter === 'private') {
      where.is_public = false
    }

    // Payment filter
    if (paymentFilter === 'paid') {
      where.is_paid = true
    } else if (paymentFilter === 'free') {
      where.is_paid = false
    }

    // Get total count for pagination
    const total = await prisma.events.count({ where })

    const effectivePageSize = limit || pageSize;
    const effectivePage = limit ? 1 : page;

    // Get paginated events with minimal data
    const events = await prisma.events.findMany({
      where,
      orderBy: { start_date: 'asc' },
      skip: (effectivePage - 1) * effectivePageSize,
      take: effectivePageSize,
      select: {
        id: true,
        slug: true,
        image_url: true,
        start_date: true,
        end_date: true,
        start_time: true,
        end_time: true,
        is_online: true,
        is_paid: true,
        capacity: true,
        status: true,
        is_public: true,
        is_highlighted: true,
        translations: {
          where: {
            locale: locale,
          },
          select: {
            title: true,
            short_description: true,
            place_name: true,
          },
        },
        prices: {
          where: {
            is_active: true,
          },
          select: {
            price: true,
            membership_level_id: true,
          },
        },
      },
    })

    // Transform to EventCardData with fallback to first available translation
    const cardData: EventCardData[] = await Promise.all(
      events.map(async (event) => {
        let translation = event.translations[0]
        
        // If no translation for requested locale, get first available
        if (!translation) {
          const fallbackTranslation = await prisma.event_translations.findFirst({
            where: { event_id: event.id },
            select: {
              title: true,
              short_description: true,
              place_name: true,
            },
          })
          translation = fallbackTranslation || { title: 'Untitled', short_description: '', place_name: null }
        }

        // Calculate price range and check for member pricing
        let price_range: { min: number; max: number } | undefined;
        let has_member_price = false;

        if (event.prices && event.prices.length > 0) {
          const prices = event.prices.map(p => Number(p.price));
          price_range = {
            min: Math.min(...prices),
            max: Math.max(...prices),
          };
          has_member_price = event.prices.some(p => p.membership_level_id !== null);
        }

        return {
          id: event.id,
          slug: event.slug,
          image_url: event.image_url || undefined,
          start_date: event.start_date,
          end_date: event.end_date,
          start_time: event.start_time,
          end_time: event.end_time,
          is_online: event.is_online,
          is_paid: event.is_paid,
          capacity: event.capacity || 0,
          status: event.status,
          is_public: event.is_public,
          is_highlighted: event.is_highlighted,
          title: translation.title || 'Untitled',
          short_description: translation.short_description || '',
          place_name: translation.place_name || undefined,
          price_range,
          has_member_price,
        }
      })
    )

    return {
      data: cardData,
      pagination: {
        page: effectivePage,
        pageSize: effectivePageSize,
        total,
        totalPages: Math.ceil(total / effectivePageSize),
      },
    }
  }

  /**
   * Get first upcoming published public event for main site
   * Only returns events that haven't started yet (not ongoing)
   */
  static async getFirstUpcomingEvent(locale: string = 'en'): Promise<EventCardData | null> {
    const today = new Date().toISOString().split('T')[0]

    const event = await prisma.events.findFirst({
      where: {
        status: EventStatus.PUBLISHED,
        is_public: true,
        start_date: { gt: today },
      },
      orderBy: { start_date: 'asc' },
      select: {
        id: true,
        slug: true,
        image_url: true,
        start_date: true,
        end_date: true,
        start_time: true,
        end_time: true,
        is_online: true,
        is_paid: true,
        capacity: true,
        status: true,
        is_public: true,
        is_highlighted: true,
        translations: {
          where: {
            locale: locale,
          },
          select: {
            title: true,
            short_description: true,
            place_name: true,
          },
        },
        prices: {
          where: {
            is_active: true,
          },
          select: {
            price: true,
            membership_level_id: true,
          },
        },
      },
    })

    if (!event) {
      return null
    }

    let translation = event.translations[0]
    
    // If no translation for requested locale, get first available
    if (!translation) {
      const fallbackTranslation = await prisma.event_translations.findFirst({
        where: { event_id: event.id },
        select: {
          title: true,
          short_description: true,
          place_name: true,
        },
      })
      translation = fallbackTranslation || { title: 'Untitled', short_description: '', place_name: null }
    }

    // Calculate price range and check for member pricing
    let price_range: { min: number; max: number } | undefined;
    let has_member_price = false;

    if (event.prices && event.prices.length > 0) {
      const prices = event.prices.map(p => Number(p.price));
      price_range = {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };
      has_member_price = event.prices.some(p => p.membership_level_id !== null);
    }

    return {
      id: event.id,
      slug: event.slug,
      image_url: event.image_url || undefined,
      start_date: event.start_date,
      end_date: event.end_date,
      start_time: event.start_time,
      end_time: event.end_time,
      is_online: event.is_online,
      is_paid: event.is_paid,
      capacity: event.capacity || 0,
      status: event.status,
      is_public: event.is_public,
      title: translation.title || 'Untitled',
      short_description: translation.short_description || '',
      place_name: translation.place_name || undefined,
      price_range,
      has_member_price,
      is_highlighted: event.is_highlighted,
    }
  }

  /**
   * Get all events with optional filters & translations
   */
  static async getEvents(filters: EventFilters = {}): Promise<EventWithTranslations[]> {
    const { status, is_public, upcomingOnly, locale } = filters

    const where: any = {
      ...(status && { status }),
      ...(is_public !== undefined && { is_public }),
      ...(upcomingOnly && {
        start_date: { gte: new Date() },
      }),
    }

    const events = await prisma.events.findMany({
      where,
      orderBy: { start_date: 'asc' },
      include: {
        translations: true,
        prices: true,
        creator: {
          select: { name: true, email: true },
        },
      },
    })

    return events.map(event => this.transformEvent(event, locale))
  }

  /**
   * Get single event by ID
   */
  static async getEventById(id: number, locale?: string): Promise<EventWithTranslations | null> {
    const event = await prisma.events.findUnique({
      where: { id },
      include: {
        translations: true,
        prices: true,
        creator: {
          select: { name: true, email: true },
        },
      },
    })

    return event ? this.transformEvent(event, locale) : null
  }

  /**
   * Get event by slug (public)
   */
  static async getEventBySlug(slug: string, locale?: string): Promise<EventWithTranslations | null> {
    const event = await prisma.events.findUnique({
      where: { slug },
      include: {
        translations: true,
        prices: true,
        creator: {
          select: { name: true, email: true },
        },
      },
    })

    return event ? this.transformEvent(event, locale) : null
  }

  /**
   * Create new event with translations & prices
   */
  static async createEvent(data: CreateEventDTO): Promise<EventWithTranslations> {
    // Handle image upload if provided
    let imageUrl = null;
    if (data.image && typeof data.image === 'object' && 'arrayBuffer' in data.image) {
      const buffer = Buffer.from(await data.image.arrayBuffer());
      const filename = `${Date.now()}_${data.image.name}`;
      const imageService = ImageServiceFactory.getService();
      imageUrl = await imageService.upload(buffer, filename);
    }

    const event = await prisma.events.create({
      data: {
        slug: data.slug,
        image_url: imageUrl || data.image_url,
        start_date: typeof data.start_date === 'string' ? data.start_date : data.start_date.toISOString(),
        end_date: typeof data.end_date === 'string' ? data.end_date : data.end_date.toISOString(),
        start_time: data.start_time || undefined,
        end_time: data.end_time || undefined,
        is_online: data.is_online,
        meeting_url: data.meeting_url,
        latitude: data.latitude,
        longitude: data.longitude,
        is_paid: data.is_paid,
        capacity: data.capacity,
        is_public: data.is_public ?? true,
        is_highlighted: data.is_highlighted ?? false,
        status: data.status ?? EventStatus.DRAFT,
        created_by: data.created_by,

        translations: {
          create: data.translations.map(t => ({
            locale: t.locale,
            title: t.title,
            short_description: t.short_description,
            description: t.description,
            place_name: t.place_name,
            place_detail: t.place_details,
          })),
        },

        ...(data.prices && {
          prices: {
            create: data.prices.map(p => ({
              membership_level_id: p.membership_level_id,
              price: p.price,
              quota: p.quota,
              is_active: p.is_active,
            })),
          },
        }),
      },
      include: {
        translations: true,
        prices: true,
        creator: {
          select: { name: true, email: true },
        },
      },
    })

    return this.transformEvent(event)
  }

  /**
   * Update event (replace translations & prices if provided)
   */
  static async updateEvent(id: number, data: UpdateEventDTO): Promise<EventWithTranslations> {
    // Handle image upload if provided
    let imageUrl = undefined;
    if (data.image && typeof data.image === 'object' && 'arrayBuffer' in data.image) {
      const buffer = Buffer.from(await data.image.arrayBuffer());
      const filename = `${Date.now()}_${data.image.name}`;
      const imageService = ImageServiceFactory.getService();
      imageUrl = await imageService.upload(buffer, filename);
    }

    if (data.translations) {
      await prisma.event_translations.deleteMany({
        where: { event_id: id },
      })
    }

    if (data.prices) {
      await prisma.event_prices.deleteMany({
        where: { event_id: id },
      })
    }

    const event = await prisma.events.update({
      where: { id },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(imageUrl !== undefined && { image_url: imageUrl }),
        ...(data.image_url !== undefined && !imageUrl && { image_url: data.image_url }),
        ...(data.start_date && { start_date: typeof data.start_date === 'string' ? data.start_date : data.start_date.toISOString() }),
        ...(data.end_date && { end_date: typeof data.end_date === 'string' ? data.end_date : data.end_date.toISOString() }),
        ...(data.start_time && { start_time: data.start_time }),
        ...(data.end_time && { end_time: data.end_time }),
        ...(data.is_online !== undefined && { is_online: data.is_online }),
        ...(data.meeting_url !== undefined && { meeting_url: data.meeting_url }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.is_paid !== undefined && { is_paid: data.is_paid }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.is_public !== undefined && { is_public: data.is_public }),
        ...(data.is_highlighted !== undefined && { is_highlighted: data.is_highlighted }),
        ...(data.status && { status: data.status }),

        ...(data.translations && {
          translations: {
            create: data.translations.map(t => ({
              locale: t.locale,
              title: t.title,
              short_description: t.short_description,
              description: t.description,
              place_name: t.place_name,
              place_detail: t.place_details,
            })),
          },
        }),

        ...(data.prices && {
          prices: {
            create: data.prices.map(p => ({
              membership_level_id: p.membership_level_id,
              price: p.price,
              quota: p.quota,
              is_active: p.is_active,
            })),
          },
        }),
      },
      include: {
        translations: true,
        prices: true,
        creator: {
          select: { name: true, email: true },
        },
      },
    })

    return this.transformEvent(event)
  }

  /**
   * Delete event (cascade delete translations, prices, registrations)
   */
  static async deleteEvent(id: number): Promise<void> {
    await prisma.events.delete({ where: { id } })
  }

  /**
   * Transform DB event → API EventWithTranslations
   */
  private static transformEvent(event: any, locale?: string): EventWithTranslations {
    let selectedTranslation = null

    if (event.translations?.length > 0) {
      selectedTranslation =
        event.translations.find((t: any) => t.locale === locale) ||
        event.translations[0]
    }

    return {
      id: event.id,
      slug: event.slug,
      image_url: event.image_url,
      start_date: event.start_date,
      end_date: event.end_date,
      start_time: event.start_time ?? null,
      end_time: event.end_time ?? null,
      is_online: event.is_online,
      meeting_url: event.meeting_url,
      latitude: event.latitude ? Number(event.latitude) : undefined,
      longitude: event.longitude ? Number(event.longitude) : undefined,
      is_paid: event.is_paid,
      capacity: event.capacity,
      is_public: event.is_public,
      is_highlighted: event.is_highlighted,
      status: event.status,

      translations: event.translations.map((t: any) => ({
        locale: t.locale,
        title: t.title,
        short_description: t.short_description,
        description: t.description,
        place_name: t.place_name,
        place_details: t.place_detail,
      })),

      // Convenience properties from selected translation
      title: selectedTranslation?.title,
      short_description: selectedTranslation?.short_description,
      description: selectedTranslation?.description,
      place_name: selectedTranslation?.place_name,
      place_details: selectedTranslation?.place_detail,

      prices: event.prices?.map((p: any) => ({
        membership_level_id: p.membership_level_id,
        price: Number(p.price),
        quota: p.quota,
        is_active: p.is_active,
      })),

      creator: {
        name: event.creator.name,
        email: event.creator.email,
      },
    }
  }
}
