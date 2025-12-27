import { NextRequest, NextResponse } from 'next/server';
import { FAQService } from '@/features/faq/services/faq.service';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    const body = await request.json();
    const faq = await FAQService.updateFAQ(id, body);
    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    await FAQService.deleteFAQ(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
