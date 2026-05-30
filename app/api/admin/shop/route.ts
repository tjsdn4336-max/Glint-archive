import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/admin/shop — 내 샵 정보 조회
export async function GET() {
  const sb = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba = sb as any;
  const { data: { user } } = await sba.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const { data: shop } = await sba.from('shops').select('*').eq('owner_id', user.id).maybeSingle();
  return NextResponse.json({ shop });
}

// PATCH /api/admin/shop — 내 샵 정보 수정
export async function PATCH(req: NextRequest) {
  const sb = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba = sb as any;
  const { data: { user } } = await sba.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const body = await req.json();
  const allowed = ['name','description','opening_hours','website_url',
                   'instagram_url','kakao_channel_url','thumbnail_url','images','tags','phone','address'];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];

  const { data, error } = await sba.from('shops').update(update).eq('owner_id', user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ shop: data });
}
