import { NextRequest, NextResponse } from 'next/server';
import { FAQService } from '@/features/faq/services/faq.service';

// GET /api/admin/faq - Get all FAQs (admin, can filter by active)
export async function GET(request: NextRequest) {
  try {
    const locale = request.headers.get('locale') || undefined;
    const activeOnly = request.nextUrl.searchParams.get('active') === 'true';
    const faqs = await FAQService.getFAQs({ activeOnly, locale });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/faq - Create FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const faq = await FAQService.createFAQ(body);
    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}
