import { NextRequest, NextResponse } from 'next/server';
import { FAQService } from '@/features/faq/services/faq.service';

// GET /api/public/faq - Get all active FAQs (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    const locale = request.headers.get('locale') || undefined;
    const faqs = await FAQService.getFAQs({ activeOnly: true, locale });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
