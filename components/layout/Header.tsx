'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const NAV_DEFAULT = [
  { href: '/deals',        label: '타임딜' },
  { href: '/shops',        label: '샵 투어' },
  { href: '/encyclopedia', label: '파충류 사전' },
  { href: '/passport',     label: '패스포트' },
];
const NAV_LOGGEDIN = [
  { href: '/deals',        label: '타임딜' },
  { href: '/shops',        label: '샵 투어' },
  { href: '/encyclopedia', label: '파충류 사전' },
  { href: '/mypage',       label: '마이페이지' },
];

export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();
  const sb       = createClient();

  const [user,        setUser]        = useState<User | null>(null);
  const [nickname,    setNickname]    = useState('');
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* ── auth 상태 구독 ── */
  useEffect(() => {
    sb.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      if (user) loadNickname(user.id);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadNickname(session.user.id);
      else setNickname('');
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadNickname(uid: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from('profiles').select('nickname').eq('id', uid).maybeSingle();
    setNickname(data?.nickname ?? '');
  }

  /* ── 외부 클릭 시 드롭다운 닫기 ── */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    setDropOpen(false);
    await sb.auth.signOut();
    router.push('/landing');
  }

  const avatarChar = nickname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 hidden md:block bg-ga-white border-b border-ga-border">
      <div className="max-w-screen-lg mx-auto px-8 h-14 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-serif text-base font-bold tracking-[0.12em] text-ga-black">
            GLINT ARCHIVE
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-1">
          {(user ? NAV_LOGGEDIN : NAV_DEFAULT).map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={`px-4 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  active
                    ? 'text-ga-black font-semibold bg-ga-bg'
                    : 'text-ga-muted hover:text-ga-black'
                }`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
          {user ? (
            /* ── 로그인 상태 ── */
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-ga-bg transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-ga-black text-white flex items-center justify-center text-xs font-bold">
                  {avatarChar}
                </div>
                <span className="text-sm text-ga-black max-w-[100px] truncate">
                  {nickname || user.email?.split('@')[0]}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`text-ga-muted transition-transform ${dropOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-ga-border shadow-lg overflow-hidden">
                  {/* 유저 정보 */}
                  <div className="px-4 py-3 border-b border-ga-border">
                    <p className="text-xs font-semibold text-ga-black truncate">{nickname || '닉네임 없음'}</p>
                    <p className="text-xs text-ga-muted truncate">{user.email}</p>
                  </div>

                  {/* 메뉴 */}
                  <div className="py-1">
                    <Link href="/mypage" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ga-black hover:bg-ga-bg transition-colors">
                      <span className="text-base">👤</span> 마이페이지
                    </Link>
                    <Link href="/account" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ga-black hover:bg-ga-bg transition-colors">
                      <span className="text-base">⚙️</span> 계정 설정
                    </Link>
                    <Link href="/wishlist" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ga-black hover:bg-ga-bg transition-colors">
                      <span className="text-base">🤍</span> 찜 목록
                    </Link>
                    <Link href="/passport" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ga-black hover:bg-ga-bg transition-colors">
                      <span className="text-base">📋</span> 나의 패스포트
                    </Link>
                  </div>

                  <div className="border-t border-ga-border py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── 비로그인 상태 ── */
            <>
              <Link href="/auth"
                className="text-sm text-ga-muted hover:text-ga-black px-4 py-1.5 transition-colors">
                로그인
              </Link>
              <Link href="/admin"
                className="text-sm font-bold text-ga-white bg-ga-black px-4 py-1.5 rounded-lg hover:opacity-80 transition-opacity">
                샵 등록
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
