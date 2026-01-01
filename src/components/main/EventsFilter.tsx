"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface EventsFilterProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function EventsFilter({
  timeFilter,
  onTimeFilterChange,
  locationFilter,
  onLocationFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  search,
  onSearchChange,
}: EventsFilterProps) {
  const t = useTranslations('MainSite.events');

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20 py-8 border-t border-gray-200">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Time Filter */}
          <Select value={timeFilter} onValueChange={onTimeFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.time')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allTime')}</SelectItem>
              <SelectItem value="upcoming">{t('filters.upcoming')}</SelectItem>
              <SelectItem value="ongoing">{t('filters.ongoing')}</SelectItem>
              <SelectItem value="passed">{t('filters.passed')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select value={locationFilter} onValueChange={onLocationFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.location')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allLocation')}</SelectItem>
              <SelectItem value="online">{t('filters.online')}</SelectItem>
              <SelectItem value="offline">{t('filters.offline')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Filter */}
          <Select value={paymentFilter} onValueChange={onPaymentFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.payment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allPayment')}</SelectItem>
              <SelectItem value="paid">{t('filters.paid')}</SelectItem>
              <SelectItem value="free">{t('filters.free')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
