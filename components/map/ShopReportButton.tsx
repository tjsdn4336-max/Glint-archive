'use client';

import { useState, useRef, useEffect } from 'react';

interface FormState {
  name: string;
  address: string;
  instagram: string;
  phone: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

/* ── 카카오 주소 → 좌표 변환 ─────────────────────────────────── */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise(resolve => {
    if (!window.kakao?.maps?.services) { resolve(null); return; }
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: Array<{ y: string; x: string }>, status: string) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
      } else {
        resolve(null);
      }
    });
  });
}

export default function ShopReportButton() {
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState<FormState>({ name: '', address: '', instagram: '', phone: '' });
  const [coords, setCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState<Toast | null>(null);
  const toastTimer            = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type: Toast['type']) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  /* 주소 입력 완료 시 좌표 자동 추출 */
  async function handleAddressBlur() {
    if (!form.address.trim()) return;
    const result = await geocodeAddress(form.address.trim());
    if (result) setCoords(result);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/shops/report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:      form.name.trim(),
          address:   form.address.trim(),
          instagram: form.instagram.trim() || undefined,
          phone:     form.phone.trim() || undefined,
          lat:       coords?.lat,
          lng:       coords?.lng,
        }),
      });
      if (res.ok) {
        setOpen(false);
        setForm({ name: '', address: '', instagram: '', phone: '' });
        setCoords(null);
        showToast('제보해주셔서 감사합니다. 검토 후 등록됩니다.', 'success');
      } else {
        showToast('잠시 후 다시 시도해주세요.', 'error');
      }
    } catch {
      showToast('잠시 후 다시 시도해주세요.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── 제보 버튼 ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-10 right-3 z-10 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 font-medium shadow-sm hover:shadow-md transition-shadow"
      >
        ＋ 샵 제보하기
      </button>

      {/* ── 모달 ──────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center px-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mt-24 shadow-xl">
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-1">
              등록되지 않은 샵을 제보해주세요
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              검토 후 24시간 내 지도에 반영됩니다
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="샵 이름 *  예: 레프타일 스튜디오"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 w-full mb-3 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="주소 *  도로명 주소 입력"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  onBlur={handleAddressBlur}
                  required
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 w-full focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                {coords && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-500 font-semibold">
                    좌표 확인 ✓
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="인스타그램  @username"
                value={form.instagram}
                onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 w-full mb-3 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <input
                type="text"
                placeholder="전화번호  010-0000-0000"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 w-full mb-5 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-900 text-white rounded-xl py-3 text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? '제출 중…' : '제보하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 토스트 ────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
