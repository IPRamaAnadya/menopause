import { NextRequest, NextResponse } from 'next/server';
import { FAQService } from '@/features/faq/services/faq.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const faqs = body.faqs || body.services || [];
    if (!Array.isArray(faqs)) {
      return ApiErrors.validation({ faqs: 'Must be an array' }, 'Invalid payload');
    }
    await FAQService.bulkUpdateOrder(faqs.map((f: any) => ({ id: Number(f.id), order: Number(f.order) })));
    return successResponse({ success: true });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    return ApiErrors.internal('Failed to reorder FAQs');
  }
}
