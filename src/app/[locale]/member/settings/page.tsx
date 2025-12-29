"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("Member");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.description")}</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("settings.notifications")}
          </CardTitle>
          <CardDescription>{t("settings.notificationsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">
                {t("settings.emailNotifications")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.emailNotificationsDescription")}
              </p>
            </div>
            <Switch id="email-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="event-reminders">
                {t("settings.eventReminders")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.eventRemindersDescription")}
              </p>
            </div>
            <Switch id="event-reminders" />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("settings.privacy")}
          </CardTitle>
          <CardDescription>{t("settings.privacyDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-public">
                {t("settings.publicProfile")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.publicProfileDescription")}
              </p>
            </div>
            <Switch id="profile-public" />
          </div>
          <Button variant="outline">{t("settings.changePassword")}</Button>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("settings.language")}
          </CardTitle>
          <CardDescription>{t("settings.languageDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("settings.languageInfo")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
