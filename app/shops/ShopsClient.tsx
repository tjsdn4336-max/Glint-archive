'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import ShopListCard from '@/components/map/ShopListCard';
import type { ShopSearchResult } from '@/app/api/shops/search/route';

const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전'];

function CardSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-ga-border">
      <div className="w-5 h-4 bg-ga-border animate-pulse rounded" />
      <div className="w-12 h-12 bg-ga-border animate-pulse rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-ga-border animate-pulse rounded w-2/3" />
        <div className="h-3 bg-ga-border animate-pulse rounded w-1/3" />
        <div className="h-3 bg-ga-border animate-pulse rounded w-1/2" />
      </div>
    </div>
  );
}

interface Props {
  totalCount: number;
}

export default function ShopsClient({ totalCount }: Props) {
  const [region, setRegion]       = useState('전체');
  const [openOnly, setOpenOnly]   = useState(false);
  const [shops, setShops]         = useState<ShopSearchResult[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const fetchShops = useCallback(async (r: string) => {
    setLoading(true);
    setError(null);
    try {
      const param = r === '전체' ? '' : `?region=${encodeURIComponent(r)}`;
      const res   = await fetch(`/api/shops/search${param}`);
      if (!res.ok) throw new Error(`API 오류 (${res.status})`);
      const data  = await res.json();
      if (data.error) throw new Error(data.error);
      setShops(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '검색 중 오류가 발생했습니다.');
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(region); }, [region, fetchShops]);

  const displayed = openOnly ? shops.filter(s => s.is_open) : shops;

  return (
    <div className="min-h-screen bg-ga-bg">

      {/* 페이지 헤더 */}
      <div className="bg-ga-white border-b border-ga-border px-5 pt-8 pb-6 md:px-8">
        <p className="text-[10px] text-ga-muted tracking-[0.2em] font-semibold mb-2 uppercase">
          Shop Tour
        </p>
        <h1 className="font-serif text-3xl font-bold text-ga-black mb-1">샵 투어</h1>
        <p className="text-sm text-ga-muted">전국 {totalCount}개 파충류 샵</p>
      </div>

      {/* 지역 필터 탭 */}
      <div className="bg-ga-white border-b border-ga-border">
        <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide md:px-8">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              disabled={loading}
              className={[
                'flex-shrink-0 px-3 py-1.5 rounded text-xs font-bold transition-colors',
                region === r
                  ? 'bg-ga-black text-ga-white'
                  : 'bg-ga-white text-ga-muted border border-ga-border hover:border-ga-muted',
                loading && region !== r ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 영업 상태 토글 */}
      <div className="flex items-center gap-3 px-5 py-3 bg-ga-white border-b border-ga-border md:px-8">
        <button
          onClick={() => setOpenOnly(v => !v)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
            openOnly ? 'text-ga-green' : 'text-ga-muted'
          }`}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: openOnly ? '#1A7F4B' : '#C8C8C4' }}
          />
          영업중만 보기
        </button>
      </div>

      {/* 결과 수 */}
      <p className="text-[11px] text-ga-muted tracking-wider px-5 pt-4 pb-2 md:px-8">
        {loading ? '검색 중…' : `${displayed.length}개 샵`}
        {!loading && region !== '전체' && <span className="ml-1.5">· {region}</span>}
      </p>

      {/* 카드 리스트 */}
      <div className="px-5 md:px-8">

        {loading && (
          <div>
            {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-sm text-ga-muted mb-3">{error}</p>
            <button
              onClick={() => fetchShops(region)}
              className="text-xs font-semibold text-ga-black underline underline-offset-2"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-ga-muted mb-2">
              {openOnly ? '현재 영업중인 샵이 없습니다.' : '이 지역에 등록된 샵이 없습니다.'}
            </p>
            <p className="text-xs text-ga-faint">알고 있는 샵을 제보해주시면 검토 후 등록됩니다.</p>
          </div>
        )}

        {!loading && !error && displayed.length > 0 && (
          <div>
            {displayed.map((shop, index) => (
              <ShopListCard key={shop.id} shop={shop} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* 샵 제보 버튼 */}
      <div className="px-5 py-8 md:px-8">
        <button
          onClick={() => setShowReport(true)}
          className="w-full flex items-center justify-center gap-2 bg-ga-white border border-ga-border rounded-xl py-3.5 text-sm text-ga-muted font-medium hover:border-ga-muted transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} />
          등록되지 않은 샵 제보하기
        </button>
      </div>

      {/* 제보 모달 */}
      {showReport && (
        <ReportModal onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

/* ── 제보 모달 (ShopReportButton 기능 인라인) ───────────────────── */
function ReportModal({ onClose }: { onClose: () => void }) {
  const [form, setForm]       = useState({ name: '', address: '', phone: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [err, setErr]         = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.address) { setErr('샵 이름과 주소는 필수입니다.'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/shops/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('제보 실패');
      setSent(true);
    } catch {
      setErr('제보 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-ga-white rounded-2xl border border-ga-border w-full max-w-sm p-6">
        {sent ? (
          <div className="text-center py-4">
            <p className="font-serif text-lg font-bold text-ga-black mb-2">감사합니다!</p>
            <p className="text-sm text-ga-muted mb-5">제보가 접수되었습니다.<br />검토 후 등록됩니다.</p>
            <button onClick={onClose}
              className="px-6 py-2.5 bg-ga-black text-ga-white text-sm font-bold rounded-lg">
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif font-bold text-ga-black">샵 제보하기</h3>
              <button onClick={onClose} className="text-ga-muted text-xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'name',    label: '샵 이름 *',  placeholder: '파충류 샵 이름' },
                { key: 'address', label: '주소 *',     placeholder: '서울 강남구 …' },
                { key: 'phone',   label: '전화번호',   placeholder: '010-0000-0000' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] text-ga-muted font-semibold tracking-wider uppercase mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="ga-input w-full"
                  />
                </div>
              ))}
              {err && <p className="text-xs text-ga-red">{err}</p>}
            </div>
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="w-full mt-5 py-3 bg-ga-black text-ga-white font-bold text-sm rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {sending ? '제보 중…' : '제보하기'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
