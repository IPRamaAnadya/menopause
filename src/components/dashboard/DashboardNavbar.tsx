'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-6" />
      
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Breadcrumb or page title can go here */}
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher variant="compact" />
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">U</span>
          </div>
        </div>
      </div>
    </header>
  );
}
