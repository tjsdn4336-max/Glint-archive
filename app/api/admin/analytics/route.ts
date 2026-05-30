import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/admin/analytics?period=7|30
export async function GET(req: NextRequest) {
  const sb = await createServerSupabaseClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: shop } = await (sb as any)
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!shop) return NextResponse.json({ error: '샵 없음' }, { status: 404 });

  const period = parseInt(req.nextUrl.searchParams.get('period') ?? '30', 10);
  const since = new Date(Date.now() - period * 86400000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (sb as any)
    .from('shop_analytics')
    .select('event_type, created_at')
    .eq('shop_id', shop.id)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ev = (events ?? []) as any[];
  const views = ev.filter((e: any) => e.event_type === 'view').length;
  const contacts = ev.filter((e: any) => e.event_type === 'contact_click').length;
  const dealViews = ev.filter((e: any) => e.event_type === 'deal_view').length;

  // 일별 집계
  const byDay: Record<string, { views: number; contacts: number }> = {};
  ev.forEach((e: any) => {
    const day = e.created_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = { views: 0, contacts: 0 };
    if (e.event_type === 'view') byDay[day].views++;
    if (e.event_type === 'contact_click') byDay[day].contacts++;
  });

  return NextResponse.json({ views, contacts, dealViews, byDay, period });
}
