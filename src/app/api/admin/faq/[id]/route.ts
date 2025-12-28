import { NextRequest, NextResponse } from 'next/server';
import { FAQService } from '@/features/faq/services/faq.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    const body = await request.json();
    const faq = await FAQService.updateFAQ(id, body);
    return successResponse(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return ApiErrors.internal('Failed to update FAQ');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    await FAQService.deleteFAQ(id);
    return successResponse({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return ApiErrors.internal('Failed to delete FAQ');
  }
}
