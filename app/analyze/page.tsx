'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Sparkles, AlertCircle, Zap, User, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/* ── 이미지 리사이즈 ─────────────────────────────────────────── */
const resizeImage = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const MAX = 1024;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = URL.createObjectURL(file);
  });

/* ── 비로그인 식별자 ─────────────────────────────────────────── */
const getIdentifier = (): string => {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem('ga_uid');
  if (stored) return stored;
  const uid = Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('ga_uid', uid);
  return uid;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MorphResult = Record<string, any>;

const TABS = ['감정 결과', '종 정보', '사육 가이드'];

/* ── 별점 컴포넌트 ───────────────────────────────────────────── */
function StarRating({ difficulty }: { difficulty: string }) {
  const map: Record<string, { stars: number; color: string; label: string }> = {
    '초보': { stars: 1, color: '#22c55e', label: '입문' },
    '중급': { stars: 3, color: '#f59e0b', label: '중급' },
    '고급': { stars: 5, color: '#ef4444', label: '고급' },
  };
  const info = map[difficulty] ?? { stars: 2, color: '#9ca3af', label: difficulty };
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < info.stars ? info.color : '#E5E7EB'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <span className="text-[11px] font-bold" style={{ color: info.color }}>{info.label}</span>
    </div>
  );
}

export default function AnalyzePage() {
  const [preview, setPreview]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<MorphResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('파일 크기는 10MB 이하여야 합니다.'); return; }
    setResult(null); setError(null); setActiveTab(0);
    const resized = await resizeImage(file);
    setPreview(resized);
  }, []);

  const handleAnalyze = async () => {
    if (!preview) return;
    setLoading(true); setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: preview, user_id: user?.id || null, identifier: getIdentifier() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        if (data.error === 'FREE_LIMIT') { setShowLoginPrompt(true); }
        else if (data.error === 'CONFIG_ERROR') { setError('서버 설정 오류입니다. 잠시 후 다시 시도해주세요.'); }
        else if (data.error === 'PARSE_ERROR') { setError('분석 결과를 처리하지 못했습니다. 더 선명한 사진으로 다시 시도해주세요.'); }
        else { setError(data.message || '오류가 발생했습니다. 다시 시도해주세요.'); }
        setLoading(false); return;
      }
      setResult(data as MorphResult);
      setLoading(false);
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const resetAll = () => {
    setPreview(null); setResult(null); setError(null); setActiveTab(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-ga-bg max-w-screen-sm mx-auto">

      {/* ── 헤더 ──────────────────────────────────────────────── */}
      <div className="bg-ga-white border-b border-ga-border px-5 pt-8 pb-5">
        <p className="text-[10px] text-ga-muted tracking-[0.2em] font-semibold mb-2 uppercase">Morph AI</p>
        <h1 className="font-serif text-2xl font-bold text-ga-black mb-1">모프 감정</h1>
        <p className="text-xs text-ga-muted mb-3">사진 한 장으로 종·모프·서식지·사육법까지</p>
        {/* 로그인 상태 배지 */}
        {currentUser ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
            <User size={13} className="text-green-600 flex-shrink-0" />
            <p className="text-[11px] text-green-700 font-semibold flex-1 truncate">{currentUser.email}</p>
            <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">무제한</span>
          </div>
        ) : (
          <Link href="/auth" className="flex items-center gap-2 bg-ga-bg border border-ga-border rounded-xl px-3 py-2 hover:border-ga-muted transition-colors">
            <LogIn size={13} className="text-ga-faint flex-shrink-0" />
            <p className="text-[11px] text-ga-muted flex-1">로그인하면 무제한으로 이용할 수 있어요</p>
            <span className="text-[10px] text-ga-faint flex-shrink-0">→</span>
          </Link>
        )}
      </div>

      <div className="px-4 py-5">

        {/* ── 업로드 영역 ───────────────────────────────────────── */}
        {!result && (
          <>
            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              className={[
                'bg-ga-white border-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors',
                preview ? 'border-ga-border p-0 overflow-hidden' : 'border-dashed border-ga-border hover:border-ga-muted p-8 min-h-[220px]',
                loading ? 'pointer-events-none opacity-60' : '',
              ].join(' ')}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="업로드 이미지" className="w-full h-[240px] object-cover rounded-2xl" />
              ) : (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-ga-bg border border-ga-border flex items-center justify-center mx-auto mb-4">
                    <Camera size={24} className="text-ga-faint" strokeWidth={1.5} />
                  </div>
                  <p className="font-serif text-base text-ga-black font-bold mb-1">사진을 올려주세요</p>
                  <p className="text-[12px] text-ga-muted mb-1">JPG, PNG · 최대 10MB</p>
                  <p className="text-[11px] text-ga-faint">비로그인 시 하루 2회 무료</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {preview && !loading && (
              <>
                <button
                  onClick={handleAnalyze}
                  className="w-full mt-4 bg-ga-black text-ga-white rounded-xl py-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:opacity-80 transition-opacity active:scale-[0.98]"
                >
                  <Sparkles size={16} />모프 감정하기
                </button>
                <button onClick={resetAll} className="w-full mt-2 bg-ga-white text-ga-muted border border-ga-border rounded-xl py-3 text-sm font-medium hover:border-ga-muted transition-colors">
                  다른 사진 선택
                </button>
              </>
            )}
          </>
        )}

        {/* ── 로딩 ─────────────────────────────────────────────── */}
        {loading && (
          <div className="bg-ga-white rounded-2xl border border-ga-border p-8">
            <div className="flex flex-col gap-3 mb-4">
              {[3, 2, 3, 2].map((w, i) => (
                <div key={i} className={`h-3 bg-ga-border rounded-full animate-pulse w-${w}/4`} />
              ))}
            </div>
            <p className="text-[11px] text-ga-muted text-center">AI가 모프를 분석하고 있습니다…</p>
          </div>
        )}

        {/* ── 에러 ─────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-5 text-center">
            <AlertCircle size={28} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-600 font-medium mb-4">{error}</p>
            <button onClick={resetAll} className="bg-ga-black text-ga-white rounded-lg px-6 py-2.5 text-sm font-bold">다시 시도하기</button>
          </div>
        )}

        {/* ── 결과: 파충류 아님 ─────────────────────────────────── */}
        {result && !result.identified && (
          <div className="bg-ga-white rounded-2xl border border-ga-border p-8 text-center">
            <AlertCircle size={24} className="text-ga-faint mx-auto mb-4" />
            <p className="font-serif text-lg font-bold text-ga-black mb-2">파충류를 확인할 수 없습니다</p>
            <p className="text-sm text-ga-muted mb-6">{result.reason}</p>
            <button onClick={resetAll} className="bg-ga-black text-ga-white rounded-lg px-6 py-2.5 text-sm font-bold">다른 사진으로 시도하기</button>
          </div>
        )}

        {/* ── 결과: 감정 성공 ───────────────────────────────────── */}
        {result && result.identified && (
          <div className="pb-28">

            {/* 결과 헤더 */}
            <div className="bg-ga-black rounded-2xl p-5 mb-3">
              <p className="text-[9px] text-zinc-600 tracking-[0.2em] font-semibold mb-3 uppercase">Morph Analysis Result</p>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider ${
                  result.confidence === '높음' ? 'bg-green-900 text-green-400' :
                  result.confidence === '중간' ? 'bg-yellow-900 text-yellow-400' :
                                                 'bg-zinc-800 text-zinc-400'
                }`}>
                  확신도 {result.confidence}
                </span>
                {result.morph?.rarity && (
                  <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">{result.morph.rarity}</span>
                )}
              </div>
              {result.species?.scientific && (
                <p className="text-[11px] text-zinc-600 italic mb-1">{result.species.scientific}</p>
              )}
              <h2 className="font-serif text-xl font-bold text-ga-white mb-0.5">
                {result.morph?.name || result.morph?.name_english}
              </h2>
              <p className="text-sm text-zinc-500">{result.morph?.name_english}</p>
              <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-4 flex-wrap">
                <div>
                  <p className="text-[9px] text-zinc-600 mb-0.5">종</p>
                  <p className="text-[13px] text-ga-white font-semibold">{result.species?.korean}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-600 mb-0.5">분류</p>
                  <p className="text-[13px] text-ga-white font-semibold">{result.species?.category}</p>
                </div>
                {result.care?.difficulty && (
                  <div>
                    <p className="text-[9px] text-zinc-600 mb-1">사육 난이도</p>
                    <StarRating difficulty={result.care.difficulty} />
                  </div>
                )}
              </div>
            </div>

            {/* 탭 */}
            <div className="flex bg-ga-white rounded-xl border border-ga-border mb-3 overflow-hidden">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-3 text-[11px] font-semibold transition-colors ${
                    activeTab === i ? 'bg-ga-black text-ga-white' : 'text-ga-muted'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── 탭 0: 감정 결과 ─────────────────── */}
            {activeTab === 0 && (
              <div className="flex flex-col gap-3">
                {/* 모프 설명 */}
                <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                  <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-3 uppercase">모프 설명</p>
                  <p className="text-sm text-ga-black leading-relaxed mb-3">{result.morph?.description}</p>
                  {result.morph?.history && (
                    <>
                      <div className="h-px bg-ga-border my-3" />
                      <p className="text-[11px] text-ga-muted leading-relaxed">{result.morph.history}</p>
                    </>
                  )}
                </div>

                {/* 시세 */}
                <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                  <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-3 uppercase">국내 예상 시세</p>
                  <p className="font-serif text-2xl font-bold text-ga-black mb-2">
                    {result.market?.price_min?.toLocaleString()}
                    <span className="text-ga-muted text-xl"> — </span>
                    {result.market?.price_max?.toLocaleString()}원
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      result.market?.price_trend === '상승중' ? 'bg-red-50 text-red-600' :
                      result.market?.price_trend === '하락중' ? 'bg-blue-50 text-blue-600' :
                                                                'bg-ga-bg text-ga-muted'
                    }`}>{result.market?.price_trend}</span>
                    <span className="text-[11px] text-ga-muted">수요 {result.market?.demand}</span>
                  </div>
                  <p className="text-[11px] text-ga-muted leading-relaxed">{result.market?.price_factors}</p>
                </div>

                {/* 사진 팁 */}
                {result.confidence !== '높음' && result.photo_quality?.better_photo_tips && (
                  <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4">
                    <p className="text-[10px] text-yellow-700 font-semibold tracking-wider mb-1.5 uppercase">더 정확한 감정을 위해</p>
                    <p className="text-[12px] text-yellow-800 leading-relaxed">{result.photo_quality.better_photo_tips}</p>
                  </div>
                )}

                {/* 비슷한 모프 */}
                {result.similar_morphs?.length > 0 && (
                  <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                    <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-3 uppercase">비슷한 모프와의 차이</p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {result.similar_morphs.map((m: any, i: number) => (
                      <div key={i} className={i > 0 ? 'mt-3 pt-3 border-t border-ga-border' : ''}>
                        <p className="font-serif text-[14px] font-bold text-ga-black mb-1">{m.name}</p>
                        <p className="text-[12px] text-ga-muted leading-relaxed">{m.difference}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 탭 1: 종 정보 ───────────────────── */}
            {activeTab === 1 && (
              <div className="flex flex-col gap-3">
                {/* 종 기본 정보 */}
                <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                  <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-4 uppercase">종 기본 정보</p>
                  <div className="space-y-3">
                    {[
                      { label: '한국어명',   val: result.species?.korean },
                      { label: '영문명',     val: result.species?.english },
                      { label: '학명',       val: result.species?.scientific, italic: true },
                      { label: '분류',       val: result.species?.category },
                    ].map(item => item.val && (
                      <div key={item.label} className="flex items-start gap-3">
                        <span className="text-[10px] text-ga-faint w-16 flex-shrink-0 pt-0.5">{item.label}</span>
                        <span className={`text-sm text-ga-black font-medium leading-relaxed ${item.italic ? 'italic text-ga-muted' : ''}`}>
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 서식지 */}
                {result.species?.habitat && (
                  <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                    <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-3 uppercase">서식지 & 원산지</p>
                    <p className="text-sm text-ga-black leading-relaxed">{result.species.habitat}</p>
                  </div>
                )}

                {/* 성격 */}
                {result.species?.personality && (
                  <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                    <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-3 uppercase">성격 & 행동 특성</p>
                    <p className="text-sm text-ga-black leading-relaxed">{result.species.personality}</p>
                  </div>
                )}

                {/* 유전자 구성 */}
                {result.genetics?.traits?.length > 0 && (
                  <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                    <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-4 uppercase">유전자 구성</p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {result.genetics.traits.map((trait: any, i: number) => (
                      <div key={i} className={i > 0 ? 'mt-4 pt-4 border-t border-ga-border' : ''}>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-serif text-[15px] font-bold text-ga-black">{trait.gene}</span>
                          <span className="text-[9px] bg-ga-bg text-ga-muted border border-ga-border px-2 py-0.5 rounded font-medium">{trait.type}</span>
                        </div>
                        <p className="text-[12px] text-ga-muted leading-relaxed">{trait.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 브리딩 */}
                {result.genetics?.breeding_notes && (
                  <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                    <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-3 uppercase">브리딩 포인트</p>
                    <p className="text-sm text-ga-black leading-relaxed">{result.genetics.breeding_notes}</p>
                  </div>
                )}

                {result.genetics?.possible_offspring && (
                  <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                    <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-3 uppercase">만들 수 있는 자녀 모프</p>
                    <p className="text-sm text-ga-black leading-relaxed">{result.genetics.possible_offspring}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── 탭 2: 사육 가이드 ───────────────── */}
            {activeTab === 2 && (
              <div className="flex flex-col gap-3">
                {/* 난이도 + 입문 추천 */}
                <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold uppercase">사육 난이도</p>
                    <div className="flex items-center gap-2">
                      <StarRating difficulty={result.care?.difficulty ?? ''} />
                      {result.care?.beginner_friendly && (
                        <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">입문 추천</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 온도·습도 */}
                <div className="bg-ga-white rounded-2xl border border-ga-border p-5">
                  <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-4 uppercase">온도 & 습도</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '핫스팟',    val: result.care?.temperature?.hot_spot },
                      { label: '시원한 쪽', val: result.care?.temperature?.cool_side },
                      { label: '야간',      val: result.care?.temperature?.night },
                      { label: '습도',      val: result.care?.humidity },
                    ].map(item => (
                      <div key={item.label} className="bg-ga-bg rounded-xl p-3">
                        <p className="text-[10px] text-ga-faint mb-1">{item.label}</p>
                        <p className="font-serif text-sm font-bold text-ga-black">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 상세 정보 */}
                {[
                  { label: '사육장',   val: result.care?.enclosure },
                  { label: '먹이',     val: result.care?.diet },
                  { label: '평균 수명', val: result.care?.lifespan },
                  { label: '주의사항', val: result.care?.special_notes },
                ].map(item => item.val && (
                  <div key={item.label} className="bg-ga-white rounded-2xl border border-ga-border p-5">
                    <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-2 uppercase">{item.label}</p>
                    <p className="text-sm text-ga-black leading-relaxed">{item.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex flex-col gap-2 mt-4">
              <Link
                href="/deals"
                className="w-full bg-ga-black text-ga-white rounded-xl py-4 text-sm font-bold tracking-wide text-center flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Zap size={16} />이 모프 타임딜 보러가기
              </Link>
              <button onClick={resetAll} className="w-full bg-ga-white text-ga-muted border border-ga-border rounded-xl py-3 text-sm font-medium hover:border-ga-muted transition-colors">
                다시 감정하기
              </button>
            </div>
            <p className="text-[10px] text-ga-faint text-center mt-4 px-2 leading-relaxed">{result.disclaimer}</p>
          </div>
        )}
      </div>

      {/* ── 로그인 유도 모달 (게스트 2회 초과 시) ───────────────── */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center px-4">
          <div className="bg-ga-white rounded-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-ga-black flex items-center justify-center mb-4">
              <Sparkles size={20} className="text-white" />
            </div>
            <h2 className="font-serif text-xl font-bold text-ga-black mb-1">오늘 무료 횟수를 모두 사용했습니다</h2>
            <p className="text-sm text-ga-muted mb-5">로그인하면 횟수 제한 없이 모프 감정을 이용할 수 있습니다.</p>
            <div className="bg-ga-bg rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-[10px] text-green-700 font-bold">✓</span>
                <span className="text-sm text-ga-black font-medium">모프 감정 무제한</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-[10px] text-green-700 font-bold">✓</span>
                <span className="text-sm text-ga-black font-medium">감정 기록 자동 저장</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-[10px] text-green-700 font-bold">✓</span>
                <span className="text-sm text-ga-black font-medium">찜·패스포트 전 기능 이용</span>
              </div>
            </div>
            <Link
              href="/auth"
              className="w-full bg-ga-black text-ga-white rounded-xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity mb-3"
              onClick={() => setShowLoginPrompt(false)}
            >
              <LogIn size={15} /> 로그인 / 회원가입하기
            </Link>
            <button onClick={() => setShowLoginPrompt(false)} className="w-full text-center text-sm text-ga-muted py-2">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
