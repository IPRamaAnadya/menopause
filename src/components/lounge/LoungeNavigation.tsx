"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, ChevronDown } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LoungeNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("Lounge");
  const locale = pathname.split("/")[1];

  const navigation = [
    { name: t("nav.lounge"), href: `/${locale}/member/lounge` },
    { name: t("nav.articles"), href: `/${locale}/member/articles` },
    { name: t("nav.events"), href: `/${locale}/member/events` },
    { name: t("nav.community"), href: `/${locale}/member/community` },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left aligned on all screen sizes */}
          <Link href={`/${locale}/member/lounge`} className="flex items-center gap-3">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <div className="font-serif text-sm font-bold leading-tight uppercase text-accent">
                THE HONG KONG
                <br />
                MENOPAUSE SOCIETY
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Language Switcher & Profile (desktop only) */}
          <div className="flex items-center gap-4">
            {/* Mobile: Icon only, Desktop: With label */}
            <div className="md:hidden">
              <LanguageSwitcher variant="compact" />
            </div>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            
            {/* Desktop User Menu - Profile Dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span>{session?.user?.name || "Profile"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/member/profile`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}`} className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
