'use client';

import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

export function ValuePropositionSection() {
  const t = useTranslations('MainSite.valueProposition');
  const locale = useLocale();
  
  return (
    <section className="container mx-auto max-w-7xl px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border-1 border-muted-foreground/30 mb-2">
            <span className="text-sm text-muted-foreground">{t('subtitle')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight">
            {locale === 'en' ? (
              <>
                <span className="text-foreground">WHY NEED TO </span>
                <br />
                <span className="text-primary">YOU </span>
                <span className="text-secondary">JOIN?</span>
              </>
            ) : (
              t('title')
            )}
          </h2>
        </div>

        {/* Right Content */}
        <div className="rounded-3xl bg-muted p-8 lg:p-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {t('heading')}
          </h3>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {t('description')}
          </p>
          <Button size="lg" asChild>
            <Link href="/about">{t('cta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
