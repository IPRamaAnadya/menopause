import { siteConfig } from '@/config/site';

/**
 * Quick Theme Customization Guide
 * 
 * To change the app's appearance:
 * 1. Open src/config/site.ts
 * 2. Modify the values in siteConfig
 * 
 * Colors:
 * - Use OKLCH color format for better consistency
 * - Generate colors at: https://oklch.com
 * - Example: oklch(0.7 0.2 150) = lightness brightness hue
 * 
 * Fonts:
 * - Browse Google Fonts: https://fonts.google.com
 * - Update font.name in siteConfig
 * - Fonts are automatically loaded
 * 
 * Radius:
 * - "0" = sharp corners
 * - "0.5rem" = slightly rounded
 * - "1rem" = very rounded
 */

/**
 * Generate CSS custom properties from site config
 */
export function generateThemeVars() {
  return `
    --radius: ${siteConfig.radius};
    --primary-light: ${siteConfig.colors.primary.light};
    --primary-dark: ${siteConfig.colors.primary.dark};
    --secondary-light: ${siteConfig.colors.secondary.light};
    --secondary-dark: ${siteConfig.colors.secondary.dark};
    --accent-light: ${siteConfig.colors.accent.light};
    --accent-dark: ${siteConfig.colors.accent.dark};
  `;
}

/**
 * Get Google Font URL for all configured fonts
 */
export function getGoogleFontsUrl(): string {
  const fonts = siteConfig.fonts;
  const fontFamilies: string[] = [];

  // Add sans font
  if (fonts.sans.name) {
    fontFamilies.push(`${fonts.sans.name.replace(' ', '+')}:wght@${fonts.sans.weights.join(';')}`);
  }

  // Add heading font if different from sans
  if (fonts.heading.name && fonts.heading.name !== fonts.sans.name) {
    fontFamilies.push(`${fonts.heading.name.replace(' ', '+')}:wght@${fonts.heading.weights.join(';')}`);
  }

  // Add mono font
  if (fonts.mono.name) {
    fontFamilies.push(`${fonts.mono.name.replace(' ', '+')}:wght@${fonts.mono.weights.join(';')}`);
  }

  return `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join('&')}&display=swap`;
}
