'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, MoreVertical, X, Search, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import PhotoUpload from '@/components/common/PhotoUpload';
import SaleCardModal from '@/components/shop/SaleCardModal';

interface InventoryItem {
  id: string;
  name_korean: string;
  name_english?: string;
  morph?: string;
  gender?: string;
  birth_date?: string;
  acquired_date?: string;
  price?: number;
  cost?: number;
  status: 'available' | 'reserved' | 'sold' | 'deceased';
  notes?: string;
  image_url?: string;
  passport_issued: boolean;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
}

interface ShopInfo {
  id: string;
  name: string;
  phone?: string;
  instagram_url?: string;
  address?: string;
  plan?: string;
}

interface Props {
  shopId: string;
  shop?: ShopInfo;
}

const STATUS_MAP = {
  available: { label: '분양가능', color: 'bg-green-50 text-[#1A7F4B]' },
  reserved:  { label: '예약중',   color: 'bg-blue-50 text-[#1A56DB]' },
  sold:      { label: '분양완료', color: 'bg-[#F7F7F5] text-[#9A9A94]' },
  deceased:  { label: '폐사',     color: 'bg-red-50 text-[#D94035]' },
} as const;

const FILTER_TABS = [
  { key: 'available', label: '분양가능' },
  { key: 'reserved',  label: '예약중'   },
  { key: 'sold',      label: '분양완료' },
  { key: 'all',       label: '전체'     },
] as const;

type FilterKey = 'available' | 'reserved' | 'sold' | 'all';

