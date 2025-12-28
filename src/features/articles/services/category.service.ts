import { prisma } from '@/lib/prisma';
import { Category, CreateCategoryDTO, UpdateCategoryDTO, CategoryFilters } from '../types';

export class CategoryService {
  /**
   * Get all categories with optional filtering and translations
   */
  static async getCategories(filters: CategoryFilters = {}): Promise<Category[]> {
    const { activeOnly = false, parentId, locale } = filters;
    
    const where: any = {};
    if (activeOnly) where.is_active = true;
    if (parentId !== undefined) where.parent_id = parentId;

    const categories = await prisma.categories.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        category_translations: true,
        children: {
          include: {
            category_translations: true,
          },
        },
      },
    });

    return categories.map(category => this.transformCategory(category, locale));
  }

  /**
   * Get a single category by ID with translations
   */
  static async getCategoryById(id: number, locale?: string): Promise<Category | null> {
    const category = await prisma.categories.findUnique({
      where: { id },
      include: {
        category_translations: true,
        children: {
          include: {
            category_translations: true,
          },
        },
        parent: {
          include: {
            category_translations: true,
          },
        },
      },
    });

    return category ? this.transformCategory(category, locale) : null;
  }

  /**
   * Get a category by slug
   */
  static async getCategoryBySlug(slug: string, locale?: string): Promise<Category | null> {
    const category = await prisma.categories.findUnique({
      where: { slug },
      include: {
        category_translations: true,
        children: {
          include: {
            category_translations: true,
          },
        },
      },
    });

    return category ? this.transformCategory(category, locale) : null;
  }

  /**
   * Create a new category with translations
   */
  static async createCategory(data: CreateCategoryDTO): Promise<Category> {
    const category = await prisma.categories.create({
      data: {
        parent_id: data.parent_id,
        slug: data.slug,
        order: data.order ?? 0,
        is_active: data.is_active ?? true,
        category_translations: {
          create: data.translations.map(t => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
          })),
        },
      },
      include: {
        category_translations: true,
      },
    });

    return this.transformCategory(category);
  }

  /**
   * Update a category with translations
   */
  static async updateCategory(id: number, data: UpdateCategoryDTO): Promise<Category> {
    // Delete existing translations if new ones are provided
    if (data.translations) {
      await prisma.category_translations.deleteMany({
        where: { category_id: id },
      });
    }

    const category = await prisma.categories.update({
      where: { id },
      data: {
        ...(data.parent_id !== undefined && { parent_id: data.parent_id }),
        ...(data.slug && { slug: data.slug }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.translations && {
          category_translations: {
            create: data.translations.map(t => ({
              locale: t.locale,
              name: t.name,
              description: t.description,
            })),
          },
        }),
      },
      include: {
        category_translations: true,
      },
    });

    return this.transformCategory(category);
  }

  /**
   * Delete a category (translations and children will be cascade deleted)
   */
  static async deleteCategory(id: number): Promise<void> {
    await prisma.categories.delete({ where: { id } });
  }

  /**
   * Bulk update category order
   */
  static async bulkUpdateOrder(categories: { id: number; order: number }[]): Promise<void> {
    await prisma.$transaction(
      categories.map(category =>
        prisma.categories.update({
          where: { id: category.id },
          data: { order: category.order },
        })
      )
    );
  }

  /**
   * Transform database category to application category
   */
  private static transformCategory(category: any, locale?: string): Category {
    let name = '';
    let description: string | undefined;

    if (category.category_translations?.length > 0) {
      let translation = category.category_translations.find((t: any) => t.locale === locale);
      if (!translation) translation = category.category_translations[0];
      if (translation) {
        name = translation.name;
        description = translation.description;
      }
    }

    return {
      id: category.id,
      parent_id: category.parent_id,
      name,
      slug: category.slug,
      description,
      order: category.order,
      is_active: category.is_active,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
      translations: category.category_translations?.map((t: any) => ({
        id: t.id,
        category_id: t.category_id,
        locale: t.locale,
        name: t.name,
        description: t.description,
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
      })) || [],
      children: category.children?.map((c: any) => this.transformCategory(c, locale)),
      parent: category.parent ? this.transformCategory(category.parent, locale) : undefined,
    };
  }
}
