"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Award, Book, Settings } from "lucide-react";
import Link from "next/link";

export default function MemberDashboard() {
  const { data: session } = useSession();
  const t = useTranslations("Member");

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("welcome")}, {session?.user?.name || "Member"}!
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.profile")}
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session?.user?.name}</div>
            <p className="text-xs text-muted-foreground">
              {session?.user?.email}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.membership")}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("dashboard.active")}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.viewDetails")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.events")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.upcoming")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.articles")}
            </CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.saved")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quickActions")}</CardTitle>
          <CardDescription>
            {t("dashboard.quickActionsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/member/profile">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              {t("nav.profile")}
            </Button>
          </Link>
          <Link href="/member/subscription">
            <Button variant="outline" className="w-full justify-start">
              <Award className="mr-2 h-4 w-4" />
              {t("nav.subscription")}
            </Button>
          </Link>
          <Link href="/member/events">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              {t("nav.events")}
            </Button>
          </Link>
          <Link href="/member/articles">
            <Button variant="outline" className="w-full justify-start">
              <Book className="mr-2 h-4 w-4" />
              {t("nav.articles")}
            </Button>
          </Link>
          <Link href="/member/settings">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.settings")}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
          <CardDescription>
            {t("dashboard.recentActivityDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("dashboard.noActivity")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
