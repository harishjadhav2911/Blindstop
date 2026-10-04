import { NextRequest, NextResponse } from 'next/server';
import { validateAnalyzeRequest } from '@/lib/validation';
import { analyzeDecisionWithAI } from '@/lib/ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s timeout limit

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    const validation = validateAnalyzeRequest(body);
    if (!validation.isValid || !validation.sanitized) {
      return NextResponse.json(
        { error: validation.error || 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const { result, isDemoFallback } = await analyzeDecisionWithAI(validation.sanitized);

    return NextResponse.json(
      {
        success: true,
        data: result,
        isDemoFallback
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/analyze] Error handling analysis request:', error?.message || error);

    return NextResponse.json(
      {
        error: 'AI analysis is temporarily unavailable. Please try again.'
      },
      { status: 500 }
    );
  }
}
