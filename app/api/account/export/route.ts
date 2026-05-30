/**
 * GET /api/account/export
 * 개인정보보호법 제35조 — 개인정보 열람권 (데이터 다운로드)
 * 유저 본인의 모든 데이터를 JSON으로 반환
 */
export const dynamic = 'force-dynamic';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createServerSupabaseClient() as any;
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user)
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    // 병렬로 본인 데이터 전부 수집
    const [profile, analyses, lizards, wishlists, passports, consents] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('morph_analyses').select('id, result, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('user_lizards').select('*, weight_records(*)').eq('user_id', user.id),
      supabase.from('wishlists').select('*, animals(name, morph, price)').eq('user_id', user.id),
      supabase.from('passports').select('*, animals(name, morph), shops(name)').eq('owner_id', user.id),
      supabase.from('consent_logs').select('consent_type, agreed, version, created_at').eq('user_id', user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      notice: '이 파일은 귀하의 개인정보보호법 제35조에 따른 개인정보 열람 요청에 의해 생성되었습니다.',
      account: {
        id:         user.id,
        email:      user.email,
        created_at: user.created_at,
        provider:   user.app_metadata?.provider,
      },
      profile:       profile.data,
      morph_analyses: analyses.data ?? [],
      my_lizards:    lizards.data ?? [],
      wishlists:     wishlists.data ?? [],
      passports:     passports.data ?? [],
      consent_logs:  consents.data ?? [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="glint-archive-my-data-${new Date().toISOString().slice(0,10)}.json"`,
      },
    });

  } catch (err) {
    console.error('Data export error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
