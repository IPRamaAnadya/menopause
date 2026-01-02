"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Calendar, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useHighlightedContent } from "@/hooks/useHighlightedContent";

interface HeroLoungeProps {
  userName: string;
}

export function HeroLounge({ userName }: HeroLoungeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const { content, loading } = useHighlightedContent();
  const t = useTranslations('Lounge.hero');

  // Build slides dynamically from API data
  const slides = [
    {
      id: 1,
      type: "greeting",
      title: t('welcomeTitle', { userName }),
      description: t('description'),
      badge: t('membersOnly'),
      icon: Sparkles,
      image: "/assets/images/members/hero.jpg",
    },
    ...(content.event ? [{
      id: 2,
      type: "event",
      title: content.event.title,
      description: content.event.description,
      date: new Date(content.event.start_date).toLocaleDateString(locale === 'zh-HK' ? 'zh-HK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      badge: t('upcomingEvent'),
      icon: Calendar,
      link: `/${locale}/member/events`,
      image: content.event.image_url || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    }] : []),
    ...(content.article ? [{
      id: 3,
      type: "article",
      title: content.article.title,
      description: content.article.excerpt,
      badge: t('featuredArticle'),
      icon: BookOpen,
      link: `/${locale}/member/articles`,
      image: content.article.image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    }] : []),
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {loading ? (
            <div className="relative min-h-[480px] md:min-h-[300px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">{t('loadingContent')}</p>
              </div>
            </div>
          ) : (
          <div className="relative min-h-[480px] md:min-h-[300px]">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                  {/* Image - Only for events and articles */}
                  {slide.image && (
                    <div className="w-full md:w-1/2 order-1 md:order-1">
                      <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className={`${slide.image ? 'w-full md:w-1/2' : 'w-full'} order-2 md:order-2 text-center md:text-left space-y-4`}>
                    {/* Badge */}
                    <div className="flex justify-center md:justify-start">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
                        <slide.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        <span className="text-xs md:text-sm font-medium text-primary">
                          {slide.badge}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                      {slide.title}
                    </h1>

                    {/* Description */}
                    <p className="text-sm md:text-base text-muted-foreground">
                      {slide.description}
                    </p>

                    {/* Date for events */}
                    {slide.type === "event" && slide.date && (
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Calendar className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-primary">
                          {slide.date}
                        </p>
                      </div>
                    )}

                    {/* CTA Button */}
                    {slide.link && (
                      <div className="pt-2">
                        <Link href={slide.link}>
                          <Button size="lg" className="rounded-full">
                            {slide.type === "event" ? t('viewEvent') : t('readArticle')}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Navigation Arrows - Hidden on small mobile */}
          {!loading && (
          <>
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 items-center justify-center w-12 h-12 rounded-full bg-background/40 backdrop-blur-sm hover:bg-background/60 hover:scale-110 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-foreground/70 hover:text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 items-center justify-center w-12 h-12 rounded-full bg-background/40 backdrop-blur-sm hover:bg-background/60 hover:scale-110 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-foreground/70 hover:text-foreground" />
          </button>
          </>
          )}
        </div>

        {/* Dots Indicator */}
        {!loading && (
        <div className="flex justify-center gap-2 mt-6 md:mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>        )}      </div>
    </section>
  );
}
