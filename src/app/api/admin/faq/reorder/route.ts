import { NextRequest, NextResponse } from 'next/server';
import { FAQService } from '@/features/faq/services/faq.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const faqs = body.faqs || body.services || [];
    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await FAQService.bulkUpdateOrder(faqs.map((f: any) => ({ id: Number(f.id), order: Number(f.order) })));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    return NextResponse.json({ error: 'Failed to reorder FAQs' }, { status: 500 });
  }
}
