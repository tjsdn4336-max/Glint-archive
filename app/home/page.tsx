import Link from 'next/link';
import { Sparkles, BookOpen, ChevronRight, Bell } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AnimalCard from '@/components/AnimalCard';
import ShopCard from '@/components/ShopCard';
import type { Animal, Shop } from '@/types';

async function getData() {
  const supabase = await createServerSupabaseClient();

  const [dealsRes, newRes, shopsRes, userRes] = await Promise.all([
    supabase.from('animals').select('*, shop:shops(*)')
      .eq('is_timedeal', true).eq('status', 'available')
      .order('deal_ends_at', { ascending: true }).limit(4),
    supabase.from('animals').select('*, shop:shops(*)')
      .eq('is_timedeal', false).eq('status', 'available')
      .order('created_at', { ascending: false }).limit(6),
    supabase.from('shops').select('*')
      .eq('is_verified', true).order('plan', { ascending: false }).limit(6),
    supabase.auth.getUser(),
  ]);

  const user = userRes.data.user ?? null;
  let myAnimals: { id: string; name: string; species_korean: string; next_feed_at?: string; last_fed_at?: string }[] = [];

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: animals } = await (supabase as any)
      .from('my_animals')
      .select('id, name, species_korean')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (animals?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: alerts } = await (supabase as any)
        .from('feeding_alerts')
        .select('animal_id, next_feed_at, last_fed_at')
        .in('animal_id', animals.map((a: { id: string }) => a.id));

      const alertMap: Record<string, { next_feed_at?: string; last_fed_at?: string }> = {};
      (alerts ?? []).forEach((a: { animal_id: string; next_feed_at?: string; last_fed_at?: string }) => {
        alertMap[a.animal_id] = a;
      });

      myAnimals = animals.map((a: { id: string; name: string; species_korean: string }) => ({
        ...a,
        ...alertMap[a.id],
      }));
    }
  }

  return {
    deals:       (dealsRes.data  ?? []) as Animal[],
    newArrivals: (newRes.data    ?? []) as Animal[],
    shops:       (shopsRes.data  ?? []) as Shop[],
    user,
    myAnimals,
  };
}

function daysUntil(target: string) { return Math.ceil((new Date(target).getTime() - Date.now()) / 86400000); }
function daysDiff(from: string) { return Math.floor((Date.now() - new Date(from).getTime()) / 86400000); }

