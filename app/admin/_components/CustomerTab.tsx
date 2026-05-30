'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Search, ChevronRight, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  kakao_id?: string;
  instagram?: string;
  notes?: string;
  tags: string[];
  total_purchases: number;
  created_at: string;
}

interface Sale {
  id: string;
  sale_price: number;
  sold_at: string;
  inventory: {
    name_korean: string;
    morph?: string;
  } | null;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  is_sent: boolean;
  created_at: string;
}

interface Props {
  shopId: string;
}

const PRESET_TAGS = ['볼파이톤', '레오파드게코', '크레스티드게코', '비어디드래곤', '콘스네이크', '파이드', '알비노', '희귀종'];

export default function CustomerTab({ shopId }: Props) {
  const sb = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [selected, setSelected]   = useState<Customer | null>(null);
  const [sales, setSales]         = useState<Sale[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg]   = useState('');
  const [savingNotif, setSavingNotif] = useState(false);
  const [toast, setToast]         = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', phone: '', kakao_id: '', instagram: '', notes: '', tags: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any)
      .from('shop_customers')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    setCustomers(data ?? []);
    setLoading(false);
  }, [shopId]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const fetchDetail = useCallback(async (customerId: string) => {
    setLoadingDetail(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: saleData } = await (sb as any)
      .from('sales')
      .select('id, sale_price, sold_at, inventory(name_korean, morph)')
      .eq('customer_id', customerId)
      .order('sold_at', { ascending: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: notifData } = await (sb as any)
      .from('shop_notifications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    setSales(saleData ?? []);
    setNotifications(notifData ?? []);
    setLoadingDetail(false);
  }, []);

  const handleSelectCustomer = (c: Customer) => {
    setSelected(c);
    fetchDetail(c.id);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from('shop_customers').insert({
      shop_id: shopId,
      name: form.name.trim(),
      phone: form.phone || null,
      kakao_id: form.kakao_id || null,
      instagram: form.instagram || null,
      notes: form.notes || null,
      tags: form.tags,
    });
    setSaving(false);
    if (!error) {
      setShowAdd(false);
      setForm({ name:'', phone:'', kakao_id:'', instagram:'', notes:'', tags:[] });
      fetchCustomers();
      showToast('고객이 등록됐습니다');
    }
  };

  const handleSendNotif = async () => {
    if (!selected || !notifMsg.trim()) return;
    setSavingNotif(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('shop_notifications').insert({
      shop_id: shopId, customer_id: selected.id,
      message: notifMsg.trim(), type: 'new_stock', is_sent: false,
    });
    setSavingNotif(false);
    setShowNotif(false);
    setNotifMsg('');
    fetchDetail(selected.id);
    showToast('알림 메모가 저장됐습니다');
  };

  const toggleTag = (tag: string) => {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
    }));
  };

  const filtered = customers.filter(c =>
    c.name.includes(search) || (c.phone ?? '').includes(search)
  );

  /* ───── 고객 상세 뷰 ───── */
  if (selected) return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8E8E4]">
        <button onClick={() => setSelected(null)}
          className="w-8 h-8 rounded-full bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center">
          <X size={14} className="text-[#111]" />
        </button>
        <div>
          <h2 className="font-serif text-lg font-bold text-[#111]">{selected.name}</h2>
          {selected.phone && <p className="text-xs text-[#9A9A94]">{selected.phone}</p>}
        </div>
        <button onClick={() => setShowNotif(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-[#F7F7F5] border border-[#E8E8E4] rounded-lg text-xs font-semibold text-[#111] hover:bg-[#E8E8E4]">
          <Bell size={12} /> 알림 메모
        </button>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* 고객 정보 */}
        <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4 space-y-2">
          {[
            { label: '카카오 ID', value: selected.kakao_id },
            { label: '인스타그램', value: selected.instagram },
            { label: '메모', value: selected.notes },
          ].filter(f => f.value).map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase w-20 pt-0.5 flex-shrink-0">{f.label}</span>
              <span className="text-sm text-[#111]">{f.value}</span>
            </div>
          ))}
          {selected.tags.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase w-20 pt-0.5 flex-shrink-0">관심 모프</span>
              <div className="flex flex-wrap gap-1">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 bg-[#F7F7F5] border border-[#E8E8E4] rounded-full text-[#111]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase w-20 flex-shrink-0">총 구매</span>
            <span className="font-serif text-lg font-bold text-[#111]">{selected.total_purchases}건</span>
          </div>
        </div>

        {/* 구매 이력 */}
        <div>
          <p className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-3">구매 이력</p>
          {loadingDetail ? (
            <div className="bg-white rounded-2xl border border-[#E8E8E4] h-24 animate-pulse" />
          ) : sales.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E8E4] py-10 text-center">
              <p className="text-sm text-[#9A9A94]">구매 이력이 없습니다</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
              {sales.map((sale, i) => (
                <div key={sale.id} className={`px-4 py-3 ${i < sales.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#111]">{sale.inventory?.name_korean ?? '개체'}</p>
                      {sale.inventory?.morph && <p className="text-xs text-[#9A9A94]">{sale.inventory.morph}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-sm font-bold text-[#111]">{sale.sale_price.toLocaleString()}원</p>
                      <p className="text-[10px] text-[#9A9A94]">{sale.sold_at.slice(0,10)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 알림 이력 */}
        {notifications.length > 0 && (
          <div>
            <p className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-3">알림 메모</p>
            <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
              {notifications.map((n, i) => (
                <div key={n.id} className={`px-4 py-3 ${i < notifications.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-[#111] flex-1">{n.message}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                      n.is_sent ? 'bg-green-50 text-[#1A7F4B]' : 'bg-[#F7F7F5] text-[#9A9A94]'
                    }`}>
                      {n.is_sent ? '발송됨' : '미발송'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#C8C8C4] mt-1">{n.created_at.slice(0,10)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 알림 메모 모달 */}
      {showNotif && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md">
            <div className="px-5 py-4 border-b border-[#E8E8E4] flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#111]">알림 메모 — {selected.name}</h3>
              <button onClick={() => setShowNotif(false)}><X size={18} className="text-[#9A9A94]" /></button>
            </div>
            <div className="p-5 space-y-3">
              <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
                placeholder="보내고 싶은 메시지를 입력하세요 (예: 원하시던 파이드 볼파이톤 입고됐습니다!)"
                rows={4}
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              <p className="text-[10px] text-[#9A9A94]">* 실제 문자 발송은 추후 지원 예정. 지금은 메모로 저장됩니다.</p>
              <button onClick={handleSendNotif} disabled={savingNotif || !notifMsg.trim()}
                className="w-full bg-[#111] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-40">
                {savingNotif ? '저장 중…' : '알림 메모 저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#111] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );

  /* ───── 고객 리스트 뷰 ───── */
  return (
    <div>
      {/* 액션 바 */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold mb-0.5">CUSTOMERS</p>
          <h2 className="font-serif text-xl font-bold text-[#111]">고객 관리</h2>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-[#111] text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center gap-1.5">
          <Plus size={14} /> 고객 등록
        </button>
      </div>

      {/* 검색 */}
      <div className="px-5 pb-3">
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8C8C4]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="이름·연락처 검색"
            className="w-full bg-white border border-[#E8E8E4] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111] placeholder:text-[#C8C8C4] outline-none focus:ring-1 focus:ring-[#111]" />
        </div>
      </div>

      {/* 고객 리스트 */}
      <div className="px-5 space-y-2 pb-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-[#E8E8E4] h-20 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E4] py-16 text-center">
            <p className="text-sm text-[#9A9A94] mb-1">{customers.length === 0 ? '등록된 고객이 없습니다' : '검색 결과가 없습니다'}</p>
            <p className="text-xs text-[#C8C8C4]">분양 처리 시 자동 등록되거나 직접 추가하세요</p>
          </div>
        ) : filtered.map(c => (
          <button key={c.id} onClick={() => handleSelectCustomer(c)}
            className="w-full bg-white rounded-2xl border border-[#E8E8E4] p-4 flex items-center gap-4 hover:border-[#9A9A94] transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center flex-shrink-0">
              <span className="font-serif text-sm font-bold text-[#9A9A94]">{c.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#111]">{c.name}</p>
              {c.phone && <p className="text-xs text-[#9A9A94] mt-0.5">{c.phone}</p>}
              {c.tags.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {c.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#F7F7F5] rounded-full text-[#9A9A94]">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0 flex items-center gap-2">
              <div>
                <p className="font-serif text-base font-bold text-[#111]">{c.total_purchases}</p>
                <p className="text-[10px] text-[#9A9A94]">구매</p>
              </div>
              <ChevronRight size={14} className="text-[#C8C8C4]" />
            </div>
          </button>
        ))}
      </div>

      {/* 고객 등록 모달 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#E8E8E4] px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#111]">고객 등록</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-[#9A9A94]" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: 'name', label: '이름', required: true, placeholder: '홍길동' },
                { key: 'phone', label: '전화번호', placeholder: '010-0000-0000' },
                { key: 'kakao_id', label: '카카오 ID', placeholder: 'kakao_id' },
                { key: 'instagram', label: '인스타그램', placeholder: '@username' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">
                    {f.label}{f.required && ' *'}
                  </label>
                  <input value={form[f.key as keyof typeof form] as string}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                </div>
              ))}

              {/* 관심 모프 태그 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">관심 모프 태그</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        form.tags.includes(tag) ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-[#9A9A94] border-[#E8E8E4] hover:border-[#111]'
                      }`}>
                      #{tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newTag} onChange={e => setNewTag(e.target.value)}
                    placeholder="직접 입력"
                    className="flex-1 border border-[#E8E8E4] rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                  <button onClick={() => { if (newTag.trim()) { toggleTag(newTag.trim()); setNewTag(''); } }}
                    className="px-3 py-2 bg-[#F7F7F5] border border-[#E8E8E4] rounded-xl text-sm text-[#111] hover:bg-[#E8E8E4]">
                    추가
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">메모</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="선호 모프, 예산, 특이사항 등" rows={3}
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              </div>

              <button onClick={handleAdd} disabled={saving || !form.name.trim()}
                className="w-full bg-[#111] text-white py-3.5 rounded-xl text-sm font-bold disabled:opacity-40">
                {saving ? '등록 중…' : '고객 등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#111] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
