# SEO Setup Guide

## Overview
This document describes the SEO, meta tags, and sitemap setup for The Hong Kong Menopause Society website.

## Components Implemented

### 1. Keywords
Location: `/src/config/site.ts`

Keywords added:
- menopause
- menopause support
- women's health
- Hong Kong menopause
- menopause symptoms
- hormone therapy
- menopause management
- perimenopause
- postmenopause
- And more...

**To update keywords:**
Edit the `keywords` array in `/src/config/site.ts`

### 2. Social Media Meta Tags

#### Open Graph (Facebook, LinkedIn, etc.)
Configured in `/src/app/[locale]/layout.tsx`:
- `og:type`: website
- `og:locale`: en_US (with zh_HK alternate)
- `og:url`: Your site URL
- `og:title`: Site name
- `og:description`: Site description
- `og:image`: 1200x630px image
- `og:site_name`: Your brand name

#### Twitter Cards
Configured in `/src/app/[locale]/layout.tsx`:
- `twitter:card`: summary_large_image
- `twitter:title`: Site name
- `twitter:description`: Site description
- `twitter:image`: OG image
- `twitter:creator`: Twitter handle

### 3. Sitemap
Location: `/src/app/sitemap.ts`

**Includes:**
- Static pages (home, services, events, articles, about, contact, membership)
- Dynamic pages:
  - All published articles
  - All published events
  - All services
- Both English and Chinese (zh-HK) versions

**Priority levels:**
- Homepage: 1.0
- Main sections (services, events, articles): 0.9
- Individual content pages: 0.8
- About/Contact: 0.7

**Update frequency:**
- Homepage: daily
- Main sections: daily/weekly
- Content pages: weekly
- Static pages: monthly

**Access sitemap at:**
- `https://your-domain.com/sitemap.xml`

### 4. Robots.txt
Location: `/src/app/robots.ts`

**Configuration:**
- Allows all crawlers
- Blocks: `/api/`, `/dashboard/`, `/_next/`, `/admin/`
- References sitemap location

**Access robots.txt at:**
- `https://your-domain.com/robots.txt`

### 5. Web App Manifest
Location: `/public/site.webmanifest`

Enables PWA features and defines:
- App name and short name
- Icons for various sizes
- Theme colors
- Display mode

## Required Assets

### Images to Create/Replace:

1. **Open Graph Image** (`/public/og-image.jpg`)
   - Size: 1200x630px
   - Format: JPG or PNG
   - Content: Brand logo + tagline
   - Used for social media previews

2. **Favicon** (`/public/favicon.ico`)
   - Size: 32x32px or 16x16px
   - Format: ICO
   - Already exists at root

3. **Apple Touch Icon** (`/public/apple-touch-icon.png`)
   - Size: 180x180px
   - Format: PNG
   - Used for iOS home screen

4. **Android Chrome Icons**
   - `/public/android-chrome-192x192.png` (192x192px)
   - `/public/android-chrome-512x512.png` (512x512px)
   - Format: PNG
   - Used for Android devices

## Configuration

### Site URL
Update in `/src/config/site.ts`:
```typescript
url: "https://your-production-domain.com"
```

### Twitter Handle
Update in `/src/config/site.ts`:
```typescript
twitterHandle: "@yourhandle"
```

### Email & Social Links
Update in `/src/config/site.ts`:
```typescript
links: {
  email: "your@email.com",
  twitter: "https://twitter.com/yourhandle",
  github: "https://github.com/yourorg/project"
}
```

## Page-Specific Meta Tags

To add custom meta tags to specific pages, export metadata from the page:

```typescript
// In any page.tsx file
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Page Title',
  description: 'Custom page description',
  keywords: ['specific', 'keywords', 'for', 'this', 'page'],
  openGraph: {
    title: 'Custom OG Title',
    description: 'Custom OG Description',
    images: ['/custom-og-image.jpg'],
  },
};
```

## Testing

### 1. Test Open Graph Tags
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

### 2. Test Twitter Cards
- Twitter Card Validator: https://cards-dev.twitter.com/validator

### 3. Test Structured Data
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema Markup Validator: https://validator.schema.org/

### 4. Test Sitemap
Visit: `https://your-domain.com/sitemap.xml`
Should display XML with all pages listed

### 5. Test Robots.txt
Visit: `https://your-domain.com/robots.txt`
Should display crawl rules

### 6. Verify in Google Search Console
1. Add your site to Google Search Console
2. Submit sitemap: `https://your-domain.com/sitemap.xml`
3. Monitor indexing status

## Search Engine Submission

### Google
1. Google Search Console: https://search.google.com/search-console
2. Submit sitemap
3. Request indexing

### Bing
1. Bing Webmaster Tools: https://www.bing.com/webmasters
2. Submit sitemap
3. Request indexing

### Additional Search Engines
- Yandex: https://webmaster.yandex.com/
- Baidu: https://ziyuan.baidu.com/ (for China)

## Performance Tips

1. **Image Optimization**
   - Use WebP format for OG images when possible
   - Compress images to < 200KB
   - Use proper dimensions (1200x630 for OG)

2. **Sitemap Updates**
   - Sitemap regenerates automatically on each request
   - Consider caching for high-traffic sites
   - Revalidate when content changes

3. **Meta Tag Length**
   - Title: 50-60 characters
   - Description: 150-160 characters
   - Keep concise and descriptive

## Monitoring

Track SEO performance:
1. Google Analytics - Traffic sources
2. Google Search Console - Search appearance
3. Social media insights - Share engagement
4. Core Web Vitals - Performance metrics

## Additional Features to Consider

1. **Structured Data (JSON-LD)**
   - Add schema.org markup for articles
   - Add Organization schema
   - Add BreadcrumbList schema

2. **Canonical URLs**
   - Prevent duplicate content issues
   - Especially important for paginated content

3. **Hreflang Tags**
   - Already have locale support (en, zh-HK)
   - Consider adding explicit hreflang tags

4. **RSS Feed**
   - For articles and events
   - Helps with content distribution

## Support

For issues or questions:
- Check Next.js Metadata docs: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Review Open Graph protocol: https://ogp.me/
- Twitter Card documentation: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
