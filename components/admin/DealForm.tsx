'use client';

import { useState, useEffect } from 'react';
import type { DealResult } from '@/app/api/deals/route';
import { getMonthlyDealCount, canPostDeal, canTimeDeal } from '@/lib/plan-gate';

const ANIMAL_TYPES = ['레오파드 게코', '볼파이톤', '크레스티드 게코', '비어디 드래곤', '콘스네이크', '킹스네이크', '이구아나', '카멜레온', '기타'];

interface Props {
  shopId: string;
  shopName: string;
  shopPlan?: string;
  initialData?: DealResult | null;
  onSuccess: (deal: DealResult) => void;
  onCancel: () => void;
}

export default function DealForm({ shopId, shopPlan = 'basic', initialData, onSuccess, onCancel }: Props) {
  const [gateChecked, setGateChecked]     = useState(false);
  const [canPost, setCanPost]             = useState(true);
  const timeDealAllowed                   = canTimeDeal(shopPlan);

  useEffect(() => {
    if (initialData) { setGateChecked(true); setCanPost(true); return; } // 수정 시 항상 허용
    getMonthlyDealCount(shopId).then(count => {
      setCanPost(canPostDeal(shopPlan, count));
      setGateChecked(true);
    });
  }, [shopId, shopPlan, initialData]);

  // 게이트 로딩 중
  if (!gateChecked) return (
    <div className="bg-ga-white rounded-2xl border border-ga-border p-8 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-ga-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // 월 3건 초과 → 업그레이드 배너
  if (!canPost) return (
    <div className="bg-ga-black rounded-2xl p-6 text-center">
      <p className="font-serif text-ga-white text-lg font-bold mb-1">
        이번 달 무료 등록 3건을 모두 사용했습니다
      </p>
      <p className="text-white/40 text-sm mb-5">
        PRO 플랜으로 업그레이드하면<br />
        딜 무제한 등록 · 타임딜 · 패스포트 발급이 가능합니다
      </p>
      <div className="bg-ga-white rounded-xl p-4 mb-4 text-left">
        <p className="text-[10px] text-ga-muted mb-3 tracking-widest uppercase">PRO 플랜 혜택</p>
        <div className="flex flex-col gap-2">
          {['딜 등록 무제한', '타임딜 기능 사용', '디지털 패스포트 발급', '상단 노출 우선권', '문의 연결 전체 채널'].map(b => (
            <p key={b} className="text-sm text-ga-black">— {b}</p>
          ))}
        </div>
      </div>
      <p className="font-serif text-ga-white text-2xl font-bold mb-1">월 49,000원</p>
      <p className="text-white/30 text-xs mb-5">부가세 포함</p>
      <button className="bg-ga-white text-ga-black rounded-lg px-8 py-3 text-sm font-bold w-full hover:opacity-90 transition-opacity">
        PRO 플랜 시작하기
      </button>
      <button onClick={onCancel} className="mt-3 text-white/30 text-xs underline">닫기</button>
    </div>
  );
  const isEdit = !!initialData;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title:          initialData?.title          ?? '',
    description:    initialData?.description    ?? '',
    animal_type:    initialData?.animal_type    ?? '',
    morph:          initialData?.morph          ?? '',
    price:          initialData?.price          ? String(initialData.price)          : '',
    original_price: initialData?.original_price ? String(initialData.original_price) : '',
    quantity:       initialData?.quantity       ? String(initialData.quantity)       : '1',
    image_url:      initialData?.image_url      ?? '',
    contact_type:   initialData?.contact_type   ?? 'kakao',
    contact_value:  initialData?.contact_value  ?? '',
    ends_at:        initialData?.ends_at        ? initialData.ends_at.slice(0, 16) : '',
  });

  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async () => {
    if (!form.title || !form.price) { setError('제목과 가격은 필수입니다.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const url    = isEdit ? `/api/deals/${initialData!.id}` : '/api/deals';
      const method = isEdit ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price:          Number(form.price),
          original_price: form.original_price ? Number(form.original_price) : null,
          quantity:       Number(form.quantity),
          ends_at:        form.ends_at || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.deal);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const discountPct = form.price && form.original_price
    ? Math.round((1 - Number(form.price) / Number(form.original_price)) * 100)
    : null;

  const inputClass = 'ga-input';
  const labelClass = 'block text-[11px] text-ga-muted font-semibold tracking-wider uppercase mb-2';

  return (
    <div className="bg-ga-white rounded-2xl border border-ga-black p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-ga-black text-[15px]">{isEdit ? '딜 수정' : '새 타임딜 등록'}</h3>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg text-ga-muted hover:text-ga-black hover:bg-ga-bg transition-colors text-lg">×</button>
      </div>

      {/* 제목 */}
      <div>
        <label className={labelClass}>딜 제목 *</label>
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="예) 레오파드 게코 밀크 모프 분양합니다"
          className={inputClass}
        />
      </div>

      {/* 종류 + 모프 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>동물 종류</label>
          <select value={form.animal_type} onChange={e => set('animal_type', e.target.value)}
            className={inputClass}>
            <option value="">선택</option>
            {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>모프/품종</label>
          <input type="text" value={form.morph} onChange={e => set('morph', e.target.value)}
            placeholder="예) 밀크, 아멜, 블론드..."
            className={inputClass}
          />
        </div>
      </div>

      {/* 가격 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>분양가 (원) *</label>
          <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
            placeholder="150000"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            원래 가격 (선택){' '}
            {discountPct && <span className="text-zinc-950 font-bold">{discountPct}% 할인</span>}
          </label>
          <input type="number" value={form.original_price} onChange={e => set('original_price', e.target.value)}
            placeholder="200000"
            className={inputClass}
          />
        </div>
      </div>

      {/* 수량 + 마감 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>수량</label>
          <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)}
            min="1" className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>마감 일시 (타임딜용)</label>
          <div className="relative group">
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={e => timeDealAllowed && set('ends_at', e.target.value)}
              disabled={!timeDealAllowed}
              className={`${inputClass} ${!timeDealAllowed ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
            {!timeDealAllowed && (
              <>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  🔒
                </span>
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  PRO 플랜 전용 기능입니다
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 URL */}
      <div>
        <label className={labelClass}>이미지 URL (선택)</label>
        <input type="text" value={form.image_url} onChange={e => set('image_url', e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* 소개 */}
      <div>
        <label className={labelClass}>소개 (선택)</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="개체 상태, 나이, 특이사항 등"
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* 문의 방법 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>문의 방법</label>
          <select value={form.contact_type} onChange={e => set('contact_type', e.target.value)}
            className={inputClass}>
            <option value="kakao">카카오채널</option>
            <option value="phone">전화</option>
            <option value="instagram">인스타그램 DM</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>문의처 (URL or 번호)</label>
          <input type="text" value={form.contact_value} onChange={e => set('contact_value', e.target.value)}
            placeholder={form.contact_type === 'phone' ? '010-0000-0000' : 'URL'}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-ga-red">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-lg border border-ga-border text-sm font-semibold text-ga-muted hover:bg-ga-bg transition-colors">
          취소
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-[2] py-3 bg-ga-black text-ga-white rounded-lg font-bold text-sm hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 저장 중…</>
            : isEdit ? '수정 완료' : '딜 등록하기'}
        </button>
      </div>
    </div>
  );
}
