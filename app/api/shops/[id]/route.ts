import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/shops/[id] — 카카오 ID로 샵 정보 조회 (DB 클레임 데이터 포함)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba = sb as any;
  const { data } = await sba.from('shops').select('*').eq('kakao_place_id', id).maybeSingle();
  return NextResponse.json({ shop: data });
}

// PATCH /api/shops/[id] — 샵 정보 수정 (오너만)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba = sb as any;
  const { data: { user } } = await sba.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const body = await req.json();
  const allowed = ['name','description','opening_hours','website_url','instagram_url',
                   'kakao_channel_url','thumbnail_url','images','tags','phone','address'];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];

  const { data, error } = await sba
    .from('shops').update(update).eq('kakao_place_id', id).eq('owner_id', user.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ shop: data });
}
