'use client';

import { useState, useCallback } from 'react';
import type { ShopSearchResult } from '@/app/api/shops/search/route';

interface Props {
  user: { id: string; email: string };
  onClaimed: (shop: Record<string, unknown>) => void;
}

type Step = 'search' | 'select' | 'form' | 'done';

export default function ShopClaimFlow({ onClaimed }: Props) {
  const [step, setStep] = useState<Step>('search');
  const [region, setRegion] = useState('서울');
  const [shops, setShops] = useState<ShopSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ShopSearchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    description: '',
    opening_hours: '',
    website_url: '',
    instagram_url: '',
    kakao_channel_url: '',
  });

  const searchShops = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/shops/search?region=${encodeURIComponent(region)}`);
      const data = await res.json();
      setShops(data.results ?? []);
      setStep('select');
    } catch {
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [region]);

  const handleSelect = (shop: ShopSearchResult) => {
    setSelected(shop);
    setStep('form');
  };

  const handleClaim = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/shops/${selected.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selected.name,
          address: selected.address,
          phone: selected.phone,
          lat: selected.lat,
          lng: selected.lng,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('done');
      setTimeout(() => onClaimed(data.shop), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산'];
  const stepIndex = step === 'search' ? 0 : step === 'select' ? 1 : step === 'form' ? 2 : 3;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-950 rounded-2xl mb-5"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            <span className="text-2xl">🦎</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-zinc-950 tracking-tight mb-2">내 샵 등록하기</h1>
          <p className="text-[13px] text-zinc-500">카카오맵의 내 샵을 찾아 사장님 계정과 연결하세요</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {['지역 선택', '샵 선택', '정보 입력'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  i < stepIndex
                    ? 'bg-zinc-400 text-white'
                    : stepIndex === i
                    ? 'bg-zinc-950 text-white'
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200',
                ].join(' ')}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`hidden sm:block text-[11px] font-medium ${stepIndex === i ? 'text-zinc-950' : 'text-zinc-400'}`}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className="w-6 h-px bg-zinc-200" />}
            </div>
          ))}
        </div>

        {/* Step 1: 지역 선택 */}
        {step === 'search' && (
          <div className="bg-white rounded-2xl border border-zinc-100 p-8"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)' }}>
            <h2 className="text-lg font-semibold text-zinc-950 mb-1.5">샵이 있는 지역을 선택하세요</h2>
            <p className="text-[13px] text-zinc-500 mb-6">해당 지역의 파충류 샵 목록을 불러옵니다</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {REGIONS.map(r => (
                <button key={r}
                  onClick={() => setRegion(r)}
                  className={[
                    'py-2.5 rounded-xl text-[13px] font-medium border transition-all',
                    region === r
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-zinc-300',
                  ].join(' ')}>
                  {r}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <button onClick={searchShops} disabled={loading}
              className="w-full py-3.5 bg-zinc-950 text-white rounded-xl font-semibold text-[13px] hover:bg-zinc-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 검색 중…</>
              ) : '샵 목록 불러오기'}
            </button>
          </div>
        )}

        {/* Step 2: 샵 선택 */}
        {step === 'select' && (
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)' }}>
            <div className="p-6 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">내 샵을 선택하세요</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{region} · {shops.length}개 샵</p>
                </div>
                <button onClick={() => setStep('search')}
                  className="text-xs text-zinc-500 hover:text-zinc-950 font-medium transition-colors">
                  ← 다시 선택
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-50">
              {shops.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-400">
                  이 지역에서 샵을 찾지 못했습니다
                </div>
              ) : shops.map(shop => (
                <button key={shop.id} onClick={() => handleSelect(shop)}
                  className="w-full text-left px-6 py-4 hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] text-zinc-950">{shop.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">{shop.address}</p>
                      {shop.phone && <p className="text-xs text-zinc-400 mt-0.5">{shop.phone}</p>}
                    </div>
                    <span className="badge badge-gray flex-shrink-0">{shop.address.split(' ').slice(0,2).join(' ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 추가 정보 */}
        {step === 'form' && selected && (
          <div className="bg-white rounded-2xl border border-zinc-100 p-8"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)' }}>
            {/* 선택된 샵 */}
            <div className="bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-serif font-bold text-lg">{selected.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-[13px] text-zinc-950">{selected.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{selected.address}</p>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-zinc-950 mb-1">샵 소개를 작성하세요</h2>
            <p className="text-[13px] text-zinc-500 mb-6">고객에게 보여질 정보입니다 (나중에 수정 가능)</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">샵 소개</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  placeholder="어떤 파충류를 전문으로 하는지, 샵의 특징을 알려주세요"
                  rows={3}
                  className="input resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">영업시간</label>
                <input type="text" value={form.opening_hours}
                  onChange={e => setForm(f => ({...f, opening_hours: e.target.value}))}
                  placeholder="예) 평일 12:00~20:00, 주말 11:00~18:00"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">인스타그램</label>
                  <input type="text" value={form.instagram_url}
                    onChange={e => setForm(f => ({...f, instagram_url: e.target.value}))}
                    placeholder="@username"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">카카오 채널</label>
                  <input type="text" value={form.kakao_channel_url}
                    onChange={e => setForm(f => ({...f, kakao_channel_url: e.target.value}))}
                    placeholder="채널 URL"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('select')}
                className="flex-1 py-3.5 rounded-xl border border-zinc-200 text-[13px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
                ← 돌아가기
              </button>
              <button onClick={handleClaim} disabled={submitting}
                className="flex-[2] py-3.5 bg-zinc-950 text-white rounded-xl font-semibold text-[13px] hover:bg-zinc-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 등록 중…</>
                ) : '내 샵으로 등록'}
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)' }}>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-2">등록 완료!</h2>
            <p className="text-[13px] text-zinc-500">대시보드로 이동 중…</p>
          </div>
        )}
      </div>
    </div>
  );
}
