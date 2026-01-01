import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AppProvider } from '@/providers/AppProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { siteConfig } from '@/config/site';
import { Inter, Crimson_Text, Playfair_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

// Configure fonts from site config
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const fontMono = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const fontSerif = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
});

const fontQuote = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-quote",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_HK"],
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} ${fontQuote.variable} antialiased`}
      >
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <AppProvider locale={locale}>
              {children}
            </AppProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
