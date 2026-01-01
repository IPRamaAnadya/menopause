"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Video
} from 'lucide-react';
import { EventWithTranslations } from '@/features/event/types';
import { usePublicMembershipLevels } from '@/features/membership/hooks/usePublicMembershipLevels';
import { formatLocalDate } from '@/lib/datetime';

export default function EventRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations('MainSite.events');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { membershipLevels, loading: levelsLoading } = usePublicMembershipLevels();
  
  const [event, setEvent] = useState<EventWithTranslations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userMembershipLevelId, setUserMembershipLevelId] = useState<number | null>(null);

  // Guest registration form
  const [guestForm, setGuestForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/events/${resolvedParams.slug}`, {
          headers: {
            'locale': locale,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Event not found');
          }
          throw new Error('Failed to fetch event');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setEvent(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch event');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [resolvedParams.slug, locale]);

  // Fetch user's membership level if logged in
  useEffect(() => {
    const fetchUserMembership = async () => {
      // Don't fetch if session is still loading or user is not authenticated
      if (sessionStatus === 'loading' || sessionStatus === 'unauthenticated' || !session?.user?.id) {
        setUserMembershipLevelId(null);
        return;
      }

      try {
        const response = await fetch('/api/user/membership');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.membership_level_id) {
            setUserMembershipLevelId(result.data.membership_level_id);
          }
        }
      } catch (error) {
        console.error('Error fetching user membership:', error);
      }
    };

    fetchUserMembership();
  }, [session, sessionStatus]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (date: string, time: string | null) => {
    const formattedDate = formatLocalDate(
      date, 
      { year: 'numeric', month: 'short', day: 'numeric' },
      locale
    );
    if (time) {
      return `${formattedDate} • ${time}`;
    }
    return formattedDate;
  };

  const getMembershipLevelName = (id: number | null | undefined) => {
    if (id === null || id === undefined) return t('pricing.public');
    const level = membershipLevels.find(l => l.id === id);
    return level?.name || 'Unknown';
  };

  const getUserPrice = () => {
    if (!event?.prices || event.prices.length === 0) {
      console.log('[Registration] No prices available for event');
      return null;
    }
    
    console.log('[Registration] Available prices:', event.prices);
    console.log('[Registration] User membership level:', userMembershipLevelId);
    
    // If user is logged in and has membership
    if (userMembershipLevelId) {
      const memberPrice = event.prices.find(p => p.membership_level_id === userMembershipLevelId);
      if (memberPrice) {
        console.log('[Registration] Found member price:', memberPrice);
        return memberPrice;
      }
      console.log('[Registration] No matching member price, falling back to public price');
    }
    
    // Otherwise return public price (membership_level_id === null)
    const publicPrice = event.prices.find(p => p.membership_level_id === null);
    if (publicPrice) {
      console.log('[Registration] Found public price:', publicPrice);
      return publicPrice;
    }
    
    // Last resort: return first available price
    console.log('[Registration] Using first available price:', event.prices[0]);
    return event.prices[0];
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!session) {
      if (!guestForm.fullName.trim()) {
        errors.fullName = tCommon('form.required');
      }
      if (!guestForm.email.trim()) {
        errors.email = tCommon('form.required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email)) {
        errors.email = tCommon('form.invalidEmail');
      }
      if (!guestForm.phone.trim()) {
        errors.phone = tCommon('form.required');
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!event) return;

    setSubmitting(true);
    setError(null);

    try {
      const userPrice = getUserPrice();
      
      // If no price found, treat as free event with price 0
      const finalPrice = userPrice?.price ?? 0;
      const membershipLevelId = userPrice?.membership_level_id ?? null;
      
      console.log('[Registration] Submitting with price:', finalPrice, 'membership level:', membershipLevelId);

      const registrationData: any = {
        event_id: event.id,
        membership_level_id: membershipLevelId,
      };

      // Add guest info if not logged in
      if (!session) {
        registrationData.guest = {
          full_name: guestForm.fullName,
          email: guestForm.email,
          phone: guestForm.phone,
        };
      }

      // If the event is free or no price configured, create registration directly
      if (!event.is_paid || finalPrice === 0) {
        const response = await fetch('/api/events/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const errorMessage = result.error?.message || result.message || 'Registration failed';
          // Show specific message for already registered
          if (errorMessage === 'Already registered') {
            throw new Error(t('registration.alreadyRegistered'));
          }
          throw new Error(errorMessage);
        }

        // Ensure we have the required data
        if (!result.data?.public_id) {
          console.error('Invalid registration response:', result);
          throw new Error('Registration created but missing confirmation details');
        }

        // Redirect to success page
        router.push(`/events/${resolvedParams.slug}/register/success?registration=${result.data.public_id}`);
      } else {
        // For paid events, redirect to checkout (use public endpoint for both guest and member)
        const response = await fetch('/api/events/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'locale': locale,
          },
          body: JSON.stringify(registrationData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const errorMessage = result.error?.message || result.message || 'Checkout failed';
          // Show specific message for already registered
          if (errorMessage === 'Already registered') {
            throw new Error(t('registration.alreadyRegistered'));
          }
          throw new Error(errorMessage);
        }

        // Ensure we have the required data
        if (!result.data) {
          console.error('Invalid checkout response:', result);
          throw new Error('Checkout created but missing details');
        }

        // Redirect to payment or success page
        if (result.data.url || result.data.payment_url) {
          window.location.href = result.data.url || result.data.payment_url;
        } else if (result.data.registrationPublicId || result.data.registration?.public_id) {
          const publicId = result.data.registrationPublicId || result.data.registration.public_id;
          router.push(`/events/${resolvedParams.slug}/register/success?registration=${publicId}`);
        } else {
          console.error('Unexpected checkout response structure:', result.data);
          throw new Error('Invalid response from checkout');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Skeleton className="h-10 w-32 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl mb-8" />
          <div className="max-w-xl">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Button variant="ghost" size="sm" asChild className="mb-8">
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToEvents')}
            </Link>
          </Button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Event not found'}
          </div>
        </div>
      </div>
    );
  }

  const userPrice = getUserPrice();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link href={`/events/${resolvedParams.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('registration.backToEvent')}
          </Link>
        </Button>

        {/* Event Image */}
        {event.image_url && (
          <div className="relative w-full h-64 bg-gray-200 rounded-2xl overflow-hidden mb-8">
            <Image
              src={event.image_url}
              alt={event.title || 'Event image'}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Event Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{event.title}</h1>
          {event.short_description && (
            <p className="text-lg text-gray-600">{event.short_description}</p>
          )}
        </div>

        {/* Event Details */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8 pb-8 border-b">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {formatDateTime(event.start_date, event.start_time)}
              </div>
              {event.end_date !== event.start_date && (
                <div className="text-sm text-gray-600">
                  {t('to')} {formatDateTime(event.end_date, event.end_time)}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            {event.is_online ? (
              <Video className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <MapPin className="w-5 h-5 text-primary shrink-0" />
            )}
            <div className="text-sm text-gray-900">
              {event.is_online ? t('location.onlineEvent') : event.place_name}
            </div>
          </div>
        </div>

        {/* Pricing */}
        {userPrice && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {getMembershipLevelName(userPrice.membership_level_id)}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {userPrice.price === 0 ? t('pricing.free') : formatPrice(userPrice.price)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('registration.title')}</h2>
            <p className="text-gray-600 mb-8">{t('registration.subtitle')}</p>
          
            <form onSubmit={handleSubmit} className="space-y-6">
              {session ? (
                /* Logged in user info */
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {t('registration.registeringAs')}
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {session.user?.name || session.user?.email}
                      </p>
                      {userMembershipLevelId && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">
                            {t('registration.membershipActive')}
                          </p>
                          <p className="text-sm font-semibold text-blue-700">
                            {getMembershipLevelName(userMembershipLevelId)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Guest registration form */
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {t('registration.guestInfo')} <Link href="/auth/signin" className="text-primary font-semibold underline hover:no-underline">{t('registration.login')}</Link>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                        {t('registration.form.fullName')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={guestForm.fullName}
                        onChange={(e) => setGuestForm({ ...guestForm, fullName: e.target.value })}
                        placeholder={t('registration.form.fullNamePlaceholder')}
                        className="mt-2 h-12 text-base"
                        disabled={submitting}
                      />
                      {formErrors.fullName && (
                        <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                        {t('registration.form.email')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestForm.email}
                        onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                        placeholder={t('registration.form.emailPlaceholder')}
                        className="mt-2 h-12 text-base"
                        disabled={submitting}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-900">
                        {t('registration.form.phone')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={guestForm.phone}
                        onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                        placeholder={t('registration.form.phonePlaceholder')}
                        className="mt-2 h-12 text-base"
                        disabled={submitting}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-base font-semibold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {tCommon('loading')}
                    </div>
                  ) : event.is_paid && userPrice && (userPrice.price ?? 0) > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      {t('registration.proceedToPayment')}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('registration.confirmRegistration')}
                    </div>
                  )}
                </Button>

                {!session && (
                  <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
                    {t('registration.agreement')}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
