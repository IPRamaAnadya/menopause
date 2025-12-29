"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function EventsPage() {
  const t = useTranslations("Member");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("events.title")}</h1>
        <p className="text-muted-foreground">{t("events.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("events.upcoming")}
          </CardTitle>
          <CardDescription>{t("events.upcomingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            {t("events.noEvents")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
