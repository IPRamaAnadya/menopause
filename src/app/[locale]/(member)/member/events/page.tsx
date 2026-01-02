"use client";

import { useState } from 'react';
import { EventsPageHeader } from '@/components/main/EventsPageHeader';
import { EventsFilter } from '@/components/main/EventsFilter';
import { MemberEventsGrid } from '@/components/lounge/MemberEventsGrid';
import { HighlightedEventsSection } from '@/components/main/HighlightedEventsSection';

export default function MemberEventsPage() {
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [locationFilter, setLocationFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen">
      <EventsPageHeader />
      <HighlightedEventsSection />
      <EventsFilter
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        search={search}
        onSearchChange={setSearch}
      />
      <MemberEventsGrid
        timeFilter={timeFilter}
        locationFilter={locationFilter}
        paymentFilter={paymentFilter}
        search={search}
      />
    </div>
  );
}
