"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface MembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function MembershipDialog({
  open,
  onOpenChange,
  title,
  description,
}: MembershipDialogProps) {
  const t = useTranslations('MainSite.articles');
  const { data: session } = useSession();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-0 p-0 overflow-hidden">
        <div className="text-center px-6 py-6">
          {/* Icon Container */}
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full animate-pulse"></div>
            <div className="relative flex items-center justify-center w-full h-full">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {t('memberOnly') || 'Exclusive Member Content'}
          </h2>
          
          {/* Article Info */}
          {(title || description) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              {title && (
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-gray-600 line-clamp-3">
                  {description}
                </p>
              )}
            </div>
          )}
          
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-md mx-auto">
            {t('memberOnlyDescription') || 'This premium content is reserved for our valued members. Sign in to your account or explore our membership options to unlock full access.'}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {session ? (
              // Logged in: Show only View Membership button
              <Link 
                href="/membership"
                className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {t('viewMembership') || 'View Membership Plans'}
              </Link>
            ) : (
              // Not logged in: Show only Sign In button
              <Link 
                href="/auth/signin"
                className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t('signIn') || 'Sign In'}
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
