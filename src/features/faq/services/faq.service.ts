import { prisma } from '@/lib/prisma';
import { FAQ, CreateFAQDTO, UpdateFAQDTO, FAQFilters } from '../types';

export class FAQService {
  /**
   * Get all FAQs with optional filtering and translations
   */
  static async getFAQs(filters: FAQFilters = {}): Promise<FAQ[]> {
    const { activeOnly = false, locale } = filters;
    const where = activeOnly ? { is_active: true } : {};
    const faqs = await prisma.faqs.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { faq_translations: true },
    });
    return faqs.map(faq => this.transformFAQ(faq, locale));
  }

  /**
   * Get a single FAQ by ID with translations
   */
  static async getFAQById(id: number, locale?: string): Promise<FAQ | null> {
    const faq = await prisma.faqs.findUnique({
      where: { id },
      include: { faq_translations: true },
    });
    return faq ? this.transformFAQ(faq, locale) : null;
  }

  /**
   * Create a new FAQ with translations
   */
  static async createFAQ(data: CreateFAQDTO): Promise<FAQ> {
    const faq = await prisma.faqs.create({
      data: {
        is_active: data.is_active ?? true,
        order: data.order ?? 0,
        faq_translations: {
          create: data.translations.map(t => ({
            locale: t.locale,
            question: t.question,
            answer: t.answer,
          })),
        },
      },
      include: { faq_translations: true },
    });
    return this.transformFAQ(faq);
  }

  /**
   * Update a FAQ with translations
   */
  static async updateFAQ(id: number, data: UpdateFAQDTO): Promise<FAQ> {
    // Delete existing translations if new ones are provided
    if (data.translations) {
      await prisma.faq_translations.deleteMany({
        where: { faq_id: id },
      });
    }
    
    const faq = await prisma.faqs.update({
      where: { id },
      data: {
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.translations && {
          faq_translations: {
            create: data.translations.map(t => ({
              locale: t.locale,
              question: t.question,
              answer: t.answer,
            })),
          },
        }),
      },
      include: { faq_translations: true },
    });
    return this.transformFAQ(faq);
  }

  /**
   * Delete a FAQ (translations will be cascade deleted)
   */
  static async deleteFAQ(id: number): Promise<void> {
    await prisma.faqs.delete({ where: { id } });
  }

  /**
   * Bulk update FAQ order
   */
  static async bulkUpdateOrder(faqs: { id: number; order: number }[]): Promise<void> {
    await prisma.$transaction(
      faqs.map(faq =>
        prisma.faqs.update({
          where: { id: faq.id },
          data: { order: faq.order },
        })
      )
    );
  }

  /**
   * Transform database FAQ to application FAQ
   * If locale is provided, use translation for that locale, fallback to first available translation
   */
  private static transformFAQ(faq: any, locale?: string): FAQ {
    let question = '';
    let answer = '';
    if (faq.faq_translations?.length > 0) {
      let translation = faq.faq_translations.find((t: any) => t.locale === locale);
      if (!translation) translation = faq.faq_translations[0];
      if (translation) {
        question = translation.question;
        answer = translation.answer;
      }
    }
    return {
      id: faq.id,
      question,
      answer,
      is_active: faq.is_active,
      order: faq.order,
      created_at: faq.created_at.toISOString(),
      updated_at: faq.updated_at.toISOString(),
      translations: faq.faq_translations?.map((t: any) => ({
        id: t.id,
        faq_id: t.faq_id,
        locale: t.locale,
        question: t.question,
        answer: t.answer,
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
      })) || [],
    };
  }
}
