"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth");
  const { update } = useSession();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: 'POST',
        });

        const result = await response.json();

        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Email verified successfully');
          
          // Update the session to reflect email verification
          if (update) {
            await update();
          }
          
          // Redirect to profile after 3 seconds
          setTimeout(() => {
            router.push(`/${locale}/member/profile/settings`);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to verify email');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage('Failed to verify email');
      }
    };

    verifyEmail();
  }, [searchParams, router, locale, update]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full py-12">
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Your Email
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to your profile...
            </p>
            <Link href={`/${locale}/member/profile/settings`}>
              <Button className="w-full">
                Go to Profile Now
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-8">
              {message}
            </p>
            <div className="space-y-3">
              <Link href={`/${locale}/member/profile/settings`}>
                <Button className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Resend Verification Email
                </Button>
              </Link>
              <Link href={`/${locale}/member/profile`}>
                <Button className="w-full" variant="outline">
                  Back to Profile
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
