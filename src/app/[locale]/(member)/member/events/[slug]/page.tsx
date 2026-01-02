"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  DollarSign,
  Check,
  Share2,
  UserCircle,
  Info,
  Globe,
  Navigation,
  ExternalLink,
  Star,
  Mail
} from 'lucide-react';
import { EventWithTranslations } from '@/features/event/types';
import { usePublicMembershipLevels } from '@/features/membership/hooks/usePublicMembershipLevels';
import { formatLocalDate } from '@/lib/datetime';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations('MainSite.events');
  const locale = useLocale();
  const { data: session } = useSession();
  const { membershipLevels } = usePublicMembershipLevels();
  const [event, setEvent] = useState<EventWithTranslations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMembershipLevelId, setUserMembershipLevelId] = useState<number | null>(null);

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
      if (!session?.user?.id) {
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
  }, [session]);

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

  const getHighestPrice = () => {
    if (!event?.prices || event.prices.length === 0) return null;
    return event.prices.reduce((highest, current) => 
      current.price > highest.price ? current : highest
    );
  };

  const getUserPrice = () => {
    if (!event?.prices || event.prices.length === 0) return null;
    
    // If user is logged in and has membership
    if (userMembershipLevelId) {
      const memberPrice = event.prices.find(p => p.membership_level_id === userMembershipLevelId);
      if (memberPrice) return memberPrice;
    }
    
    // Otherwise always return public price (null membership_level_id)
    const publicPrice = event.prices.find(p => p.membership_level_id === null);
    return publicPrice || event.prices[0];
  };

  const getCheaperPrices = () => {
    if (!event?.prices || event.prices.length === 0) return [];
    
    const userPrice = getUserPrice();
    if (!userPrice) return [];
    
    // Get all prices that are cheaper than user's price
    return event.prices
      .filter(p => p !== userPrice && p.price < userPrice.price)
      .sort((a, b) => a.price - b.price); // Sort by price ascending (cheapest first)
  };

  const getComparisonPrice = () => {
    if (!event?.prices || event.prices.length === 0) return null;
    
    const userPrice = getUserPrice();
    if (!userPrice) return null;
    
    // Get public price first, if not available or same as user price, get highest price
    const publicPrice = event.prices.find(p => p.membership_level_id === null);
    
    if (publicPrice && publicPrice.price > userPrice.price) {
      return publicPrice;
    }
    
    // Otherwise get highest price if it's higher than user's price
    const highestPrice = getHighestPrice();
    if (highestPrice && highestPrice.price > userPrice.price) {
      return highestPrice;
    }
    
    return null;
  };

  const generateGoogleCalendarUrl = () => {
    if (!event) return '';
    
    // Format dates for Google Calendar (YYYYMMDDTHHMMSS)
    const formatGoogleDate = (date: string, time: string | null) => {
      const d = new Date(date);
      const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = time ? time.replace(/:/g, '') + '00' : '000000';
      return `${dateStr}T${timeStr}`;
    };

    const startDate = formatGoogleDate(event.start_date, event.start_time);
    const endDate = formatGoogleDate(event.end_date, event.end_time);
    
    const location = event.is_online 
      ? 'Online Event' 
      : event.place_name || event.place_details || '';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title || '',
      dates: `${startDate}/${endDate}`,
      details: event.short_description || '',
      location: location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.short_description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-[500px] w-full rounded-lg" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-96 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link href="/member/events">
              {t('backToEvents')}
            </Link>
          </Button>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'Event not found' ? t('notFound') : t('errorLoading')}
            </h1>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const userPrice = getUserPrice();
  const cheaperPrices = getCheaperPrices();
  const comparisonPrice = getComparisonPrice();
  const hasCoordinates = event.latitude && event.longitude;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Back Button & Share */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/member/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToEvents')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            {t('share')}
          </Button>
        </div>

        {/* Main Layout - Two Columns */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="overflow-hidden">
              {event.image_url && (
                <div className="relative w-full h-[500px] bg-gray-200 rounded-4xl overflow-hidden">
                  <Image
                    src={event.image_url}
                    alt={event.title || 'Event image'}
                    fill
                    className="object-cover"
                    priority
                  />
                  {event.is_highlighted && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        {t('featured')}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <div className="p-8">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.is_online && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Video className="w-3 h-3 mr-1" />
                      {t('badges.online')}
                    </Badge>
                  )}
                  {!event.is_online && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <MapPin className="w-3 h-3 mr-1" />
                      {t('badges.inPerson')}
                    </Badge>
                  )}
                  {event.is_paid ? (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {t('badges.paid')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3 mr-1" />
                      {t('badges.free')}
                    </Badge>
                  )}
                  {event.is_public ? (
                    <Badge variant="secondary" className="bg-sky-100 text-sky-800">
                      <Globe className="w-3 h-3 mr-1" />
                      {t('badges.public')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      <Users className="w-3 h-3 mr-1" />
                      {t('badges.membersOnly')}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                {/* Short Description */}
                {event.short_description && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {event.short_description}
                  </p>
                )}

                <Separator className="my-6" />

                {/* Event Details Grid */}
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t('details.dateTime')}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(event.start_date, event.start_time)}
                      </div>
                      {event.end_date !== event.start_date && (
                        <div className="text-sm text-gray-600">
                          {t('to')} {formatDateTime(event.end_date, event.end_time)}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        asChild
                      >
                        <a 
                          href={generateGoogleCalendarUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {t('details.addToCalendar')}
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Duration */}
                  {event.start_time && event.end_time && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {t('details.duration')}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {event.start_time} - {event.end_time}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {event.is_online ? (
                        <Video className="w-5 h-5 text-primary" />
                      ) : (
                        <MapPin className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t('details.location')}
                      </div>
                      {event.is_online ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {t('location.onlineEvent')}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {event.place_name || t('details.venue')}
                          </div>
                          {event.place_details && (
                            <div className="text-sm text-gray-600 mt-1">
                              {event.place_details}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Capacity */}
                  {event.capacity && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {t('details.capacity')}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {event.capacity} {t('details.participants')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            {event.description && (
              <Card className="shadow-none border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    {t('about')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Map Section */}
            {!event.is_online && hasCoordinates && (
              <Card className="shadow-none border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {t('map.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                    <MapContainer
                      center={[event.latitude!, event.longitude!]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[event.latitude!, event.longitude!]}>
                        <Popup>
                          <strong>{event.title}</strong>
                          {event.place_name && <div>{event.place_name}</div>}
                          {event.place_details && <div className="text-sm text-gray-600">{event.place_details}</div>}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        {t('map.getDirections')}
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <a 
                        href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        {t('map.openInMaps')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-24 shadow-none border-gray-100">
              <CardHeader>
                <CardTitle>{t('registration.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing Section */}
                {event.is_paid && event.prices && event.prices.length > 0 ? (
                  <div className="space-y-4">
                    {/* User's Current Price */}
                    {userPrice && (
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-bold text-sm">
                            {getMembershipLevelName(userPrice.membership_level_id)}
                          </span>
                        </div>
                        {/* Show comparison price if available */}
                        {comparisonPrice && (
                          <div className="mb-1">
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(comparisonPrice.price)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-bold text-primary">
                            {formatPrice(userPrice.price)}
                          </span>
                          {userPrice.quota && (
                            <span className="text-xs text-gray-500">
                              {t('pricing.quota')}: {userPrice.quota}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {userPrice.membership_level_id === null 
                            ? t('pricing.publicDescription') 
                            : t('pricing.yourPrice')}
                        </p>
                      </div>
                    )}

                    {/* Cheaper Membership Prices */}
                    {cheaperPrices.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          {t('pricing.cheaperPrices')}
                        </div>
                        <div className="space-y-2">
                          {cheaperPrices.map((price, index) => (
                            <div 
                              key={index}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {getMembershipLevelName(price.membership_level_id)}
                                </span>
                                <span className="text-lg font-semibold text-gray-900">
                                  {formatPrice(price.price)}
                                </span>
                              </div>
                              {price.quota && (
                                <span className="text-xs text-gray-500">
                                  {t('pricing.quota')}: {price.quota}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {t('pricing.free')}
                    </div>
                    <p className="text-sm text-gray-600">{t('pricing.freeDescription')}</p>
                  </div>
                )}

                <Button size="lg" className="w-full" asChild>
                  <Link href={`/member/events/${resolvedParams.slug}/register`}>
                    {t('register')}
                  </Link>
                </Button>

                {session ? (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link href="/member/subscription">
                      {t('registration.upgradeMembership')}
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link href="/auth/signin">
                      {t('registration.joinMembership')}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Organizer Info */}
            {event.creator && (
              <Card className="shadow-none border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserCircle className="w-5 h-5" />
                    {t('organizer.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {event.creator.name}
                        </div>
                        {event.creator.email && (
                          <a 
                            href={`mailto:${event.creator.email}`}
                            className="text-sm text-gray-600 hover:text-primary inline-flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {event.creator.email}
                          </a>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div className="text-sm text-gray-600">
                      {t('organizer.description')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
