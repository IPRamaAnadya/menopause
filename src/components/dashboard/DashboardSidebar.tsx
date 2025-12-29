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
  UserCheck
} from 'lucide-react';

export function DashboardSidebar() {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();
  
  const menuItems = [
    {
      title: t('nav.overview'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('nav.symptoms'),
      href: '/dashboard/symptoms',
      icon: Activity,
    },
    {
      title: t('nav.appointments'),
      href: '/dashboard/appointments',
      icon: Calendar,
    },
    {
      title: t('nav.articles'),
      href: '/dashboard/articles',
      icon: FileText,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground">
            <img src="/assets/images/logo.png" alt="logo" className="w-[45px]" />
          </div>
          <span className="text-accent text-xs font-serif">
            {siteConfig.dashboard.sidebarTitle}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.administration')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/users'}>
                  <Link href="/dashboard/users">
                    <Users className="h-4 w-4" />
                    <span>{t('nav.usersManagement')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.websiteContent')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/services'}>
                  <Link href="/dashboard/services">
                    <Layers className="h-4 w-4" />
                    <span>{t('nav.servicesManagement')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/faq'}>
                  <Link href="/dashboard/faq">
                    <HelpCircle className="h-4 w-4" />
                    <span>{t('nav.faqManagement')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.membershipManagement')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/membership'}>
                  <Link href="/dashboard/membership">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('nav.membershipOverview')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/membership/levels'}>
                  <Link href="/dashboard/membership/levels">
                    <Crown className="h-4 w-4" />
                    <span>{t('nav.membershipLevel')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/membership/subscriptions'}>
                  <Link href="/dashboard/membership/subscriptions">
                    <UserCheck className="h-4 w-4" />
                    <span>{t('nav.memberSubscription')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.articleManagement')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/articles/categories'}>
                  <Link href="/dashboard/articles/categories">
                    <FolderTree className="h-4 w-4" />
                    <span>{t('nav.categoryManagement')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/articles'}>
                  <Link href="/dashboard/articles">
                    <BookOpen className="h-4 w-4" />
                    <span>{t('nav.articlesManagement')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.other')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>{t('nav.mainSite')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>{t('nav.settings')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
