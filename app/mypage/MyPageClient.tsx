'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import LogoutButton from '@/components/LogoutButton';
import MyAnimalsTab from './_components/MyAnimalsTab';

interface Props {
  user: { id: string; email: string; created_at: string };
  nickname: string | null;
  credits: number;
  passportCount: number;
  wishlistCount: number;
}

type Tab = 'info' | 'animals' | 'wishlist' | 'passport';

const TABS: { key: Tab; label: string }[] = [
  { key: 'animals',  label: '내 파충류' },
  { key: 'info',     label: '내 정보'   },
  { key: 'wishlist', label: '찜 목록'   },
  { key: 'passport', label: '패스포트'  },
];

/* ─── 찜 목록 탭 ─── */
interface WishAnimal {
  id: string;
  name: string;
  morph: string;
  price: number;
  status: string;
  image_url?: string;
  shop?: { name: string };
}

function WishlistTab({ userId }: { userId: string }) {
  const sb = createClient();
  const [items, setItems] = useState<WishAnimal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (sb as any)
        .from('wishlists')
        .select('animal:animals(id, name, morph, price, status, image_url, shop:shops(name))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setItems((data ?? []).map((w: { animal: WishAnimal }) => w.animal).filter(Boolean));
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return (
    <div className="px-5 py-6 space-y-3">
      {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-[#E8E8E4] h-20 animate-pulse" />)}
    </div>
  );

  if (items.length === 0) return (
    <div className="px-5 py-6">
      <div className="bg-white rounded-2xl border border-[#E8E8E4] py-16 text-center">
        <Heart size={28} className="text-[#E8E8E4] mx-auto mb-3" />
        <p className="text-sm text-[#9A9A94] mb-1">찜한 개체가 없습니다</p>
        <p className="text-xs text-[#C8C8C4] mb-5">타임딜에서 마음에 드는 개체를 찜해보세요</p>
        <Link href="/deals"
          className="inline-flex items-center gap-1.5 bg-[#111] text-white text-sm font-bold px-5 py-2.5 rounded-lg">
          개체 탐색하기
        </Link>
      </div>
    </div>
  );

  return (
    <div className="px-5 py-4 space-y-3">
      <p className="text-[10px] text-[#9A9A94] font-semibold tracking-widest uppercase">찜한 개체 {items.length}마리</p>
      {items.map(a => (
        <Link key={a.id} href={`/deals?q=${encodeURIComponent(a.name)}`}
          className="flex items-center gap-4 bg-white rounded-2xl border border-[#E8E8E4] p-4 hover:border-[#9A9A94] transition-colors">
          <div className="w-16 h-16 rounded-xl bg-[#F7F7F5] overflow-hidden flex-shrink-0">
            {a.image_url
              ? <img src={a.image_url} alt={a.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[10px] text-[#C8C8C4] text-center p-1">{a.morph || a.name}</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-bold text-[#111] truncate">{a.name}</p>
            <p className="text-xs text-[#9A9A94]">{a.morph}</p>
            {a.shop?.name && <p className="text-[10px] text-[#C8C8C4] mt-0.5">{a.shop.name}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-serif text-sm font-bold text-[#111]">{a.price.toLocaleString()}원</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              a.status === 'available' ? 'bg-green-50 text-[#1A7F4B]' :
              a.status === 'reserved' ? 'bg-blue-50 text-[#1A56DB]' :
              'bg-[#F7F7F5] text-[#9A9A94]'
            }`}>
              {a.status === 'available' ? '분양중' : a.status === 'reserved' ? '예약됨' : '분양완료'}
            </span>
          </div>
        </Link>
      ))}
      <Link href="/wishlist" className="flex items-center justify-center gap-1.5 text-sm text-[#9A9A94] py-3 hover:text-[#111] transition-colors">
        <ExternalLink size={12} />전체 찜 목록 보기
      </Link>
    </div>
  );
}

/* ─── 패스포트 탭 ─── */
interface Passport {
  id: string;
  passport_number: string;
  issued_at: string;
  animal?: { name?: string; morph?: string; status?: string };
  shop?: { name?: string };
}

function PassportTab({ userId }: { userId: string }) {
  const sb = createClient();
  const [passports, setPassports] = useState<Passport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (sb as any)
        .from('passports')
        .select('id, passport_number, issued_at, animal:animals(name, morph, status), shop:shops(name)')
        .eq('owner_id', userId)
        .order('issued_at', { ascending: false });
      setPassports(data ?? []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return (
    <div className="px-5 py-6 space-y-3">
      {[1,2].map(i => <div key={i} className="bg-[#111] rounded-2xl h-40 animate-pulse opacity-30" />)}
    </div>
  );

  if (passports.length === 0) return (
    <div className="px-5 py-6">
      <div className="bg-[#111] rounded-2xl p-8 text-center">
        <p className="text-[9px] text-zinc-600 tracking-widest font-semibold mb-4 uppercase">GLINT ARCHIVE · DIGITAL PASSPORT</p>
        <p className="font-serif text-lg text-white/40 mb-2">패스포트가 없습니다</p>
        <p className="text-xs text-zinc-600 mb-6">인증 샵에서 개체를 분양받으면 자동 발급됩니다</p>
        <Link href="/shops" className="inline-flex items-center bg-white text-[#111] text-xs font-bold px-4 py-2 rounded-lg">
          파트너 샵 찾기
        </Link>
      </div>
      <p className="text-center text-xs text-[#9A9A94] mt-4">
        <Link href="/passport" className="hover:text-[#111] underline">패스포트 안내 보기</Link>
      </p>
    </div>
  );

  return (
    <div className="px-5 py-4 space-y-3">
      <p className="text-[10px] text-[#9A9A94] font-semibold tracking-widest uppercase">보유 패스포트 {passports.length}개</p>
      {passports.map(p => (
        <div key={p.id} className="bg-[#111] rounded-2xl p-5">
          <p className="text-[9px] text-zinc-600 tracking-widest font-semibold mb-4 uppercase">GLINT ARCHIVE · DIGITAL PASSPORT</p>
          <p className="font-serif text-lg font-bold text-white mb-0.5">{p.animal?.name ?? '개체명 없음'}</p>
          <p className="text-xs text-zinc-500 mb-4">{p.animal?.morph}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '발급 샵',   value: p.shop?.name ?? '-' },
              { label: '발급일',    value: new Date(p.issued_at).toLocaleDateString('ko-KR') },
              { label: '인증 번호', value: `#${p.passport_number}` },
              { label: '상태',      value: p.animal?.status === 'available' ? '분양 중' : '분양 완료' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] text-zinc-600 tracking-wider mb-0.5 uppercase">{label}</p>
                <p className="text-xs text-white font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function MyPageClient({ user, nickname, credits, passportCount, wishlistCount }: Props) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('animals');

  useEffect(() => {
    const t = searchParams.get('tab') as Tab | null;
    if (t && TABS.some(x => x.key === t)) setTab(t);
  }, [searchParams]);

  const displayName = nickname ?? user.email.split('@')[0];
  const joinDate = new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#E8E8E4]">
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold uppercase mb-0.5">My Page</p>
              <h1 className="font-serif text-xl font-bold text-[#111]">{displayName} 님</h1>
            </div>
            <LogoutButton />
          </div>

          {/* 탭 */}
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-shrink-0 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key ? 'border-[#111] text-[#111]' : 'border-transparent text-[#9A9A94] hover:text-[#111]'
                }`}>
                {t.label}
                {t.key === 'wishlist' && wishlistCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[#F7F7F5] text-[#9A9A94] px-1.5 py-0.5 rounded-full">{wishlistCount}</span>
                )}
                {t.key === 'passport' && passportCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[#F7F7F5] text-[#9A9A94] px-1.5 py-0.5 rounded-full">{passportCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* ─── 내 파충류 탭 ─── */}
        {tab === 'animals' && <MyAnimalsTab userId={user.id} />}

        {/* ─── 내 정보 탭 ─── */}
        {tab === 'info' && (
          <div className="px-5 py-5 space-y-4">
            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'AI 크레딧', value: credits, unit: '개', href: '/pricing' },
                { label: '찜한 개체', value: wishlistCount, unit: '마리', href: '/wishlist' },
                { label: '패스포트', value: passportCount, unit: '개', href: '/passport' },
              ].map(s => (
                <Link key={s.label} href={s.href}
                  className="bg-white rounded-2xl border border-[#E8E8E4] p-4 text-center hover:border-[#9A9A94] transition-colors">
                  <p className="font-serif text-2xl font-bold text-[#111]">{s.value}<span className="text-xs font-normal ml-0.5">{s.unit}</span></p>
                  <p className="text-[10px] text-[#9A9A94] mt-1">{s.label}</p>
                </Link>
              ))}
            </div>

            {/* 계정 정보 */}
            <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
              {[
                { label: '이메일', value: user.email },
                { label: '닉네임', value: nickname ?? '미설정' },
                { label: '가입일', value: joinDate },
              ].map((row, i, arr) => (
                <div key={row.label} className={`px-5 py-4 flex items-center justify-between ${i < arr.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                  <span className="text-[11px] text-[#9A9A94] font-semibold uppercase tracking-wider">{row.label}</span>
                  <span className="text-sm text-[#111] truncate max-w-[60%] text-right">{row.value}</span>
                </div>
              ))}
            </div>

            {/* 바로가기 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/account',  label: '계정 설정',    desc: '닉네임·탈퇴 관리' },
                { href: '/analyze',  label: '모프 감정',    desc: 'AI 모프 분석' },
                { href: '/admin',    label: '샵 어드민',    desc: '사장님 대시보드' },
                { href: '/pricing',  label: '플랜 업그레이드', desc: '크레딧·프리미엄' },
              ].map(({ href, label, desc }) => (
                <Link key={href} href={href}
                  className="bg-white rounded-2xl border border-[#E8E8E4] p-4 hover:border-[#9A9A94] transition-colors">
                  <p className="text-sm font-semibold text-[#111]">{label}</p>
                  <p className="text-xs text-[#9A9A94] mt-0.5">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── 찜 목록 탭 ─── */}
        {tab === 'wishlist' && <WishlistTab userId={user.id} />}

        {/* ─── 패스포트 탭 ─── */}
        {tab === 'passport' && <PassportTab userId={user.id} />}
      </div>
    </div>
  );
}
