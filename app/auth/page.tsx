'use client';

import { useState, useEffect, useId } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, LogOut, ArrowRight } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

/* ── 플로팅 라벨 인풋 ─────────────────────────────────────────────────────── */
function FloatInput({
  label, type = 'text', value, onChange, required = false, minLength,
  autoComplete,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean;
  minLength?: number; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const id = useId();
  const lifted = focused || value.length > 0;
  const isPassword = type === 'password';

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 transition-all duration-150 select-none"
        style={{
          top: lifted ? '8px' : '50%',
          transform: lifted ? 'none' : 'translateY(-50%)',
          fontSize: lifted ? '10px' : '14px',
          color: focused ? '#111' : '#9ca3af',
          fontWeight: lifted ? 600 : 400,
          letterSpacing: lifted ? '0.05em' : 0,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={isPassword ? (show ? 'text' : 'password') : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          paddingTop: '22px',
          paddingBottom: '8px',
          paddingLeft: '16px',
          paddingRight: isPassword ? '48px' : '16px',
          background: '#F9F9F7',
          border: `1.5px solid ${focused ? '#111' : '#E5E7EB'}`,
          borderRadius: '12px',
          fontSize: '14px',
          color: '#111',
          outline: 'none',
          transition: 'border-color 0.15s',
          WebkitAppearance: 'none',
        }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          tabIndex={-1}
          style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0,
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

/* ── Google 로고 SVG ──────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

/* ── 메인 페이지 ─────────────────────────────────────────────────────────── */
export default function AuthPage() {
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const [user, setUser]         = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setChecking(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchMode(m: 'login' | 'signup') {
    setMode(m); setError(null); setSuccess(null);
    setEmail(''); setPassword(''); setNickname('');
  }

  /* ── 로딩 중 ─────────────────────────────────────────────────────────── */
  if (checking) return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2.5px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  /* ── 이미 로그인 ─────────────────────────────────────────────────────── */
  if (user) return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#F9F9F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '36px 32px', width: '100%', maxWidth: '360px' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Sparkles size={20} color="white" />
        </div>
        <p style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 }}>안녕하세요!</p>
        {user.user_metadata?.nickname && (
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>{user.user_metadata.nickname} 님</p>
        )}
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24, wordBreak: 'break-all' }}>{user.email}</p>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: '#15803d', fontWeight: 700, marginBottom: 4 }}>✓ 모프 감정 무제한 이용 중</p>
          <p style={{ fontSize: 11, color: '#16a34a' }}>로그인 계정은 횟수 제한 없이 AI 감정을 이용할 수 있습니다.</p>
        </div>

        <button onClick={() => router.push('/analyze')}
          style={{ width: '100%', background: '#111', color: '#fff', borderRadius: 12, padding: '14px 0', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <Sparkles size={15} /> 모프 감정하러 가기 <ArrowRight size={14} />
        </button>
        <button onClick={() => router.push('/dashboard')}
          style={{ width: '100%', background: '#F9F9F7', color: '#111', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 500, border: '1px solid #E5E7EB', cursor: 'pointer', marginBottom: 10 }}>
          내 대시보드
        </button>
        <button onClick={async () => { await supabase.auth.signOut(); router.refresh(); }}
          style={{ width: '100%', background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0' }}>
          <LogOut size={14} /> 로그아웃
        </button>
      </div>
    </div>
  );

  /* ── 이메일 로그인 / 회원가입 ─────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);

    if (mode === 'signup') {
      if (nickname.trim().length < 2) { setError('닉네임을 2자 이상 입력해주세요.'); setLoading(false); return; }
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { nickname: nickname.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      else setSuccess('인증 이메일을 발송했습니다. 메일함을 확인해주세요. 인증 후 로그인하세요.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login')) setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        else if (error.message.includes('Email not confirmed')) setError('이메일 인증을 완료해주세요. 메일함을 확인하세요.');
        else setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      } else {
        router.push('/analyze'); router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setGLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError('Google 로그인 중 오류가 발생했습니다.'); setGLoading(false); }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', background: '#F9F9F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #E5E7EB', padding: '36px 32px', width: '100%', maxWidth: '380px', boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>

        {/* 로고 */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 }}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
            {mode === 'login'
              ? '로그인하면 AI 모프 감정을 무제한 이용할 수 있습니다.'
              : '파충류 마켓 Glint Archive에 오신 것을 환영합니다.'}
          </p>
        </div>

        {/* Google 로그인 */}
        <button type="button" onClick={handleGoogle} disabled={gLoading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#111', cursor: 'pointer', marginBottom: 20, opacity: gLoading ? 0.6 : 1, transition: 'border-color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#111')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          {gLoading
            ? <div style={{ width: 18, height: 18, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : <GoogleIcon />}
          Google로 {mode === 'login' ? '계속하기' : '가입하기'}
        </button>

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span style={{ fontSize: 11, color: '#d1d5db' }}>또는 이메일로</span>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <FloatInput label="닉네임 (2자 이상)" value={nickname} onChange={setNickname} required autoComplete="nickname" />
          )}
          <FloatInput label="이메일" type="email" value={email} onChange={setEmail} required autoComplete="email" />
          <FloatInput label="비밀번호 (6자 이상)" type="password" value={password} onChange={setPassword} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#15803d' }}>
              {success}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: '#111', color: '#fff', borderRadius: 12, padding: '15px 0', fontSize: 14, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}
          >
            {loading
              ? <div style={{ width: 18, height: 18, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        {/* 모드 전환 */}
        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20 }}>
          {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: '#111', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, fontSize: 13 }}
          >
            {mode === 'login' ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
