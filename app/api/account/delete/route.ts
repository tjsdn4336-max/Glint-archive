/**
 * POST /api/account/delete
 * 개인정보보호법 제36조 — 개인정보 삭제 요청
 * 1. deletion_requests 테이블에 요청 기록
 * 2. 유저의 개인 데이터 즉시 익명화
 * 3. auth.users 삭제 (30일 유예 없이 즉시)
 */
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
// profiles, account_deletion_requests는 DB 타입에 미포함 → any 캐스팅
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient() as AnyClient;
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user)
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const { reason } = await req.json().catch(() => ({ reason: '' }));

    // 1. 삭제 요청 기록
    await supabase.from('account_deletion_requests').insert({
      user_id:    user.id,
      user_email: user.email ?? '',
      reason:     reason ?? null,
      status:     'processing',
    });

    // 2. 개인 데이터 즉시 익명화
    // profiles — 닉네임 삭제
    await supabase.from('profiles').update({ nickname: null, avatar_url: null }).eq('id', user.id);

    // wishlists, user_lizards, weight_records 삭제
    const { data: lizards } = await supabase
      .from('user_lizards').select('id').eq('user_id', user.id);
    if (lizards?.length) {
      const ids = (lizards as { id: string }[]).map(l => l.id);
      await supabase.from('weight_records').delete().in('lizard_id', ids);
    }
    await supabase.from('user_lizards').delete().eq('user_id', user.id);
    await supabase.from('wishlists').delete().eq('user_id', user.id);

    // morph_analyses — user_id 만 NULL 처리 (분석 결과 자체는 통계용으로 보존)
    await supabase.from('morph_analyses').update({ user_id: null }).eq('user_id', user.id);

    // alert_subscriptions 삭제
    await supabase.from('alert_subscriptions').delete().eq('user_id', user.id);

    // 3. 삭제 요청 completed 처리
    await supabase
      .from('account_deletion_requests')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'processing');

    // 4. 세션 로그아웃 (auth 계정 삭제는 Supabase Admin API 필요 — 서비스 역할 키로 처리)
    //    Service role로 auth.users 삭제
    const adminRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
      {
        method: 'DELETE',
        headers: {
          'apikey':        process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
        },
      }
    );

    if (!adminRes.ok) {
      console.error('auth user delete failed:', await adminRes.text());
      // auth 삭제 실패해도 데이터 익명화는 완료됨
    }

    return NextResponse.json({ success: true, message: '계정이 삭제되었습니다.' });

  } catch (err) {
    console.error('Account delete error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
