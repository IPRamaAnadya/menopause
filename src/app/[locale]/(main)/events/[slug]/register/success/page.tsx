"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Video, 
  Mail,
  Download,
  Home,
  ArrowRight,
  CalendarPlus
} from 'lucide-react';
import { formatLocalDate } from '@/lib/datetime';

export default function RegistrationSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registration');
  const t = useTranslations('MainSite.events');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistration = async () => {
      if (!registrationId) {
        setError('Registration ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/events/registrations/${registrationId}`, {
          headers: {
            'locale': locale,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch registration details');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setRegistration(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch registration');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [registrationId, locale]);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return formatLocalDate(
      dateString, 
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      locale
    );
  };

  const generateICSFile = () => {
    if (!registration.event) return;

    const event = registration.event;
    const startDateTime = `${event.start_date}${event.start_time ? 'T' + event.start_time : 'T00:00:00'}`;
    const endDateTime = `${event.end_date}${event.end_time ? 'T' + event.end_time : 'T23:59:59'}`;
    
    const formatICSDate = (dateStr: string) => {
      return dateStr.replace(/[-:]/g, '');
    };

    const location = event.is_online 
      ? (event.meeting_url || 'Online Event')
      : (event.place_name || '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Menopause HK//Event Registration//EN',
      'BEGIN:VEVENT',
      `UID:${registration.public_id}@menopause.hk`,
      `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
      `DTSTART:${formatICSDate(startDateTime)}`,
      `DTEND:${formatICSDate(endDateTime)}`,
      `SUMMARY:${event.title || 'Event'}`,
      `DESCRIPTION:${event.short_description || ''}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `event-${registration.public_id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Skeleton className="h-32 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('registration.errorTitle')}
          </h2>
          <p className="text-gray-600 mb-6">{error || t('registration.notFound')}</p>
          <Button asChild>
            <Link href="/events">{t('backToEvents')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Success Banner */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('registration.success.title')}
          </h1>
          <p className="text-gray-600">
            {t('registration.success.description')}
          </p>
        </div>

        {/* Registration Details */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('registration.success.details')}</h2>
          
          <div className="space-y-6">
            {/* Registration ID with QR Code */}
            <div className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b border-gray-200">
              <div className="flex-1 w-full">
                <div className="text-sm text-gray-500 mb-1">
                  {t('registration.success.confirmationNumber')}
                </div>
                <div className="font-mono text-sm sm:text-base font-semibold text-gray-900 break-all">
                  {registration.public_id}
                </div>
              </div>
              
              {/* QR Code */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <QRCodeSVG 
                    value={registration.public_id}
                    size={100}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {t('registration.success.scanQR') || 'Scan for quick access'}
                </p>
              </div>
            </div>

            {/* Event Info */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                {registration.event?.title}
              </h3>
              
              <div className="space-y-3">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(registration.event?.start_date, registration.event?.start_time)}
                    </div>
                    {registration.event?.end_date !== registration.event?.start_date && (
                      <div className="text-sm text-gray-600">
                        {t('to')} {formatDateTime(registration.event?.end_date, registration.event?.end_time)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  {registration.event?.is_online ? (
                    <Video className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    {registration.event?.is_online ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {t('location.onlineEvent')}
                        </div>
                        {registration.event?.meeting_url && (
                          <a 
                            href={registration.event.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            {registration.event.meeting_url}
                          </a>
                        )}
                      </div>
                    ) : (
                      <div>
                        {registration.event?.place_name && (
                          <div className="text-sm font-medium text-gray-900">
                            {registration.event.place_name}
                          </div>
                        )}
                        {registration.event?.place_detail && (
                          <div className="text-sm text-gray-600 mt-1">
                            {registration.event.place_detail}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registrant Info */}
            <div className="pb-6 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {t('registration.success.registrantInfo')}
              </h4>
              {registration.user ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">{t('registration.form.name')}:</span>{' '}
                    <span className="font-medium">{registration.user.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">{t('registration.form.email')}:</span>{' '}
                    <span className="font-medium">{registration.user.email}</span>
                  </div>
                </div>
              ) : registration.guest ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">{t('registration.form.fullName')}:</span>{' '}
                    <span className="font-medium">{registration.guest.full_name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">{t('registration.form.email')}:</span>{' '}
                    <span className="font-medium">{registration.guest.email}</span>
                  </div>
                  {registration.guest.phone && (
                    <div className="text-sm">
                      <span className="text-gray-600">{t('registration.form.phone')}:</span>{' '}
                      <span className="font-medium">{registration.guest.phone}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Order Details */}
            <div className="pb-6 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {t('registration.success.orderDetails') || 'Order Details'}
              </h4>
              
              <div className="space-y-3">
                {/* Registration Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('registration.success.registrationStatus') || 'Registration Status'}:</span>
                  <Badge 
                    variant={registration.status === 'PAID' ? 'default' : 'secondary'}
                    className={
                      registration.status === 'PAID' 
                        ? 'bg-green-500' 
                        : registration.status === 'PENDING'
                        ? 'bg-yellow-500'
                        : ''
                    }
                  >
                    {registration.status}
                  </Badge>
                </div>

                {/* Order Number */}
                {registration.order && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('registration.success.orderNumber') || 'Order Number'}:</span>
                      <span className="text-sm font-mono font-medium">{registration.order.order_number}</span>
                    </div>

                    {/* Order Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('registration.success.orderStatus') || 'Payment Status'}:</span>
                      <Badge 
                        variant={registration.order.status === 'PAID' ? 'default' : 'secondary'}
                        className={
                          registration.order.status === 'PAID' 
                            ? 'bg-green-500' 
                            : registration.order.status === 'PENDING'
                            ? 'bg-yellow-500'
                            : ''
                        }
                      >
                        {registration.order.status}
                      </Badge>
                    </div>

                    {/* Payment Method */}
                    {registration.order.payment && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('registration.success.paymentMethod') || 'Payment Method'}:</span>
                        <span className="text-sm font-medium capitalize">{registration.order.payment.provider}</span>
                      </div>
                    )}

                    {/* Amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('registration.success.amount') || 'Amount'}:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(registration.order.gross_amount)}
                      </span>
                    </div>

                    {/* Paid Date */}
                    {registration.order.paid_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('registration.success.paidAt') || 'Paid Date'}:</span>
                        <span className="text-sm text-gray-600">{formatDate(registration.order.paid_at)}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Price for free/non-order registrations */}
                {!registration.order && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('registration.success.amount') || 'Amount'}:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(registration.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('registration.success.nextSteps')}</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-gray-700">
                {t('registration.success.emailSent')}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={generateICSFile}
            variant="outline"
            className="w-full"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            {t('details.addToCalendar')}
          </Button>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href={`/events/${resolvedParams.slug}`}>
                <ArrowRight className="w-4 h-4 mr-2" />
                {t('registration.success.viewEvent')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/events">
                <Home className="w-4 h-4 mr-2" />
                {t('registration.success.browseEvents')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
