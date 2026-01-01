import { prisma } from '@/lib/prisma';
import { Article, CreateArticleDTO, UpdateArticleDTO, ArticleFilters } from '../types';
import { ImageServiceFactory } from '@/features/image/image.service';

export class ArticleService {
  /**
   * Get all articles with optional filtering, pagination and translations
   */
  static async getArticles(filters: ArticleFilters = {}): Promise<{ articles: Article[], total: number, page: number, limit: number }> {
    const { publishedOnly = false, highlightedOnly = false, categoryId, visibility, authorId, locale, search, page = 1, limit = 10 } = filters;
    
    const where: any = {};
    if (publishedOnly) {
      where.is_published = true;
      where.published_at = { lte: new Date() };
    }
    if (highlightedOnly) {
      where.is_highlighted = true;
    }
    if (categoryId) where.category_id = categoryId;
    if (visibility) where.visibility = visibility;
    if (authorId) where.author_id = authorId;

    // Search in translations if search term provided
    if (search && locale) {
      where.article_translations = {
        some: {
          locale,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    // Get total count
    const total = await prisma.articles.count({ where });

    // Get paginated articles with minimal data
    const articles = await prisma.articles.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        slug: true,
        image_url: true,
        visibility: true,
        required_priority: true,
        is_published: true,
        is_highlighted: true,
        published_at: true,
        created_at: true,
        category_id: true,
        article_translations: {
          select: {
            locale: true,
            title: true,
            excerpt: true,
          },
        },
        categories: {
          select: {
            id: true,
            slug: true,
            category_translations: {
              select: {
                locale: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      articles: articles.map(article => this.transformArticleList(article, locale)),
      total,
      page,
      limit,
    };
  }

  /**
   * Transform article for list view (minimal data)
   */
  private static transformArticleList(article: any, locale?: string): Article {
    let title = '';
    let excerpt: string | undefined;

    if (article.article_translations?.length > 0) {
      let translation = article.article_translations.find((t: any) => t.locale === locale);
      if (!translation) translation = article.article_translations[0];
      if (translation) {
        title = translation.title;
        excerpt = translation.excerpt;
      }
    }

    let categoryName = '';
    if (article.categories?.category_translations?.length > 0) {
      let catTranslation = article.categories.category_translations.find((t: any) => t.locale === locale);
      if (!catTranslation) catTranslation = article.categories.category_translations[0];
      if (catTranslation) {
        categoryName = catTranslation.name;
      }
    }

    return {
      id: article.id,
      public_id: '',
      category_id: article.category_id,
      author_id: 0,
      title,
      slug: article.slug,
      image_url: article.image_url,
      excerpt,
      description: '',
      tags: [],
      visibility: article.visibility,
      required_priority: article.required_priority,
      is_published: article.is_published,
      is_highlighted: article.is_highlighted,
      published_at: article.published_at?.toISOString(),
      created_at: article.created_at.toISOString(),
      updated_at: '',
      category: article.categories ? {
        id: article.categories.id,
        name: categoryName,
        slug: article.categories.slug,
        order: 0,
        is_active: true,
        created_at: '',
        updated_at: '',
      } : undefined,
    } as Article;
  }

  /**
   * Get published articles for public access
   * This method filters articles that are published and within their publish date
   */
  static async getPublishedArticles(filters: ArticleFilters & { userMaxPriority?: number } = {}): Promise<{ articles: Article[], total: number, page: number, limit: number }> {
    const { highlightedOnly = false, categoryId, locale, search, page = 1, limit = 10, userMaxPriority = 0 } = filters;
    
    const where: any = {
      is_published: true,
      published_at: { lte: new Date() },
    };

    if (highlightedOnly) {
      where.is_highlighted = true;
    }
    if (categoryId) where.category_id = categoryId;

    // Search in translations if search term provided
    if (search && locale) {
      where.article_translations = {
        some: {
          locale,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    // Get total count
    const total = await prisma.articles.count({ where });

    // Get paginated articles with minimal data
    const articles = await prisma.articles.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { is_highlighted: 'desc' }, // Highlighted articles first
        { published_at: 'desc' },    // Then by publish date
      ],
      select: {
        id: true,
        slug: true,
        image_url: true,
        visibility: true,
        required_priority: true,
        is_published: true,
        is_highlighted: true,
        published_at: true,
        created_at: true,
        category_id: true,
        article_translations: {
          select: {
            locale: true,
            title: true,
            excerpt: true,
          },
        },
        categories: {
          select: {
            id: true,
            slug: true,
            category_translations: {
              select: {
                locale: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform and filter by visibility
    const transformedArticles = articles
      .map(article => {
        const transformed = this.transformArticleList(article, locale);
        
        // Determine if content should be hidden/blurred
        let shouldHide = false;
        
        if (transformed.visibility === 'PUBLIC') {
          // PUBLIC articles are never hidden
          shouldHide = false;
        } else if (transformed.visibility === 'MEMBER') {
          // MEMBER articles are hidden if user is not logged in
          shouldHide = userMaxPriority === 0;
        } else if (transformed.visibility === 'PRIORITY') {
          // PRIORITY articles are hidden if user doesn't meet priority requirement
          if (!transformed.required_priority) {
            shouldHide = userMaxPriority === 0;
          } else {
            shouldHide = userMaxPriority < transformed.required_priority;
          }
        }
        
        return {
          ...transformed,
          hide: shouldHide,
        };
      });

    return {
      articles: transformedArticles,
      total: transformedArticles.length, // Actual count after filtering
      page,
      limit,
    };
  }

  /**
   * Get a single article by ID with translations
   */
  static async getArticleById(id: number, locale?: string): Promise<Article | null> {
    const article = await prisma.articles.findUnique({
      where: { id },
      include: {
        article_translations: true,
        categories: {
          include: {
            category_translations: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return article ? this.transformArticle(article, locale) : null;
  }

  /**
   * Get article by public_id
   */
  static async getArticleByPublicId(publicId: string, locale?: string): Promise<Article | null> {
    const article = await prisma.articles.findUnique({
      where: { public_id: publicId },
      include: {
        article_translations: true,
        categories: {
          include: {
            category_translations: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return article ? this.transformArticle(article, locale) : null;
  }

  /**
   * Get article by slug
   */
  static async getArticleBySlug(slug: string, locale?: string): Promise<Article | null> {
    const article = await prisma.articles.findUnique({
      where: { slug },
      include: {
        article_translations: true,
        categories: {
          include: {
            category_translations: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return article ? this.transformArticle(article, locale) : null;
  }

  /**
   * Create a new article with translations
   */
  static async createArticle(data: any, authorId: number): Promise<Article> {
    // Validate priority level
    if (data.required_priority !== undefined && data.required_priority !== null) {
      if (data.required_priority < 1 || data.required_priority > 4) {
        throw new Error('Priority level must be between 1 and 4');
      }
    }

    let imageUrl = null;
    if (data.image && typeof data.image === 'object' && 'arrayBuffer' in data.image) {
      const buffer = Buffer.from(await data.image.arrayBuffer());
      const filename = `${Date.now()}_${data.image.name}`;
      const imageService = ImageServiceFactory.getService();
      imageUrl = await imageService.upload(buffer, filename);
    }

    const article = await prisma.articles.create({
      data: {
        category_id: data.category_id,
        author_id: authorId,
        slug: data.slug,
        image_url: imageUrl,
        tags: data.tags || [],
        visibility: data.visibility ?? 'PUBLIC',
        required_priority: data.required_priority,
        is_published: data.is_published ?? false,
        is_highlighted: data.is_highlighted ?? false,
        published_at: data.published_at ? new Date(data.published_at) : null,
        article_translations: {
          create: data.translations.map((t: any) => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            description: t.description,
          })),
        },
      },
      include: {
        article_translations: true,
        categories: {
          include: {
            category_translations: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.transformArticle(article);
  }

  /**
   * Update an article with translations
   */
  static async updateArticle(id: number, data: any): Promise<Article> {
    // Validate priority level
    if (data.required_priority !== undefined && data.required_priority !== null) {
      if (data.required_priority < 1 || data.required_priority > 4) {
        throw new Error('Priority level must be between 1 and 4');
      }
    }

    // Delete existing translations if new ones are provided
    if (data.translations) {
      await prisma.article_translations.deleteMany({
        where: { article_id: id },
      });
    }

    let imageUrl = undefined;
    if (data.image && typeof data.image === 'object' && 'arrayBuffer' in data.image) {
      // Get old image and delete
      const oldArticle = await prisma.articles.findUnique({ where: { id } });
      if (oldArticle?.image_url) {
        const oldFilename = oldArticle.image_url.split('/').pop();
        const imageService = ImageServiceFactory.getService();
        await imageService.delete(oldFilename!);
      }
      // Upload new image
      const buffer = Buffer.from(await data.image.arrayBuffer());
      const filename = `${Date.now()}_${data.image.name}`;
      const imageService = ImageServiceFactory.getService();
      imageUrl = await imageService.upload(buffer, filename);
    }

    const article = await prisma.articles.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined && { image_url: imageUrl }),
        ...(data.category_id && { category_id: data.category_id }),
        ...(data.slug && { slug: data.slug }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.visibility && { visibility: data.visibility }),
        ...(data.required_priority !== undefined && { required_priority: data.required_priority }),
        ...(data.is_published !== undefined && { is_published: data.is_published }),
        ...(data.is_highlighted !== undefined && { is_highlighted: data.is_highlighted }),
        ...(data.published_at !== undefined && { 
          published_at: data.published_at ? new Date(data.published_at) : null 
        }),
        ...(data.translations && {
          article_translations: {
            create: data.translations.map((t: any) => ({
              locale: t.locale,
              title: t.title,
              excerpt: t.excerpt,
              description: t.description,
            })),
          },
        }),
      },
      include: {
        article_translations: true,
        categories: {
          include: {
            category_translations: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.transformArticle(article);
  }

  /**
   * Delete an article (translations will be cascade deleted)
   */
  static async deleteArticle(id: number): Promise<void> {
    // Delete image if exists
    const article = await prisma.articles.findUnique({ where: { id } });
    if (article?.image_url) {
      const filename = article.image_url.split('/').pop();
      const imageService = ImageServiceFactory.getService();
      await imageService.delete(filename!);
    }

    await prisma.articles.delete({ where: { id } });
  }

  /**
   * Transform database article to application article
   */
  private static transformArticle(article: any, locale?: string): Article {
    let title = '';
    let excerpt: string | undefined;
    let description = '';

    if (article.article_translations?.length > 0) {
      let translation = article.article_translations.find((t: any) => t.locale === locale);
      if (!translation) translation = article.article_translations[0];
      if (translation) {
        title = translation.title;
        excerpt = translation.excerpt;
        description = translation.description;
      }
    }

    // Transform category
    let categoryName = '';
    if (article.categories?.category_translations?.length > 0) {
      let catTranslation = article.categories.category_translations.find((t: any) => t.locale === locale);
      if (!catTranslation) catTranslation = article.categories.category_translations[0];
      if (catTranslation) {
        categoryName = catTranslation.name;
      }
    }

    return {
      id: article.id,
      public_id: article.public_id,
      category_id: article.category_id,
      author_id: article.author_id,
      title,
      slug: article.slug,
      image_url: article.image_url,
      excerpt,
      description,
      tags: article.tags || [],
      visibility: article.visibility,
      required_priority: article.required_priority,
      is_published: article.is_published,
      is_highlighted: article.is_highlighted,
      published_at: article.published_at?.toISOString(),
      created_at: article.created_at.toISOString(),
      updated_at: article.updated_at.toISOString(),
      translations: article.article_translations?.map((t: any) => ({
        id: t.id,
        article_id: t.article_id,
        locale: t.locale,
        title: t.title,
        excerpt: t.excerpt,
        description: t.description,
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
      })) || [],
      category: article.categories ? {
        id: article.categories.id,
        parent_id: article.categories.parent_id,
        name: categoryName,
        slug: article.categories.slug,
        order: article.categories.order,
        is_active: article.categories.is_active,
        created_at: article.categories.created_at.toISOString(),
        updated_at: article.categories.updated_at.toISOString(),
      } : undefined,
      author: article.author,
    };
  }
}
