import { prisma } from '@/lib/prisma';
import { Service, CreateServiceDTO, UpdateServiceDTO, ServiceFilters, ServiceTranslation } from '../types';
import { LocalImageService } from '@/features/image/image.service';

export class ServicesService {
  /**
   * Get all services with optional filtering and translations
   */
  static async getServices(filters: ServiceFilters = {}): Promise<Service[]> {
    const { activeOnly = false, locale } = filters;

    const where = activeOnly ? { is_active: true } : {};

    const services = await prisma.services.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        service_translations: true,
      },
    });

    return services.map(service => this.transformService(service, locale));
  }

  /**
   * Get a single service by ID with translations
   */
  static async getServiceById(id: number, locale?: string): Promise<Service | null> {
    const service = await prisma.services.findUnique({
      where: { id },
      include: {
        service_translations: true,
      },
    });

    return service ? this.transformService(service, locale) : null;
  }

  /**
   * Create a new service with translations
   */
  static async createService(data: any): Promise<Service> {
    let imageUrl = null;
    if (data.image && typeof data.image === 'object' && 'arrayBuffer' in data.image) {
      const buffer = Buffer.from(await data.image.arrayBuffer());
      const filename = `${Date.now()}_${data.image.name}`;
      const imageService = new LocalImageService();
      imageUrl = await imageService.upload(buffer, filename);
    }
    const service = await prisma.services.create({
      data: {
        image_url: imageUrl,
        is_active: data.is_active ?? true,
        order: data.order ?? 0,
        service_translations: {
          create: data.translations.map((t: any) => ({
            locale: t.locale,
            title: t.title,
            description: t.description,
          })),
        },
      },
      include: {
        service_translations: true,
      },
    });

    return this.transformService(service);
  }

  /**
   * Update a service with translations
   */
  static async updateService(id: number, data: any): Promise<Service> {
    // If translations are provided, delete existing and create new ones
    if (data.translations) {
      await prisma.service_translations.deleteMany({ where: { service_id: id } });
    }
    let imageUrl = undefined;
    if (data.image && typeof data.image === 'object' && 'arrayBuffer' in data.image) {
      // Get old image filename
      const oldService = await prisma.services.findUnique({ where: { id } });
      if (oldService?.image_url) {
        const oldFilename = oldService.image_url.split('/').pop();
        const imageService = new LocalImageService();
        await imageService.delete(oldFilename!);
      }
      // Save new image
      const buffer = Buffer.from(await data.image.arrayBuffer());
      const filename = `${Date.now()}_${data.image.name}`;
      const imageService = new LocalImageService();
      imageUrl = await imageService.upload(buffer, filename);
    }
    const service = await prisma.services.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.translations && {
          service_translations: {
            create: data.translations.map((t: any) => ({
              locale: t.locale,
              title: t.title,
              description: t.description,
            })),
          },
        }),
      },
      include: { service_translations: true },
    });
    return this.transformService(service);
  }

  /**
   * Delete a service (translations will be cascade deleted)
   */
  static async deleteService(id: number): Promise<void> {
    await prisma.services.delete({
      where: { id },
    });
  }

  /**
   * Bulk update service order
   */
  static async bulkUpdateOrder(services: { id: number; order: number }[]): Promise<void> {
    // Use transaction to update all orders atomically
    await prisma.$transaction(
      services.map(service =>
        prisma.services.update({
          where: { id: service.id },
          data: { order: service.order },
        })
      )
    );
  }

  /**
   * Transform database service to application service
   * If locale is provided, use translation for that locale, fallback to first available translation
   */
  private static transformService(service: any, locale?: string): Service {
    let title = '';
    let description = '';

    console.log('Transforming service with locale:', locale);

    // Get title and description from translations
    if (service.service_translations?.length > 0) {
      // Try to find translation for requested locale
      let translation = service.service_translations.find((t: any) => t.locale === locale);
      // Fallback to first translation if locale not found
      if (!translation) {
        translation = service.service_translations[0];
      }
      if (translation) {
        title = translation.title;
        description = translation.description;
      }
    }

    return {
      id: service.id,
      title,
      description,
      image_url: service.image_url,
      is_active: service.is_active,
      order: service.order,
      created_at: service.created_at.toISOString(),
      updated_at: service.updated_at.toISOString(),
      translations: service.service_translations?.map((t: any) => ({
        id: t.id,
        service_id: t.service_id,
        locale: t.locale,
        title: t.title,
        description: t.description,
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
      })) || [],
    };
  }
}
