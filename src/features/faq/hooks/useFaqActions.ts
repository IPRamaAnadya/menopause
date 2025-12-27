"use client";

import { useState } from 'react';
import { toast } from 'react-toastify';

export function useFaqActions(onSuccess?: () => void) {
	const [loading, setLoading] = useState(false);

	const createFaq = async (faqData: any) => {
		setLoading(true);
		try {
			const response = await fetch('/api/admin/faq', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(faqData),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create FAQ');
			}
			const faq = await response.json();
			toast.success('FAQ created successfully');
			onSuccess?.();
			return faq;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create FAQ';
			toast.error(message);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const updateFaq = async (id: number, faqData: any) => {
		setLoading(true);
		try {
			const response = await fetch(`/api/admin/faq/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(faqData),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update FAQ');
			}
			const faq = await response.json();
			toast.success('FAQ updated successfully');
			onSuccess?.();
			return faq;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update FAQ';
			toast.error(message);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const deleteFaq = async (id: number) => {
		if (!confirm('Are you sure you want to delete this FAQ?')) {
			return;
		}
		setLoading(true);
		try {
			const response = await fetch(`/api/admin/faq/${id}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete FAQ');
			}
			toast.success('FAQ deleted successfully');
			onSuccess?.();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to delete FAQ';
			toast.error(message);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	return {
		createFaq,
		updateFaq,
		deleteFaq,
		loading,
	};
}
