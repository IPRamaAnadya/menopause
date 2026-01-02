"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Home, FileText, Calendar, Users, User } from "lucide-react";

export default function BottomNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("Lounge");
  const locale = pathname.split("/")[1];

  const navigation = [
    { 
      name: t("nav.lounge"), 
      href: `/${locale}/member/lounge`,
      icon: Home
    },
    { 
      name: t("nav.articles"), 
      href: `/${locale}/member/articles`,
      icon: FileText
    },
    { 
      name: t("nav.events"), 
      href: `/${locale}/member/events`,
      icon: Calendar
    },
    { 
      name: t("nav.community"), 
      href: `/${locale}/member/community`,
      icon: Users
    },
    { 
      name: "Profile", 
      href: `/${locale}/member/profile`,
      icon: User
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
