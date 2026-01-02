"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2, Mail, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/features/profile/hooks/useProfile";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations("Lounge.profile");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { profile, loading: profileLoading, updateProfile, fetchProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    is_hidden: false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        profession: profile.profession || "",
        is_hidden: profile.is_hidden,
      });
      // Check if email is verified
      setIsEmailVerified(profile.email_verified !== null && profile.email_verified !== undefined);
    }
  }, [profile]);

  // Refresh profile when page gains focus (e.g., after email verification)
  useEffect(() => {
    const handleFocus = () => {
      fetchProfile();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProfile]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: tCommon("toast.error"),
        description: t("invalidImageType"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: tCommon("toast.error"),
        description: t("imageTooLarge"),
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/member/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: tCommon("toast.success"),
          description: t("photoUpdated"),
        });
        // Refresh profile data
        await fetchProfile();
      } else {
        toast({
          title: tCommon("toast.error"),
          description: result.error?.message || t("photoUpdateFailed"),
          variant: "destructive",
        });
        setPreviewImage(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: tCommon("toast.error"),
        description: t("photoUpdateFailed"),
        variant: "destructive",
      });
      setPreviewImage(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateProfile({
      name: formData.name || undefined,
      profession: formData.profession || undefined,
      is_hidden: formData.is_hidden,
    });

    setSaving(false);

    if (result.success) {
      toast({
        title: tCommon("toast.success"),
        description: t("settingsUpdated"),
      });
    } else {
      toast({
        title: tCommon("toast.error"),
        description: result.error || t("settingsUpdateFailed"),
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b">
          <Link
            href="/member/profile"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon("back")}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t("changeProfileSettings")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("settingsDescription")}</p>
        </div>

        {/* Profile Image */}
        <div className="mb-8 pb-8 border-b">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 object-cover">
                <AvatarImage src={previewImage || profile?.image || undefined} className="object-cover"/>
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {getInitials(profile?.name || session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{t("profilePhoto")}</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handlePhotoClick}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
                {uploading ? tCommon("uploading") : t("changePhoto")}
              </Button>
              <p className="text-xs text-gray-500 mt-2">{t("photoHint")}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              {t("name")}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("namePlaceholder")}
              className="mt-1.5"
            />
          </div>

          {/* Profession */}
          <div>
            <Label htmlFor="profession" className="text-sm font-medium text-gray-700">
              {t("profession")}
            </Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder={t("professionPlaceholder")}
              className="mt-1.5"
            />
            <p className="text-xs text-gray-500 mt-1.5">{t("professionHint")}</p>
          </div>

          {/* Email (read-only) */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {tCommon("email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="mt-1.5 bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1.5">{t("emailCannotChange")}</p>
          </div>

          {/* Privacy Setting */}
          <div className="py-6 border-t">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="is_hidden"
                checked={formData.is_hidden}
                onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <Label htmlFor="is_hidden" className="text-sm font-medium text-gray-900 cursor-pointer">
                  {t("hideProfile")}
                </Label>
                <p className="text-xs text-gray-500 mt-1">{t("hideProfileDescription")}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tCommon("saving")}
                </>
              ) : (
                t("saveChanges")
              )}
            </Button>
          </div>
        </form>

        {/* Email Verification Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-start gap-4 mb-6">
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
                    <p className="text-sm text-gray-900">{profile?.email || session?.user?.email}</p>
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
        <div className="mt-12 pt-8 border-t">
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
