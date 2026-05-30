import { createServerSupabaseClient } from '@/lib/supabase-server';
import Link from 'next/link';
import type { Passport } from '@/types';

export default async function PassportPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let passports: Passport[] = [];
  if (user) {
    const { data } = await supabase
      .from('passports')
      .select('*, animal:animals(*), shop:shops(*)')
      .eq('owner_id', user.id)
      .order('issued_at', { ascending: false });
    passports = (data ?? []) as Passport[];
  }

  return (
    <div className="max-w-screen-lg mx-auto">

      {/* 페이지 헤더 */}
      <div className="px-5 pt-8 pb-6 bg-ga-white border-b border-ga-border md:px-8">
        <p className="text-[10px] text-ga-muted tracking-[0.2em] font-semibold mb-2 uppercase">Digital Passport</p>
        <h1 className="font-serif text-3xl font-bold text-ga-black mb-1">패스포트</h1>
        <p className="text-sm text-ga-muted">개체의 출처와 건강 이력을 디지털로 증명하세요</p>
      </div>

      <div className="px-5 py-8 md:px-8 space-y-6">

        {/* 로그인 안내 */}
        {!user && (
          <div className="bg-ga-white rounded-2xl border border-ga-border p-10 text-center">
            <p className="text-sm text-ga-muted mb-6 leading-relaxed">
              패스포트를 발급하고 관리하려면<br />로그인이 필요합니다
            </p>
            <Link href="/auth"
              className="inline-flex items-center px-5 py-3 bg-ga-black text-ga-white text-sm font-bold rounded-lg hover:opacity-80 transition-opacity">
              로그인 / 회원가입
            </Link>
          </div>
        )}

        {/* 서비스 소개 */}
        <div className="bg-ga-white rounded-2xl border border-ga-border p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📋', title: '공식 보증', desc: '출처와 혈통을 영구 기록' },
              { icon: '🏥', title: '건강 이력', desc: '수의사 기록 및 건강 인증' },
              { icon: '🔒', title: '디지털 인증', desc: '위변조 불가 인증' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-serif font-bold text-sm text-ga-black mb-0.5">{item.title}</p>
                  <p className="text-xs text-ga-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 패스포트 목록 */}
        {user && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-bold text-ga-black">나의 패스포트</h2>
              <span className="text-sm text-ga-muted">{passports.length}개</span>
            </div>

            {passports.length > 0 ? (
              <div className="space-y-4">
                {passports.map(passport => (
                  <PassportCard key={passport.id} passport={passport} />
                ))}
              </div>
            ) : (
              <div className="bg-ga-black rounded-2xl p-8 text-center">
                <p className="text-[9px] text-zinc-600 tracking-[0.2em] mb-6 font-semibold">
                  GLINT ARCHIVE · DIGITAL PASSPORT
                </p>
                <p className="font-serif text-base text-white/40 mb-1">패스포트가 없습니다</p>
                <p className="text-xs text-zinc-600">인증 샵에서 개체를 분양받으면 자동 발급됩니다</p>
              </div>
            )}
          </section>
        )}

        {/* 이용 안내 */}
        <section className="pt-4">
          <h2 className="font-serif text-lg font-bold text-ga-black mb-4">이용 안내</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { step: '01', title: '인증 샵 방문', desc: '글린트 파트너 샵에서 개체를 분양받으세요' },
              { step: '02', title: '패스포트 발급', desc: '분양 시 자동으로 디지털 패스포트가 발급됩니다' },
              { step: '03', title: '이력 기록', desc: '건강검진, 탈피, 먹이 급여 기록을 추가하세요' },
              { step: '04', title: '소유권 증명', desc: '패스포트로 개체의 출처와 혈통을 증명하세요' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-5 bg-ga-white rounded-2xl border border-ga-border">
                <span className="font-serif text-2xl font-bold text-ga-faint flex-shrink-0">{item.step}</span>
                <div>
                  <p className="text-sm font-semibold text-ga-black mb-0.5">{item.title}</p>
                  <p className="text-xs text-ga-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PassportCard({ passport }: { passport: Passport }) {
  return (
    <div className="bg-ga-black rounded-2xl p-6">
      <p className="text-[9px] text-zinc-600 tracking-[0.2em] mb-5 font-semibold">
        GLINT ARCHIVE · DIGITAL PASSPORT
      </p>
      <h2 className="font-serif text-xl font-bold text-white mb-1">
        {passport.animal?.name ?? '개체명 없음'}
      </h2>
      <p className="text-sm text-zinc-500 mb-6">{passport.animal?.morph}</p>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: '발급 샵',  value: passport.shop?.name ?? '-' },
          { label: '발급일',   value: new Date(passport.issued_at).toLocaleDateString('ko-KR') },
          { label: '인증 번호', value: `#${passport.passport_number}` },
          { label: '상태',     value: passport.animal?.status === 'available' ? '분양 중' : passport.animal?.status === 'reserved' ? '예약됨' : '분양 완료' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[9px] text-zinc-600 tracking-wider mb-1 uppercase">{label}</p>
            <p className="text-[13px] text-white font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="h-px bg-zinc-800 my-5" />
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-zinc-600 tracking-wider">Verified by Glint Archive</p>
        <p className="text-white text-lg">✦</p>
      </div>
    </div>
  );
}
