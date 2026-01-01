import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const locales = ['en', 'zh-HK'];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [];
  
  // Add root and locale-specific pages
  locales.forEach(locale => {
    const localePrefix = `${baseUrl}/${locale}`;
    
    staticPages.push(
      {
        url: localePrefix,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${localePrefix}/services`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${localePrefix}/events`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${localePrefix}/articles`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${localePrefix}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${localePrefix}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${localePrefix}/membership`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    );
  });

  try {
    // Dynamic pages - Articles
    const articles = await prisma.articles.findMany({
      where: {
        is_published: true,
      },
      select: {
        slug: true,
        updated_at: true,
      },
    });

    const articlePages: MetadataRoute.Sitemap = [];
    articles.forEach((article: { slug: string; updated_at: Date }) => {
      locales.forEach(locale => {
        articlePages.push({
          url: `${baseUrl}/${locale}/articles/${article.slug}`,
          lastModified: article.updated_at,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    });

    // Dynamic pages - Events
    const events = await prisma.events.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        slug: true,
        updated_at: true,
      },
    });

    const eventPages: MetadataRoute.Sitemap = [];
    events.forEach((event: { slug: string; updated_at: Date }) => {
      locales.forEach(locale => {
        eventPages.push({
          url: `${baseUrl}/${locale}/events/${event.slug}`,
          lastModified: event.updated_at,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    });

    return [...staticPages, ...articlePages, ...eventPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if database query fails
    return staticPages;
  }
}
