"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Ticket, Bell, LogOut, ChevronRight, Receipt, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";

interface UserMembership {
  membership_level: {
    name: string;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const t = useTranslations("Lounge.profile");
  const locale = useLocale();
  const { profile } = useProfile();
  const [membershipLevel, setMembershipLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/member/membership');
        const data = await response.json();
        
        if (data.success && data.data?.membership_level?.name) {
          setMembershipLevel(data.data.membership_level.name);
        }
      } catch (error) {
        console.error('Error fetching membership:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [session?.user?.id]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/auth/login` });
  };

  const menuItems = [
    {
      icon: User,
      label: t('changeProfileSettings'),
      href: `/${locale}/member/profile/settings`,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      icon: Ticket,
      label: t('eventTickets'),
      href: `/${locale}/member/profile/tickets`,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      icon: Receipt,
      label: t('orderHistory'),
      href: `/${locale}/member/profile/orders`,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      icon: Bell,
      label: t('notifications'),
      href: `/${locale}/member/profile/notifications`,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      icon: MessageCircle,
      label: t('contactUs'),
      href: `/${locale}/contact`,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      icon: Settings,
      label: t('privacy.title'),
      href: `/${locale}/member/profile/privacy`,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8 pb-8 border-b">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={profile?.image || session?.user?.image || undefined} className="object-cover"/>
              <AvatarFallback className="text-2xl bg-primary text-white">
                {getInitials(profile?.name || session?.user?.name)}
              </AvatarFallback>
            </Avatar>

            {/* User Name */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {profile?.name || session?.user?.name || "Member"}
            </h1>

            {/* Profession */}
            {profile?.profession && (
              <p className="text-sm text-gray-500 mb-3">
                {profile.profession}
              </p>
            )}

            {/* Membership Level Badge */}
            {loading ? (
              <div className="h-6 w-32 bg-gray-100 animate-pulse rounded-full" />
            ) : membershipLevel ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                {membershipLevel}
              </div>
            ) : (
              <div className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">
                {t('noMembership')}
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bgColor}`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.label}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-4 hover:bg-gray-50 transition-colors group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 group-hover:bg-gray-200 transition-colors">
            <LogOut className="h-6 w-6 text-gray-600" />
          </div>
          <span className="flex-1 text-left font-medium text-gray-600">{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}
