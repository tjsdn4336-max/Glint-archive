import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AnimalCard from '@/components/AnimalCard';
import LogoutButton from '@/components/LogoutButton';
import type { Animal } from '@/types';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  // 위시리스트
  const { data: wishlistData } = await supabase
    .from('wishlists')
    .select('*, animal:animals(*, shop:shops(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 패스포트 실제 카운트
  const { count: passportCount } = await supabase
    .from('passports')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wishlist: any[] = wishlistData ?? [];
  const wishlistAnimals = wishlist
    .map((w) => w.animal)
    .filter(Boolean) as Animal[];

  const emailPrefix = user.email?.split('@')[0] ?? '유저';
  const passports = passportCount ?? 0;

  return (
    <div className="max-w-screen-lg mx-auto px-5 py-8 md:px-8">

      {/* 헤더 */}
      <div className="mb-10">
        <p className="text-[10px] text-ga-muted tracking-[0.2em] font-semibold uppercase mb-1">My Page</p>
        <h1 className="font-serif text-2xl font-bold text-ga-black">{emailPrefix} 님</h1>
        <p className="text-sm text-ga-muted mt-1">{user.email}</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        <div className="bg-ga-white rounded-2xl p-5 border border-ga-border">
          <p className="font-serif text-2xl font-bold text-ga-black mb-1">{wishlistAnimals.length}</p>
          <p className="text-xs text-ga-muted">찜한 개체</p>
        </div>
        <div className="bg-ga-white rounded-2xl p-5 border border-ga-border">
          <p className="font-serif text-2xl font-bold text-ga-black mb-1">{passports}</p>
          <p className="text-xs text-ga-muted">보유 패스포트</p>
        </div>
        <div className="bg-ga-white rounded-2xl p-5 border border-ga-border col-span-2 md:col-span-1">
          <p className="font-serif text-2xl font-bold text-ga-black mb-1">
            {new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })}
          </p>
          <p className="text-xs text-ga-muted">가입일</p>
        </div>
      </div>

      {/* 찜 목록 */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base font-bold text-ga-black">찜한 개체</h2>
          {wishlistAnimals.length > 0 && (
            <Link href="/deals" className="text-xs text-ga-muted hover:text-ga-black transition-colors">
              더 탐색하기 →
            </Link>
          )}
        </div>

        {wishlistAnimals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistAnimals.map(animal => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-ga-white rounded-2xl border border-ga-border">
            <p className="font-serif text-4xl text-ga-faint mb-4">🦎</p>
            <p className="text-sm text-ga-muted mb-4">찜한 개체가 없습니다</p>
            <Link
              href="/deals"
              className="inline-flex items-center gap-1 text-sm font-semibold text-ga-black underline underline-offset-2"
            >
              개체 탐색하기 →
            </Link>
          </div>
        )}
      </section>

      {/* 패스포트 섹션 */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base font-bold text-ga-black">나의 패스포트</h2>
          <Link href="/passport" className="text-xs text-ga-muted hover:text-ga-black transition-colors">
            전체 보기 →
          </Link>
        </div>
        <div className="bg-ga-black rounded-2xl p-6 text-white">
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-semibold mb-3">Digital Passport</p>
          <p className="font-serif text-lg font-bold mb-1">내 개체의 이력을 증명하세요</p>
          <p className="text-sm text-white/50 mb-5">출처, 건강 이력, 혈통을 영구적으로 기록합니다</p>
          <Link
            href="/passport"
            className="inline-flex items-center gap-2 bg-white text-ga-black text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            패스포트 알아보기 →
          </Link>
        </div>
      </section>

      {/* 바로가기 */}
      <section className="mb-10">
        <h2 className="font-serif text-base font-bold text-ga-black mb-4">바로가기</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/account',  icon: '⚙️', label: '계정 설정',    desc: '닉네임·계정 관리' },
            { href: '/wishlist', icon: '🤍', label: '찜 목록',       desc: '찜한 개체 관리' },
            { href: '/passport', icon: '📋', label: '나의 패스포트', desc: '개체 이력 증명' },
            { href: '/analyze',  icon: '✨', label: '모프 감정',     desc: 'AI 분석 서비스' },
          ].map(({ href, icon, label, desc }) => (
            <Link key={href} href={href}
              className="flex items-start gap-3 p-4 bg-ga-white rounded-2xl border border-ga-border hover:border-ga-muted transition-colors">
              <span className="text-xl mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-ga-black">{label}</p>
                <p className="text-xs text-ga-muted mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 로그아웃 */}
      <div className="pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}
