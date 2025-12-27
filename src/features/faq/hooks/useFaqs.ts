"use client";

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { FAQ, FAQFilters } from '../types';
import { useFetch } from '@/hooks/useFetch';

export function useFaqs(filters: FAQFilters = {}) {
	const locale = useLocale();
	const { data, loading, error, fetchData } = useFetch<FAQ[]>(
		'/api/admin/faq' + (filters.activeOnly ? '?active=true' : ''),
		{
			headers: { locale },
		}
	);

	useEffect(() => {
		fetchData();
	}, [filters.activeOnly, locale]);

	return {
		faqs: data || [],
		loading,
		error,
		refresh: fetchData,
	};
}
