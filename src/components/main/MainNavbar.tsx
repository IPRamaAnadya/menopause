'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { siteConfig } from '@/config/site';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MainNavbar() {
  const t = useTranslations('MainSite');
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/service', label: t('nav.service') },
    { href: '/articles', label: t('nav.articles') },
    { href: '/event', label: t('nav.event') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and Text */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div className="hidden md:block">
              <div className="font-serif text-sm font-bold leading-tight uppercase text-accent">
                THE HONG KONG
                <br />
                MENOPAUSE SOCIETY
              </div>
            </div>
          </Link>

          {/* Center: Menu (Desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Language Switcher & Auth */}
          <div className="flex items-center gap-3">
            {/* Language Switcher (Desktop) */}
            <div className="hidden md:block">
              <LanguageSwitcher variant="compact" />
            </div>

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className="text-sm font-medium">
                        {session.user.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:inline">{session.user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{session.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {session.user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {session.user.role === 'Administrator' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">{t('nav.dashboard')}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile">{t('nav.profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth/signup">{t('nav.joinNow')}</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t">
                <LanguageSwitcher variant="compact" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
