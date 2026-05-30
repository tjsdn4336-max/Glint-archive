'use client';
import { useState, useEffect } from 'react';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

/* ── 섹션 ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-ga-white rounded-2xl border border-ga-border overflow-hidden mb-4">
      <div className="px-5 py-3 border-b border-ga-border">
        <h2 className="text-xs font-semibold text-ga-muted uppercase tracking-wider">{title}</h2>
      </div>
      <div className="divide-y divide-ga-border">{children}</div>
    </section>
  );
}

/* ── 행 ── */
function Row({ icon, label, desc, right, onClick }: {
  icon: string; label: string; desc?: string; right?: React.ReactNode; onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ga-black">{label}</p>
        {desc && <p className="text-xs text-ga-muted mt-0.5 truncate">{desc}</p>}
      </div>
      {right ?? (onClick && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ga-faint flex-shrink-0">
          <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ))}
    </div>
  );
  if (onClick) return <button type="button" className="w-full hover:bg-ga-bg transition-colors text-left" onClick={onClick}>{inner}</button>;
  return <div>{inner}</div>;
}

export default function AccountPage() {
  const router = useRouter();
  const sb = createBrowserSupabaseClient();

  const [user,       setUser]      = useState<User | null>(null);
  const [nickname,   setNickname]  = useState('');

  const [savingNick,  setSavingNick]  = useState(false);
  const [exporting,   setExporting]   = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [toast,       setToast]       = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* 초기 로드 */
  useEffect(() => {
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/auth'); return; }
      setUser(user);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: p } = await (sb as any).from('profiles').select('nickname').eq('id', user.id).maybeSingle();
      setNickname(p?.nickname ?? user.user_metadata?.nickname ?? '');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveNickname = async () => {
    if (!user || !nickname.trim()) return;
    setSavingNick(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from('profiles').update({ nickname: nickname.trim() }).eq('id', user.id);
    setSavingNick(false);
    showToast(error ? '저장 실패: ' + error.message : '닉네임이 저장되었습니다.');
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/account/export');
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `glint-archive-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { showToast('내보내기에 실패했습니다.'); }
    setExporting(false);
  };

  const logout = async () => {
    await sb.auth.signOut();
    router.replace('/landing');
  };

  const deleteAccount = async () => {
    if (deleteInput !== '계정삭제' || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        body: JSON.stringify({ reason: '' }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      await sb.auth.signOut();
      router.replace('/landing');
    } catch { showToast('계정 삭제에 실패했습니다. 다시 시도해주세요.'); }
    setDeleting(false);
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-ga-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const avatarChar = nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-32">

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ga-bg transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14l-5-5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-ga-black">계정 설정</h1>
      </div>

      {/* 토스트 */}
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${toast.includes('실패') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          {toast}
        </div>
      )}

      {/* 프로필 카드 */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-ga-white rounded-2xl border border-ga-border">
        <div className="w-14 h-14 rounded-full bg-ga-black text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
          {avatarChar}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ga-black truncate">{nickname || '닉네임 없음'}</p>
          <p className="text-sm text-ga-muted truncate">{user.email}</p>
          <p className="text-xs text-ga-faint mt-0.5">가입일 {new Date(user.created_at).toLocaleDateString('ko-KR')}</p>
        </div>
      </div>

      {/* 프로필 설정 */}
      <Section title="프로필">
        <div className="px-5 py-4">
          <label className="block text-xs font-medium text-ga-muted mb-2">닉네임</label>
          <div className="flex gap-2">
            <input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={20} placeholder="닉네임을 입력하세요"
              className="flex-1 px-3 py-2.5 border border-ga-border rounded-xl text-sm outline-none focus:border-ga-black transition-colors"
            />
            <button onClick={saveNickname} disabled={savingNick || !nickname.trim()}
              className="px-4 py-2.5 bg-ga-black text-white rounded-xl text-sm font-medium disabled:opacity-40">
              {savingNick ? '…' : '저장'}
            </button>
          </div>
        </div>
        <Row icon="📧" label="이메일" desc={user.email} />
        <Row icon="🔐" label="로그인 방법" desc={user.app_metadata?.provider === 'google' ? 'Google 소셜 로그인' : '이메일 로그인'} />
      </Section>

      {/* 바로가기 */}
      <Section title="바로가기">
        <Link href="/dashboard" className="block hover:bg-ga-bg transition-colors">
          <Row icon="📊" label="마이페이지" onClick={() => {}} />
        </Link>
        <Link href="/wishlist" className="block hover:bg-ga-bg transition-colors">
          <Row icon="🤍" label="찜 목록" onClick={() => {}} />
        </Link>
        <Link href="/passport" className="block hover:bg-ga-bg transition-colors">
          <Row icon="📋" label="나의 패스포트" onClick={() => {}} />
        </Link>
      </Section>

      {/* 약관 */}
      <Section title="약관 및 정책">
        <Link href="/privacy" className="block hover:bg-ga-bg transition-colors">
          <Row icon="🔏" label="개인정보처리방침" onClick={() => {}} />
        </Link>
        <Link href="/terms" className="block hover:bg-ga-bg transition-colors">
          <Row icon="📄" label="이용약관" onClick={() => {}} />
        </Link>
      </Section>

      {/* 내 데이터 */}
      <Section title="내 데이터 (개인정보보호법 제35조)">
        <Row icon="📦" label="데이터 다운로드" desc="모든 데이터를 JSON으로 내보내기"
          right={
            <button onClick={exportData} disabled={exporting}
              className="px-3 py-1.5 border border-ga-border rounded-lg text-xs font-medium text-ga-black hover:bg-ga-bg disabled:opacity-40">
              {exporting ? '준비 중…' : '다운로드'}
            </button>
          }
        />
      </Section>

      {/* 로그아웃 */}
      <Section title="세션">
        <button onClick={logout} className="w-full hover:bg-ga-bg transition-colors text-left">
          <div className="flex items-center gap-3 px-5 py-4">
            <span className="text-lg w-6 text-center">🚪</span>
            <span className="flex-1 text-sm font-medium text-ga-black">로그아웃</span>
          </div>
        </button>
      </Section>

      {/* 회원탈퇴 */}
      <section className="rounded-2xl border border-red-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-red-100 bg-red-50">
          <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wider">위험 구역</h2>
        </div>
        {!showDelete ? (
          <div className="px-5 py-4 bg-ga-white">
            <p className="text-xs text-ga-muted mb-3">계정 삭제 시 위시리스트, 패스포트, 분석 이력 등 모든 데이터가 즉시 삭제되며 복구할 수 없습니다.</p>
            <button onClick={() => setShowDelete(true)}
              className="px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
              회원 탈퇴
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 bg-ga-white">
            <p className="text-sm font-semibold text-red-600 mb-1">정말 탈퇴하시겠습니까?</p>
            <p className="text-xs text-ga-muted mb-3">확인을 위해 <strong className="text-red-500">계정삭제</strong>를 입력하세요.</p>
            <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="계정삭제"
              className="w-full px-3 py-2.5 border border-red-200 rounded-xl text-sm outline-none focus:border-red-400 mb-3 transition-colors"
            />
            <div className="flex gap-2">
              <button onClick={deleteAccount} disabled={deleteInput !== '계정삭제' || deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40">
                {deleting ? '삭제 중…' : '영구 삭제'}
              </button>
              <button onClick={() => { setShowDelete(false); setDeleteInput(''); }}
                className="px-4 py-2.5 border border-ga-border rounded-xl text-sm text-ga-muted hover:bg-ga-bg">
                취소
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="text-center text-xs text-ga-faint mt-8">Glint Archive v1.0.0</p>
    </div>
  );
}
