'use client';

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const t = useTranslations('MainSite.hero');
  
  return (
    <section className="container mx-auto px-8 py-2">
      <div className="rounded-3xl bg-linear-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="px-8 py-12 lg:px-16 lg:py-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {t('description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">{t('joinNow')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">{t('learnMore')}</Link>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-100 lg:h-150">
            <Image
              src="/assets/images/hero.jpg"
              alt="Hero Image"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
