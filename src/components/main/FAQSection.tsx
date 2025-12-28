"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  order: number;
}

export function FAQSection() {
  const t = useTranslations('MainSite.faq');
  const locale = useLocale();
  const [openId, setOpenId] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        setLoading(true);
        const response = await fetch('/api/public/faq', {
          headers: {
            'locale': locale,
          },
        });
        if (response.ok) {
          const result = await response.json();
          // Handle new API response structure
          const data = result.success && result.data ? result.data : [];
          setFaqs(data);
          // Set first FAQ as open by default
          if (data.length > 0) {
            setOpenId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, [locale]);

  return (
    <section className="container mx-auto max-w-7xl px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Content */}
        <div className="lg:sticky lg:top-24">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border-1 border-muted-foreground/30 mb-2">
            <span className="text-sm text-muted-foreground">{t('badge')}</span>
          </div>
          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl tracking-tight text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Right Content - FAQ List */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton Loading State
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>
              ))}
            </>
          ) : faqs.length === 0 ? (
            // Empty State
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-500">{t('noFaqs') || 'No FAQs available at the moment.'}</p>
            </div>
          ) : (
            // FAQ Items
            <>
              {faqs.map((faq) => {
                const isOpen = openId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left"
                    >
                      <span className="text-sm font-medium text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`text-gray-400 transition-transform duration-200 flex-shrink-0 w-5 h-5 ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          <p className="pt-4 text-sm text-gray-500">
            {t('contact.text')}{" "}
            <Link
              href="/contact"
              className="font-medium text-pink-600 hover:underline"
            >
              {t('contact.link')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
