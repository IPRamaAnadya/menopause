"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const t = useTranslations("Member");

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.description")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.avatar")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              {t("profile.changeAvatar")}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("profile.information")}</CardTitle>
            <CardDescription>{t("profile.informationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="inline h-4 w-4 mr-2" />
                {t("profile.name")}
              </Label>
              <Input
                id="name"
                defaultValue={session?.user?.name || ""}
                placeholder={t("profile.namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline h-4 w-4 mr-2" />
                {t("profile.email")}
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue={session?.user?.email || ""}
                placeholder={t("profile.emailPlaceholder")}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joined">
                <Calendar className="inline h-4 w-4 mr-2" />
                {t("profile.memberSince")}
              </Label>
              <Input
                id="joined"
                defaultValue={new Date().toLocaleDateString()}
                disabled
              />
            </div>
            <Button>{t("profile.saveChanges")}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