export default async function HomePage() {
  const { deals, newArrivals, shops, user, myAnimals } = await getData();

  // 먹이 알림 대상 (오늘 이하)
  const feedAlerts = myAnimals.filter(a => a.next_feed_at && daysUntil(a.next_feed_at) <= 0);
  const nextFeedAnimal = myAnimals.find(a => a.next_feed_at && daysUntil(a.next_feed_at) > 0);

  return (
    <div className="max-w-screen-lg mx-auto">

      {/* ── 로그인 유저 맞춤 상단 배너 ─────────────────────────────── */}
      {user && (
        <div className="px-5 pt-6 md:px-8">
          {feedAlerts.length > 0 ? (
            /* 먹이 알림 있을 때 */
            <Link href="/mypage?tab=animals"
              className="flex items-center gap-4 bg-[#D94035]/8 border border-[#D94035]/20 rounded-2xl p-5 hover:border-[#D94035]/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <Bell size={18} className="text-[#D94035]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#D94035]">
                  {feedAlerts.length === 1
                    ? `${feedAlerts[0].name} 먹이 줄 날이에요`
                    : `${feedAlerts[0].name} 외 ${feedAlerts.length - 1}마리 먹이 급여일`}
                </p>
                <p className="text-xs text-[#9A9A94] mt-0.5">
                  {feedAlerts[0].last_fed_at
                    ? `마지막 급여 ${daysDiff(feedAlerts[0].last_fed_at)}일 전`
                    : '사육 일지에서 기록하세요'}
                </p>
              </div>
              <ChevronRight size={16} className="text-[#9A9A94] flex-shrink-0" />
            </Link>
          ) : myAnimals.length > 0 ? (
            /* 내 파충류 있는데 알림 없을 때 */
            <Link href="/mypage?tab=animals"
              className="flex items-center gap-4 bg-white border border-[#E8E8E4] rounded-2xl p-5 hover:border-[#9A9A94] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center flex-shrink-0 text-xl">
                🦎
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm font-bold text-[#111]">{myAnimals[0].name}</p>
                <p className="text-xs text-[#9A9A94] mt-0.5">
                  {nextFeedAnimal
                    ? `다음 급여 D-${daysUntil(nextFeedAnimal.next_feed_at!)}`
                    : `${myAnimals[0].species_korean} · 사육 일지 보기`}
                </p>
              </div>
              <ChevronRight size={16} className="text-[#9A9A94] flex-shrink-0" />
            </Link>
          ) : (
            /* 내 파충류 없을 때 */
            <Link href="/mypage?tab=animals"
              className="flex items-center gap-4 bg-white border border-[#E8E8E4] rounded-2xl p-5 hover:border-[#9A9A94] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center flex-shrink-0 text-xl">
                🦎
              </div>
              <div className="flex-1">
                <p className="font-serif text-sm font-bold text-[#111]">내 파충류 등록하기</p>
                <p className="text-xs text-[#9A9A94] mt-0.5">먹이·탈피·체중을 매일 기록하세요</p>
              </div>
              <ChevronRight size={16} className="text-[#9A9A94] flex-shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className={`px-5 pb-10 bg-ga-white md:px-8 ${user ? 'pt-6' : 'pt-12'}`}>
        <p className="text-[10px] text-ga-muted tracking-[0.2em] font-semibold mb-4 uppercase">
          Reptile Market
        </p>
        <h1 className="font-serif text-[36px] font-bold text-ga-black leading-[1.15] tracking-tight mb-4">
          파충류의 세계,<br />다시 정의하다
        </h1>
        <p className="text-sm text-ga-muted leading-relaxed mb-8 max-w-xs">
          전국 파충류 샵 실시간 타임딜.<br />
          검증된 개체, 합리적인 가격.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/deals"
            className="inline-flex items-center px-5 py-3 bg-ga-black text-ga-white text-sm font-bold rounded-lg hover:opacity-80 transition-opacity tracking-wide">
            타임딜 보기
          </Link>
          <Link href="/shops"
            className="inline-flex items-center px-5 py-3 bg-ga-white text-ga-black border border-ga-black text-sm font-bold rounded-lg hover:bg-ga-bg transition-colors tracking-wide">
            샵 투어
          </Link>
        </div>
      </section>

      {/* ── 모프 감정 배너 ────────────────────────────────────────── */}
      <div className="px-5 pt-2 md:px-8">
        <Link
          href="/analyze"
          className="bg-ga-black rounded-2xl p-5 flex items-center justify-between block hover:opacity-90 transition-opacity"
        >
          <div>
            <p className="text-[10px] text-zinc-600 tracking-[0.15em] font-semibold mb-1 uppercase">
              Morph AI
            </p>
            <p className="font-serif text-lg font-bold text-white mb-1">모프 감정 무료 체험</p>
            <p className="text-[12px] text-zinc-500">사진 한 장으로 모프와 시세 확인</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 ml-4">
            <Sparkles size={24} className="text-white" strokeWidth={1.5} />
          </div>
        </Link>
      </div>

      {/* ── 파충류 사전 배너 ──────────────────────────────────────── */}
      <div className="px-5 pt-4 md:px-8">
        <Link
          href="/encyclopedia"
          className="bg-ga-white border border-ga-border rounded-2xl p-5 flex items-center justify-between block hover:border-ga-black/20 transition-colors"
        >
          <div>
            <p className="text-[9px] text-ga-muted tracking-[0.2em] font-semibold mb-1 uppercase">
              Encyclopedia
            </p>
            <p className="font-serif text-lg font-bold text-ga-black mb-1">파충류 사전</p>
            <p className="text-[12px] text-ga-muted">51종 · 모프 정보 · 사육 가이드</p>
          </div>
          <BookOpen className="w-8 h-8 text-ga-muted flex-shrink-0 ml-4" />
        </Link>
      </div>

      <div className="h-px bg-ga-border mx-5 mt-6 md:mx-8" />

      {/* ── 타임딜 ────────────────────────────────────────────────── */}
      <section className="px-5 py-10 md:px-8">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl font-bold text-ga-black">마감 임박</h2>
          <Link href="/deals" className="text-xs text-ga-muted tracking-wide hover:text-ga-black transition-colors">
            전체보기
          </Link>
        </div>

        {deals.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:overflow-visible md:snap-none">
            {deals.map(animal => (
              <div key={animal.id} className="w-60 flex-shrink-0 snap-start md:w-auto md:flex-shrink">
                <AnimalCard animal={animal} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="진행 중인 타임딜이 없습니다" />
        )}
      </section>

      <div className="h-px bg-ga-border mx-5 md:mx-8" />

      {/* ── 신규 입고 ──────────────────────────────────────────────── */}
      <section className="px-5 py-10 md:px-8">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl font-bold text-ga-black">신규 입고</h2>
        </div>
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map(a => <AnimalCard key={a.id} animal={a} />)}
          </div>
        ) : (
          <EmptyState text="신규 입고 개체가 없습니다" />
        )}
      </section>

      <div className="h-px bg-ga-border mx-5 md:mx-8" />

      {/* ── 인증 파트너 샵 ─────────────────────────────────────────── */}
      <section className="px-5 py-10 md:px-8">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl font-bold text-ga-black">인증 파트너 샵</h2>
          <Link href="/shops" className="text-xs text-ga-muted tracking-wide hover:text-ga-black transition-colors">
            지도 보기
          </Link>
        </div>
        {shops.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:overflow-visible md:snap-none">
            {shops.map(s => (
              <div key={s.id} className="w-72 flex-shrink-0 snap-start md:w-auto md:flex-shrink">
                <ShopCard shop={s} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="등록된 샵이 없습니다" />
        )}
      </section>

      {/* ── 패스포트 배너 ──────────────────────────────────────────── */}
      <section className="px-5 pb-12 md:px-8">
        <div className="bg-ga-black rounded-2xl p-8 md:p-10">
          <p className="text-[10px] text-white/30 tracking-[0.2em] font-semibold mb-4 uppercase">
            Digital Passport
          </p>
          <h2 className="font-serif text-2xl font-bold text-ga-white leading-tight mb-3">
            내 개체의 이력을<br />디지털로 증명하세요
          </h2>
          <p className="text-sm text-white/50 mb-7 leading-relaxed">
            글린트 디지털 패스포트로 개체의 출처,<br />건강 이력, 혈통을 영구 기록합니다.
          </p>
          <Link href="/passport"
            className="inline-flex items-center px-5 py-3 bg-ga-white text-ga-black text-sm font-bold rounded-lg hover:opacity-90 transition-opacity tracking-wide">
            알아보기
          </Link>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-ga-faint">{text}</p>
    </div>
  );
}
