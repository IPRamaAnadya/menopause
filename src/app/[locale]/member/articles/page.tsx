"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "lucide-react";

export default function ArticlesPage() {
  const t = useTranslations("Member");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("articles.title")}</h1>
        <p className="text-muted-foreground">{t("articles.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            {t("articles.saved")}
          </CardTitle>
          <CardDescription>{t("articles.savedDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            {t("articles.noArticles")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
