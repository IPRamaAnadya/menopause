"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ArrowLeft,
  Bell 
} from "lucide-react";

export function ComingSoonContent() {
  const t = useTranslations('Lounge.comingSoon');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        {/* Illustration/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full p-12">
              <Users className="w-24 h-24 md:w-32 md:h-32 text-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {t('title')}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {t('subtitle')}
          </h1>
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('description')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => router.push(`/${locale}/member/lounge`)}
            variant="outline"
            className="min-w-[200px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToLounge')}
          </Button>
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
