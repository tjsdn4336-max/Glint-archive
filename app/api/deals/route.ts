import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export interface DealResult {
  id: string;
  shop_id: string;
  shop_name: string;
  title: string;
  description: string | null;
  animal_type: string | null;
  morph: string | null;
  price: number;
  original_price: number | null;
  quantity: number;
  remaining: number;
  image_url: string | null;
  contact_type: string;
  contact_value: string | null;
  status: string;
  ends_at: string | null;
  created_at: string;
}

// GET /api/deals — 활성 딜 목록
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const animalType = searchParams.get('animal_type');
  const shopId = searchParams.get('shop_id');
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);

  const sb = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba = sb as any;

  let q = sba.from('deals').select('*').eq('status', 'active')
    .order('created_at', { ascending: false }).limit(limit);
  if (animalType) q = q.eq('animal_type', animalType);
  if (shopId) q = q.eq('shop_id', shopId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deals: data ?? [] });
}

// POST /api/deals — 딜 생성 (샵 오너만)
export async function POST(req: NextRequest) {
  const sb = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba = sb as any;
  const { data: { user } } = await sba.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

  const { data: shop } = await sba.from('shops').select('id, name').eq('owner_id', user.id).maybeSingle();
  if (!shop) return NextResponse.json({ error: '등록된 샵이 없습니다.' }, { status: 403 });

  const body = await req.json();
  const { title, description, animal_type, morph, price, original_price,
          quantity, image_url, contact_type, contact_value, ends_at } = body;

  if (!title || !price) {
    return NextResponse.json({ error: '제목과 가격은 필수입니다.' }, { status: 400 });
  }

  const { data, error } = await sba.from('deals').insert({
    shop_id: shop.id,
    shop_name: shop.name,
    title,
    description: description ?? null,
    animal_type: animal_type ?? null,
    morph: morph ?? null,
    price: Number(price),
    original_price: original_price ? Number(original_price) : null,
    quantity: Number(quantity ?? 1),
    remaining: Number(quantity ?? 1),
    image_url: image_url ?? null,
    contact_type: contact_type ?? 'kakao',
    contact_value: contact_value ?? null,
    ends_at: ends_at ?? null,
    status: 'active',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deal: data }, { status: 201 });
}
