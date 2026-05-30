import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/analytics/track
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      shop_id: string;
      event_type: 'view' | 'contact_click' | 'deal_view';
      metadata?: Record<string, unknown>;
    };

    if (!body.shop_id || !body.event_type) {
      return NextResponse.json({ error: 'shop_id, event_type 필요' }, { status: 400 });
    }

    const sb = await createServerSupabaseClient();
    await (sb as any).from('shop_analytics').insert({
      shop_id: body.shop_id,
      event_type: body.event_type,
      metadata: body.metadata ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
