'use client';

import * as React from 'react';
import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useLocale } from '@/providers/LocaleProvider';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Activity, 
  Calendar, 
  FileText, 
  Settings,
  Home,
  Users,
  Layers,
  HelpCircle,
  FolderTree,
  BookOpen,
  Crown,
  BadgeCheck,
  UserCheck,
  CalendarDays,
  ListChecks,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function DashboardSidebar() {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();
  
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    main: true,
    administration: false,
    website: false,
    membership: false,
    articles: false,
    events: false,
    other: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const menuSections = [
    {
      id: 'main',
      title: t('nav.menu'),
      items: [
        { title: t('nav.overview'), href: '/dashboard', icon: LayoutDashboard },
        { title: t('nav.symptoms'), href: '/dashboard/symptoms', icon: Activity },
        { title: t('nav.appointments'), href: '/dashboard/appointments', icon: Calendar },
        { title: t('nav.articles'), href: '/dashboard/articles', icon: FileText },
      ],
    },
    {
      id: 'administration',
      title: t('nav.administration'),
      items: [
        { title: t('nav.usersManagement'), href: '/dashboard/users', icon: Users },
      ],
    },
    {
      id: 'website',
      title: t('nav.websiteContent'),
      items: [
        { title: t('nav.servicesManagement'), href: '/dashboard/services', icon: Layers },
        { title: t('nav.faqManagement'), href: '/dashboard/faq', icon: HelpCircle },
      ],
    },
    {
      id: 'membership',
      title: t('nav.membershipManagement'),
      items: [
        { title: t('nav.membershipOverview'), href: '/dashboard/membership', icon: LayoutDashboard },
        { title: t('nav.membershipLevel'), href: '/dashboard/membership/levels', icon: Crown },
        { title: t('nav.memberSubscription'), href: '/dashboard/membership/subscriptions', icon: UserCheck },
      ],
    },
    {
      id: 'articles',
      title: t('nav.articleManagement'),
      items: [
        { title: t('nav.categoryManagement'), href: '/dashboard/articles/categories', icon: FolderTree },
        { title: t('nav.articlesManagement'), href: '/dashboard/articles', icon: BookOpen },
      ],
    },
    {
      id: 'events',
      title: t('nav.eventManagement'),
      items: [
        { title: t('nav.eventRegistrationsOverview'), href: '/dashboard/events/registrations-overview', icon: TrendingUp },
        { title: t('nav.eventsManagement'), href: '/dashboard/events', icon: CalendarDays },
        { title: t('nav.eventRegistrationsHistory'), href: '/dashboard/events/registrations', icon: ListChecks },
      ],
    },
    {
      id: 'other',
      title: t('nav.other'),
      items: [
        { title: t('nav.mainSite'), href: '/', icon: Home },
        { title: t('nav.settings'), href: '/dashboard/settings', icon: Settings },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg">
            <img src="/assets/images/logo.png" alt="logo" className="w-[45px]" />
          </div>
          <span className="text-accent text-xs font-serif font-semibold">
            {siteConfig.dashboard.sidebarTitle}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {menuSections.map((section) => (
          <Collapsible
            key={section.id}
            open={openSections[section.id]}
            onOpenChange={() => toggleSection(section.id)}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-2 text-sm font-medium hover:bg-accent/50 rounded-md transition-colors">
                  <span className="text-muted-foreground">{section.title}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            className={isActive ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : ''}
                          >
                            <Link href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors">
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="text-sm">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      {siteConfig.dashboard.showVersion && (
        <SidebarFooter className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            {t('footer.version')} {siteConfig.dashboard.version}
          </div>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
