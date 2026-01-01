export const siteConfig = {
  name: "The Hong Kong Menopause Society",
  description: "Your comprehensive menopause health management platform. Access expert advice, resources, and support for every stage of menopause. Empowering women in Hong Kong to thrive through knowledge and community.",
  url: "https://menopause-dev.mapunia.com",
  
  // SEO Keywords
  keywords: [
    "menopause",
    "menopause support",
    "women's health",
    "Hong Kong menopause",
    "menopause symptoms",
    "hormone therapy",
    "menopause management",
    "perimenopause",
    "postmenopause",
    "menopause clinic",
    "menopause advice",
    "women's health Hong Kong",
    "menopause treatment",
    "menopause care",
    "midlife health"
  ],
  
  // Open Graph / Social Media
  ogImage: "/og-image.jpg", // Default OG image
  twitterHandle: "@menopauseHK",
  
  // Brand Colors (can be changed easily)
  colors: {
    // Primary color - main brand color
    primary: {
      light: "#E4097D",
      dark: "#E4097D",
      onLight: "#FFFFFF", // Text color on primary background (light mode)
      onDark: "#FFFFFF"   // Text color on primary background (dark mode)
    },
    // Secondary color - accent color
    secondary: {
      light: "#EE3B29",
      dark: "#EE3B29",
      onLight: "#FFFFFF", // Text color on secondary background (light mode)
      onDark: "#FFFFFF"   // Text color on secondary background (dark mode)
    },
    // Additional colors
    accent: {
      light: "oklch(0.6 0.118 184.704)", // Teal
      dark: "oklch(0.398 0.07 227.392)"
    }
  },
  
  // Border radius
  radius: "0.625rem", // 10px - can be changed to "0" for sharp corners or "1rem" for more rounded
  
  // Google Fonts
  fonts: {
    // Main font for body text
    sans: {
      name: "Inter",
      weights: [400, 500, 600, 700],
      fallback: "system-ui, sans-serif"
    },
    // Font for headings (optional - leave empty to use same as sans)
    heading: {
      name: "Inter",
      weights: [600, 700, 800],
      fallback: "system-ui, sans-serif"
    },
    // Monospace font for code
    mono: {
      name: "Roboto Mono",
      weights: [400, 500],
      fallback: "monospace"
    }
  },
  
  // Dashboard settings
  dashboard: {
    sidebarTitle: "THE HK MENOPAUSE\nSOCIETY",
    showVersion: true,
    version: "1.0.0"
  },
  
  // Contact & Social
  links: {
    email: "support@menopause.example.com",
    twitter: "https://twitter.com/menopausecare",
    github: "https://github.com/yourorg/menopause"
  }
};

export type SiteConfig = typeof siteConfig;