export default function InventoryTab({ shopId, shop }: Props) {
  const sb = createClient();
  const [items, setItems]             = useState<InventoryItem[]>([]);
  const [cardItem, setCardItem]       = useState<InventoryItem | null>(null);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<FilterKey>('available');
  const [showAdd, setShowAdd]         = useState(false);
  const [menuOpen, setMenuOpen]       = useState<string | null>(null);
  const [selling, setSelling]         = useState<InventoryItem | null>(null);
  const [customers, setCustomers]     = useState<Customer[]>([]);
  const [selCustomer, setSelCustomer] = useState<Customer | null>(null);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [salePrice, setSalePrice]     = useState('');
  const [custSearch, setCustSearch]   = useState('');
  const [savingSale, setSavingSale]   = useState(false);
  const [toast, setToast]             = useState<string | null>(null);

  // 등록 폼
  const [form, setForm] = useState({
    name_korean: '', name_english: '', morph: '',
    gender: '미구분', birth_date: '', acquired_date: new Date().toISOString().slice(0,10),
    price: '', cost: '', notes: '', image_url: '',
  });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any)
      .from('inventory')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, [shopId]);

  const fetchCustomers = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any)
      .from('shop_customers')
      .select('id, name, phone')
      .eq('shop_id', shopId)
      .order('name');
    setCustomers(data ?? []);
  }, [shopId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const counts = {
    available: items.filter(i => i.status === 'available').length,
    reserved:  items.filter(i => i.status === 'reserved').length,
    sold:      items.filter(i => i.status === 'sold').length,
    all:       items.length,
  };

  const handleAdd = async () => {
    if (!form.name_korean.trim()) return;
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from('inventory').insert({
      shop_id: shopId,
      name_korean: form.name_korean.trim(),
      name_english: form.name_english || null,
      morph: form.morph || null,
      gender: form.gender,
      birth_date: form.birth_date || null,
      acquired_date: form.acquired_date || null,
      price: form.price ? parseInt(form.price) : null,
      cost: form.cost ? parseInt(form.cost) : null,
      notes: form.notes || null,
      image_url: form.image_url || null,
      status: 'available',
    });
    setSaving(false);
    if (!error) {
      setShowAdd(false);
      setForm({ name_korean:'', name_english:'', morph:'', gender:'미구분',
        birth_date:'', acquired_date: new Date().toISOString().slice(0,10), price:'', cost:'', notes:'', image_url:'' });
      fetchItems();
      showToast('개체가 등록됐습니다');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setMenuOpen(null);
    if (newStatus === 'sold') {
      const item = items.find(i => i.id === id);
      if (item) { setSelling(item); setSalePrice(String(item.price ?? '')); fetchCustomers(); }
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('inventory').update({ status: newStatus }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as InventoryItem['status'] } : i));
  };

  const handleDelete = async (id: string) => {
    setMenuOpen(null);
    if (!confirm('이 개체를 삭제하시겠습니까?')) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('inventory').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    showToast('삭제됐습니다');
  };

  const handleSale = async () => {
    if (!selling) return;
    setSavingSale(true);
    let customerId = selCustomer?.id ?? null;

    // 신규 고객 생성
    if (!selCustomer && newCustName.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newCust } = await (sb as any).from('shop_customers').insert({
        shop_id: shopId, name: newCustName.trim(), phone: newCustPhone || null,
      }).select('id').single();
      customerId = newCust?.id ?? null;
    }

    const price = parseInt(salePrice) || selling.price || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('sales').insert({
      shop_id: shopId, inventory_id: selling.id, customer_id: customerId, sale_price: price,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('inventory').update({ status: 'sold' }).eq('id', selling.id);
    if (customerId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sb as any).from('shop_customers')
        .update({ total_purchases: (selCustomer?.name ? 999 : 1) })
        .eq('id', customerId);
    }
    setItems(prev => prev.map(i => i.id === selling.id ? { ...i, status: 'sold' } : i));
    setSelling(null); setSelCustomer(null); setNewCustName(''); setNewCustPhone(''); setSalePrice('');
    setSavingSale(false);
    showToast('분양 처리 완료!');
  };

  const filteredCustomers = customers.filter(c =>
    c.name.includes(custSearch) || (c.phone ?? '').includes(custSearch)
  );

  return (
    <div>
      {/* 액션 바 */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold mb-0.5">INVENTORY</p>
          <h2 className="font-serif text-xl font-bold text-[#111]">재고 관리</h2>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-[#111] text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center gap-1.5">
          <Plus size={14} /> 개체 등록
        </button>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex border-b border-[#E8E8E4] px-5 gap-4">
        {FILTER_TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`pb-3 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              filter === t.key ? 'border-[#111] text-[#111]' : 'border-transparent text-[#9A9A94]'
            }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === t.key ? 'bg-[#111] text-white' : 'bg-[#F7F7F5] text-[#9A9A94]'
            }`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* 개체 리스트 */}
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-[#E8E8E4] h-24 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E4] py-16 text-center">
            <p className="text-sm text-[#9A9A94] mb-1">개체가 없습니다</p>
            <p className="text-xs text-[#C8C8C4]">상단 버튼으로 등록해보세요</p>
          </div>
        ) : filtered.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden relative">
            {/* 개체 사진 — 4:3 */}
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#F0F0EE] to-[#E4E4E0] overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name_korean} className="w-full h-full object-cover object-center" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-sm text-[#C8C8C4]">{item.name_korean}</span>
                </div>
              )}
              {/* 상태 배지 */}
              <div className="absolute top-2 left-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur ${STATUS_MAP[item.status].color.replace(/bg-\S+\s/, '')}`}>
                  {STATUS_MAP[item.status].label}
                </span>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-[15px] font-bold text-[#111] truncate">{item.name_korean}</h3>
              {item.morph && <p className="text-xs text-[#9A9A94]">{item.morph}</p>}
              <div className="flex items-center gap-3 mt-1">
                {item.gender && <span className="text-[10px] text-[#C8C8C4]">{item.gender}</span>}
                {item.acquired_date && (
                  <span className="text-[10px] text-[#C8C8C4]">입고 {item.acquired_date.slice(0,10)}</span>
                )}
              </div>
            </div>

            {/* 가격 */}
            <div className="text-right flex-shrink-0">
              {item.price && (
                <p className="font-serif text-base font-bold text-[#111]">
                  {item.price.toLocaleString()}원
                </p>
              )}
            </div>

            {/* 점 3개 메뉴 */}
            <div className="relative">
              <button onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                className="p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors">
                <MoreVertical size={16} className="text-[#9A9A94]" />
              </button>
              {menuOpen === item.id && (
                <div className="absolute right-0 top-8 bg-white rounded-xl border border-[#E8E8E4] shadow-lg z-20 min-w-[140px] overflow-hidden">
                  {/* 분양 카드 만들기 */}
                  <button onClick={() => { setMenuOpen(null); setCardItem(item); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#1A56DB] hover:bg-[#F7F7F5] flex items-center gap-2 font-semibold border-b border-[#F0F0EE]">
                    <ImageIcon size={13} /> 분양 카드 만들기
                  </button>
                  {item.status !== 'sold' && (
                    <button onClick={() => handleStatusChange(item.id, 'sold')}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#1A7F4B] hover:bg-[#F7F7F5] font-semibold">
                      분양 처리
                    </button>
                  )}
                  {item.status === 'available' && (
                    <button onClick={() => handleStatusChange(item.id, 'reserved')}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#111] hover:bg-[#F7F7F5]">
                      예약중 변경
                    </button>
                  )}
                  {item.status === 'reserved' && (
                    <button onClick={() => handleStatusChange(item.id, 'available')}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#111] hover:bg-[#F7F7F5]">
                      분양가능 변경
                    </button>
                  )}
                  <button onClick={() => handleDelete(item.id)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#D94035] hover:bg-red-50">
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        ))}
      </div>

      {/* 개체 등록 모달 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#E8E8E4] px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#111]">개체 등록</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-[#9A9A94]" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* 사진 업로드 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">개체 사진</label>
                <PhotoUpload
                  userId={shopId}
                  currentUrl={form.image_url}
                  onUploaded={url => setForm(p => ({ ...p, image_url: url }))}
                  aspectRatio="landscape"
                />
              </div>
              {[
                { key: 'name_korean', label: '종 이름 (한국어)', required: true, placeholder: '레오파드 게코' },
                { key: 'name_english', label: '종 이름 (영어)', placeholder: 'Leopard Gecko' },
                { key: 'morph', label: '모프', placeholder: '블리자드, 하이포 등' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">
                    {f.label}{f.required && ' *'}
                  </label>
                  <input value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                </div>
              ))}

              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">성별</label>
                <div className="flex gap-2">
                  {['수컷','암컷','미구분'].map(g => (
                    <button key={g} onClick={() => setForm(p => ({ ...p, gender: g }))}
                      className={`flex-1 py-2.5 text-sm rounded-xl border transition-colors ${
                        form.gender === g ? 'border-[#111] bg-[#111] text-white font-semibold'
                          : 'border-[#E8E8E4] text-[#9A9A94] hover:border-[#111]'
                      }`}>{g}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'birth_date', label: '생년월일' },
                  { key: 'acquired_date', label: '입고일' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">{f.label}</label>
                    <input type="date" value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-[#E8E8E4] rounded-xl px-3 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111]" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'price', label: '분양가', placeholder: '150000' },
                  { key: 'cost', label: '원가 (비공개)', placeholder: '80000' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">{f.label}</label>
                    <input type="number" value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full border border-[#E8E8E4] rounded-xl px-3 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">메모</label>
                <textarea value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="특이사항, 사육 정보 등"
                  rows={3}
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              </div>

              <button onClick={handleAdd} disabled={saving || !form.name_korean.trim()}
                className="w-full bg-[#111] text-white py-3.5 rounded-xl text-sm font-bold disabled:opacity-40">
                {saving ? '등록 중…' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 분양 처리 모달 */}
      {selling && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E8E8E4] px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#111]">분양 처리</h3>
              <button onClick={() => { setSelling(null); setSelCustomer(null); }}><X size={20} className="text-[#9A9A94]" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* 개체 요약 */}
              <div className="bg-[#F7F7F5] rounded-xl p-4">
                <p className="font-serif font-bold text-[#111]">{selling.name_korean}</p>
                {selling.morph && <p className="text-xs text-[#9A9A94] mt-0.5">{selling.morph}</p>}
              </div>

              {/* 분양가 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">분양가 확인·수정</label>
                <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)}
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111]" />
              </div>

              {/* 고객 선택 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">고객 선택</label>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8C8C4]" />
                  <input value={custSearch} onChange={e => setCustSearch(e.target.value)}
                    placeholder="이름·연락처 검색"
                    className="w-full border border-[#E8E8E4] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#111]" />
                </div>
                {selCustomer ? (
                  <div className="flex items-center justify-between bg-[#F7F7F5] rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111]">{selCustomer.name}</p>
                      {selCustomer.phone && <p className="text-xs text-[#9A9A94]">{selCustomer.phone}</p>}
                    </div>
                    <button onClick={() => setSelCustomer(null)} className="text-xs text-[#9A9A94] hover:text-[#111]">변경</button>
                  </div>
                ) : (
                  <div className="border border-[#E8E8E4] rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                    {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                      <button key={c.id} onClick={() => setSelCustomer(c)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F7F5] border-b border-[#E8E8E4] last:border-0">
                        <span className="font-medium text-[#111]">{c.name}</span>
                        {c.phone && <span className="text-[#9A9A94] ml-2">{c.phone}</span>}
                      </button>
                    )) : (
                      <p className="text-xs text-[#9A9A94] text-center py-4">일치하는 고객 없음</p>
                    )}
                  </div>
                )}
              </div>

              {/* 신규 고객 */}
              {!selCustomer && (
                <div className="border-t border-[#E8E8E4] pt-4">
                  <p className="text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-2">신규 고객 등록</p>
                  <div className="space-y-2">
                    <input value={newCustName} onChange={e => setNewCustName(e.target.value)}
                      placeholder="이름" className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                    <input value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)}
                      placeholder="전화번호 (선택)" className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                  </div>
                </div>
              )}

              <button onClick={handleSale} disabled={savingSale}
                className="w-full bg-[#1A7F4B] text-white py-3.5 rounded-xl text-sm font-bold disabled:opacity-40">
                {savingSale ? '처리 중…' : '분양 완료 처리'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#111] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
          {toast}
        </div>
      )}

      {/* 메뉴 닫기 오버레이 */}
      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}

      {/* 분양 카드 모달 */}
      {cardItem && shop && (
        <SaleCardModal
          animal={{
            name_korean: cardItem.name_korean,
            morph:       cardItem.morph,
            gender:      cardItem.gender,
            birth_date:  cardItem.birth_date,
            price:       cardItem.price ?? 0,
            image_url:   cardItem.image_url,
          }}
          shop={{
            name:         shop.name,
            phone:        shop.phone,
            instagram:    shop.instagram_url,
            address:      shop.address,
            plan:         shop.plan,
          }}
          onClose={() => setCardItem(null)}
        />
      )}
    </div>
  );
}
