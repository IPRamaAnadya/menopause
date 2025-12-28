import { NextRequest, NextResponse } from 'next/server';
import { FAQService } from '@/features/faq/services/faq.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/public/faq - Get all active FAQs (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    const locale = request.headers.get('locale') || undefined;
    const faqs = await FAQService.getFAQs({ activeOnly: true, locale });
    return successResponse(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return ApiErrors.internal('Failed to fetch FAQs');
  }
}
