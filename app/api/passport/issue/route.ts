import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { animal_id, owner_id } = await req.json() as { animal_id: string; owner_id?: string };

    if (!animal_id) {
      return NextResponse.json({ error: 'animal_id는 필수입니다.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    // 1. 중복 확인
    const { data: existing } = await sb
      .from('passports')
      .select('id')
      .eq('animal_id', animal_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '이미 발급된 패스포트입니다.' }, { status: 409 });
    }

    // 2. 올해 발급 건수 조회 → 채번
    const year = new Date().getFullYear();
    const startOfYear = `${year}-01-01T00:00:00.000Z`;
    const { count } = await sb
      .from('passports')
      .select('*', { count: 'exact', head: true })
      .gte('issued_at', startOfYear);

    const seq = String((count ?? 0) + 1).padStart(5, '0');
    const passport_number = `GA-${year}-${seq}`;

    // 3. animal에서 shop_id 조회
    const { data: animal } = await sb
      .from('animals')
      .select('shop_id')
      .eq('id', animal_id)
      .single();

    if (!animal) {
      return NextResponse.json({ error: '개체를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 4. 패스포트 INSERT
    const issued_at = new Date().toISOString();
    const { error: insertErr } = await sb.from('passports').insert({
      animal_id,
      shop_id:         animal.shop_id ?? null,
      owner_id:        owner_id ?? null,
      passport_number,
      issued_at,
      health_notes:    '',
    });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // 5. animal status → 'sold'
    await sb.from('animals').update({ status: 'sold' }).eq('id', animal_id);

    return NextResponse.json({ passport_number, issued_at });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
