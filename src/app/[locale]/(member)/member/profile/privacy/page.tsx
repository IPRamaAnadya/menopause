"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Mail, Lock, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PrivacySettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations("Lounge.profile.privacy");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const { toast } = useToast();

  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Check if email is verified from session
  const isEmailVerified = session?.user?.emailVerified !== null && session?.user?.emailVerified !== undefined;

  const handleSendVerification = async () => {
    setVerifyingEmail(true);
    try {
      const response = await fetch(`/api/member/profile/send-verification?locale=${locale}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: tCommon("toast.success"),
          description: t("verificationSent"),
        });
      } else {
        toast({
          title: tCommon("toast.error"),
          description: result.error?.message || t("verificationFailed"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      toast({
        title: tCommon("toast.error"),
        description: t("verificationFailed"),
        variant: "destructive",
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: tCommon("toast.error"),
        description: t("fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: tCommon("toast.error"),
        description: t("passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: tCommon("toast.error"),
        description: t("passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/member/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: tCommon("toast.success"),
          description: t("passwordChanged"),
        });
        // Clear form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast({
          title: tCommon("toast.error"),
          description: result.error?.message || t("passwordChangeFailed"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: tCommon("toast.error"),
        description: t("passwordChangeFailed"),
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b">
          <Link
            href={`/${locale}/member/profile`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon("back")}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          </div>
          <p className="text-sm text-gray-500">{t("description")}</p>
        </div>

        {/* Email Verification Section */}
        <div className="mb-8 pb-8 border-b">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("emailVerification")}</h2>
              <p className="text-sm text-gray-600 mb-4">{t("emailVerificationDescription")}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tCommon("email")}</p>
                    <p className="text-sm text-gray-900">{session?.user?.email}</p>
                  </div>
                  {isEmailVerified ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{t("verified")}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-yellow-600 font-medium">{t("notVerified")}</span>
                  )}
                </div>
              </div>

              {!isEmailVerified && (
                <Button
                  onClick={handleSendVerification}
                  disabled={verifyingEmail}
                  variant="outline"
                  className="gap-2"
                >
                  {verifyingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tCommon("loading")}
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      {t("sendVerification")}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Lock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("changePassword")}</h2>
              <p className="text-sm text-gray-600">{t("changePasswordDescription")}</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                {t("currentPassword")}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder={t("currentPasswordPlaceholder")}
                className="mt-1.5"
              />
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                {t("newPassword")}
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder={t("newPasswordPlaceholder")}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1.5">{t("passwordHint")}</p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                {t("confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder={t("confirmPasswordPlaceholder")}
                className="mt-1.5"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {tCommon("loading")}
                  </>
                ) : (
                  t("updatePassword")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
