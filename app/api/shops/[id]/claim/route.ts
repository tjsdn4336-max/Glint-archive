import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/shops/[id]/claim — 카카오 샵을 내 샵으로 클레임
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba = sb as any;

  const { data: { user } } = await sba.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  // 이미 다른 사람이 클레임했는지 확인
  const { data: existing } = await sba
    .from('shops')
    .select('id, owner_id')
    .eq('kakao_place_id', id)
    .maybeSingle();

  const ex = existing as { id: string; owner_id: string | null } | null;
  if (ex?.owner_id && ex.owner_id !== user.id) {
    return NextResponse.json({ error: '이미 다른 사장님이 등록한 샵입니다.' }, { status: 409 });
  }

  const body = await req.json() as {
    name: string; address: string; phone?: string; region?: string;
    lat?: number; lng?: number; description?: string; opening_hours?: string;
    website_url?: string; instagram_url?: string; kakao_channel_url?: string;
  };

  if (!body.name) return NextResponse.json({ error: '샵 이름이 필요합니다.' }, { status: 400 });

  const payload = {
    kakao_place_id: id,
    owner_id: user.id,
    claimed_at: new Date().toISOString(),
    name: body.name,
    address: body.address,
    phone: body.phone ?? null,
    region: body.region ?? null,
    lat: body.lat ?? null,
    lng: body.lng ?? null,
    description: body.description ?? null,
    opening_hours: body.opening_hours ?? null,
    website_url: body.website_url ?? null,
    instagram_url: body.instagram_url ?? null,
    kakao_channel_url: body.kakao_channel_url ?? null,
    is_verified: false,
    plan: 'free',
  };

  let data, error;
  if (ex) {
    ({ data, error } = await sba.from('shops').update(payload).eq('id', ex.id).select().single());
  } else {
    ({ data, error } = await sba.from('shops').insert(payload).select().single());
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ shop: data });
}
