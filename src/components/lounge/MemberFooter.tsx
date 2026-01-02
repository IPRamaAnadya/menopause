'use client';

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

export function MemberFooter() {
  const t = useTranslations('Lounge.footer');
  const locale = useLocale();
  
  const memberLinks = [
    { href: '/member/lounge', label: t('member.lounge') },
    { href: '/member/articles', label: t('member.articles') },
    { href: '/member/events', label: t('member.events') },
    { href: '/member/community', label: t('member.community') },
  ];

  const supportLinks = [
    { href: '/faq', label: t('support.faq') },
    { href: '/contact', label: t('support.contact') },
    { href: '/member/profile', label: t('support.profile') },
  ];

  const resourceLinks = [
    { href: '/about', label: t('resource.about') },
    { href: '/service', label: t('resource.services') },
    { href: '/privacy', label: t('resource.privacy') },
    { href: '/terms', label: t('resource.terms') },
  ];

  return (
    <footer className="bg-primary/5 text-foreground border-t">
      <div className="container mx-auto px-8 py-12">
        {/* First Row: Content with Two Columns */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Left: CTA */}
          <div>
            <h3 className="text-2xl md:text-3xl mb-4 leading-tight font-bold">
              {t('cta.title')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="default" asChild>
                <Link href={`/${locale}/contact`}>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('cta.contactButton')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/member/profile`}>
                  {t('cta.profileButton')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Menu Columns */}
          <div className="grid grid-cols-3 gap-8">
            {/* Member Area */}
            <div>
              <h4 className="font-semibold mb-4">{t('member.title')}</h4>
              <ul className="space-y-2">
                {memberLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">{t('support.title')}</h4>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">{t('resource.title')}</h4>
              <ul className="space-y-2">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Second Row: Copyright, Logo, Social Media, Contact */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Logo and Copyright */}
            <div className="flex items-center gap-4">
              <Image
                src="/assets/images/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <p className="text-sm text-muted-foreground">
                {t('copyright')}
              </p>
            </div>

            {/* Right: Contact Info and Social Media */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Contact Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <a 
                  href="tel:+85212345678" 
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">+852 1234 5678</span>
                </a>
                <a 
                  href="mailto:info@hkmenopause.org" 
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">info@hkmenopause.org</span>
                </a>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-4">
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="sr-only">WhatsApp</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
