'use client';

import { useState, useEffect, useCallback } from 'react';
import { Store, Lock } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { createClient } from '@/lib/supabase';
import DealForm from './DealForm';
import InventoryTab from '@/app/admin/_components/InventoryTab';
import CustomerTab from '@/app/admin/_components/CustomerTab';
import type { DealResult } from '@/app/api/deals/route';

/* ─── 타입 ─── */
interface Props {
  shop: Record<string, unknown>;
  user: { id: string; email: string };
  onShopUpdate: (shop: Record<string, unknown>) => void;
}

interface AnalyticsData {
  views: number;
  contacts: number;
  dealViews: number;
  byDay: Record<string, { views: number; contacts: number }>;
  period: number;
}

interface InventoryStat {
  available: number;
  reserved: number;
  sold: number;
}

interface RecentSale {
  id: string;
  sale_price: number;
  sold_at: string;
  inventory: { name_korean: string; morph?: string } | null;
  shop_customers: { name: string } | null;
}

type Tab = 'overview' | 'inventory' | 'customers' | 'deals';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview',   label: '대시보드' },
  { key: 'inventory',  label: '재고 관리' },
  { key: 'customers',  label: '고객 관리' },
  { key: 'deals',      label: '타임딜'    },
];

const DONUT_COLORS = ['#1A7F4B', '#1A56DB', '#9A9A94'];

/* ─── PRO 게이트 ─── */
function ProGate({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-[#9A9A94]" />
      </div>
      <h3 className="font-serif text-xl font-bold text-[#111] mb-2">PRO 플랜 전용 기능입니다</h3>
      <p className="text-sm text-[#9A9A94] mb-6 max-w-xs leading-relaxed">
        {feature}은 PRO 플랜에서 사용할 수 있습니다. 월 49,000원으로 시작하세요.
      </p>
      <Link href="/pricing?tab=shop"
        className="bg-[#111] text-white rounded-lg px-6 py-3 text-sm font-bold">
        PRO 시작하기
      </Link>
    </div>
  );
}

/* ─── 미니 바 차트 ─── */
function MiniBarChart({ data }: { data: Record<string, { views: number; contacts: number }> }) {
  const entries = Object.entries(data).slice(-14);
  if (entries.length === 0) return null;
  const maxVal = Math.max(...entries.map(([, v]) => v.views), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {entries.map(([day, val]) => (
        <div key={day} className="flex-1 flex flex-col items-center group" title={`${day}: ${val.views}회`}>
          <div className="w-full bg-[#E8E8E4] rounded-sm group-hover:bg-[#9A9A94] transition-colors"
            style={{ height: `${Math.max((val.views / maxVal) * 56, 2)}px` }} />
        </div>
      ))}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function ShopDashboard({ shop, onShopUpdate }: Props) {
  const sb = createClient();
  const [tab, setTab]                   = useState<Tab>('overview');
  const [analytics, setAnalytics]       = useState<AnalyticsData | null>(null);
  const [deals, setDeals]               = useState<DealResult[]>([]);
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDeal, setEditingDeal]   = useState<DealResult | null>(null);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [invStat, setInvStat]           = useState<InventoryStat>({ available: 0, reserved: 0, sold: 0 });
  const [monthSales, setMonthSales]     = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [recentSales, setRecentSales]   = useState<RecentSale[]>([]);
  const [saving, setSaving]             = useState(false);

  const [profile, setProfile] = useState({
    description:       (shop.description       as string) ?? '',
    opening_hours:     (shop.opening_hours     as string) ?? '',
    instagram_url:     (shop.instagram_url     as string) ?? '',
    kakao_channel_url: (shop.kakao_channel_url as string) ?? '',
    website_url:       (shop.website_url       as string) ?? '',
    phone:             (shop.phone             as string) ?? '',
  });

  const shopId   = shop.id as string;
  const shopName = shop.name as string;
  const shopPlan = (shop.plan as string) ?? 'basic';
  const isPro    = shopPlan === 'pro';

  /* 분석 */
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics?period=30');
      if (res.ok) setAnalytics(await res.json());
    } catch {}
  }, []);

  /* 재고 통계 + 이달 분양 */
  const fetchInventoryStats = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inv } = await (sb as any)
      .from('inventory')
      .select('status')
      .eq('shop_id', shopId);
    if (inv) {
      setInvStat({
        available: inv.filter((i: { status: string }) => i.status === 'available').length,
        reserved:  inv.filter((i: { status: string }) => i.status === 'reserved').length,
        sold:      inv.filter((i: { status: string }) => i.status === 'sold').length,
      });
    }

    // 이달 분양
    const thisMonth = new Date();
    thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: s } = await (sb as any)
      .from('sales')
      .select('sale_price, sold_at, inventory(name_korean, morph), shop_customers(name)')
      .eq('shop_id', shopId)
      .gte('sold_at', thisMonth.toISOString())
      .order('sold_at', { ascending: false });
    if (s) {
      setMonthSales(s.length);
      setMonthRevenue(s.reduce((acc: number, r: { sale_price: number }) => acc + r.sale_price, 0));
      setRecentSales(s.slice(0, 5));
    }
  }, [shopId]);

  /* 딜 */
  const fetchDeals = useCallback(async () => {
    setLoadingDeals(true);
    try {
      const res = await fetch(`/api/deals?shop_id=${shopId}&limit=50`);
      if (res.ok) { const d = await res.json(); setDeals(d.deals ?? []); }
    } catch {} finally { setLoadingDeals(false); }
  }, [shopId]);

  useEffect(() => { fetchAnalytics(); fetchInventoryStats(); }, [fetchAnalytics, fetchInventoryStats]);
  useEffect(() => { if (tab === 'deals') fetchDeals(); }, [tab, fetchDeals]);

  const handleDeleteDeal = async (id: string) => {
    if (!confirm('이 딜을 삭제하시겠습니까?')) return;
    await fetch(`/api/deals/${id}`, { method: 'DELETE' });
    setDeals(d => d.filter(x => x.id !== id));
  };

  const handleEndDeal = async (id: string) => {
    await fetch(`/api/deals/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ended' }),
    });
    setDeals(d => d.filter(x => x.id !== id));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/shop', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) { const d = await res.json(); onShopUpdate(d.shop); }
    } catch {} finally { setSaving(false); }
  };

  const donutData = [
    { name: '분양가능', value: invStat.available },
    { name: '예약중',   value: invStat.reserved  },
    { name: '분양완료', value: invStat.sold       },
  ].filter(d => d.value > 0);

  const totalInv = invStat.available + invStat.reserved + invStat.sold;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">

      {/* 상단 헤더 */}
      <div className="bg-white border-b border-[#E8E8E4]">
        <div className="max-w-3xl mx-auto px-5 pt-6 pb-0 md:px-8">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center">
                <Store size={22} className="text-[#9A9A94]" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-lg font-bold text-[#111]">{shopName}</h1>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isPro ? 'bg-[#111] text-white' : 'bg-[#F7F7F5] text-[#9A9A94] border border-[#E8E8E4]'
                  }`}>{isPro ? 'PRO' : '무료'}</span>
                </div>
                <p className="text-xs text-[#9A9A94] mt-0.5">{shop.address as string}</p>
              </div>
            </div>
            <a href="/shops" className="text-xs text-[#9A9A94] hover:text-[#111] transition-colors font-medium">
              지도에서 보기 →
            </a>
          </div>

          {/* 4탭 네비게이션 */}
          <div className="flex">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.key ? 'border-[#111] text-[#111]' : 'border-transparent text-[#9A9A94] hover:text-[#111]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto md:px-8">

        {/* ─── 대시보드 탭 ─── */}
        {tab === 'overview' && (
          <div className="px-5 py-6 space-y-5">
            {/* 오늘 현황 3카드 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '보유 개체', value: totalInv, unit: '마리', sub: '재고 현황' },
                { label: '이달 분양', value: monthSales, unit: '건', sub: '판매 건수' },
                { label: '이달 매출', value: monthRevenue >= 10000 ? `${Math.floor(monthRevenue/10000)}만` : (monthRevenue > 0 ? `${monthRevenue.toLocaleString()}` : '0'), unit: monthRevenue >= 10000 ? '원' : '원', sub: '총 매출' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-[#E8E8E4] p-4">
                  <p className="text-[9px] text-[#9A9A94] tracking-widest font-semibold mb-2 uppercase">{stat.label}</p>
                  <p className="font-serif text-2xl font-bold text-[#111]">{stat.value}<span className="text-sm font-normal ml-0.5">{stat.unit}</span></p>
                  <p className="text-[10px] text-[#C8C8C4] mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* 재고 도넛 차트 */}
            {totalInv > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
                <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold mb-4 uppercase">재고 현황</p>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                          dataKey="value" paddingAngle={2}>
                          {donutData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val}마리`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: '분양가능', value: invStat.available, color: '#1A7F4B' },
                      { label: '예약중',   value: invStat.reserved,  color: '#1A56DB' },
                      { label: '분양완료', value: invStat.sold,      color: '#9A9A94' },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-[#9A9A94]">{d.label}</span>
                        <span className="font-serif text-sm font-bold text-[#111] ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 최근 분양 */}
            {recentSales.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E8E8E4]">
                  <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold uppercase">최근 분양</p>
                </div>
                {recentSales.map((s, i) => (
                  <div key={s.id} className={`px-5 py-3 flex items-center justify-between ${i < recentSales.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                    <div>
                      <p className="text-sm font-semibold text-[#111]">{s.inventory?.name_korean ?? '개체'}</p>
                      <p className="text-xs text-[#9A9A94]">
                        {s.shop_customers?.name ?? '—'} · {s.sold_at.slice(0,10)}
                      </p>
                    </div>
                    <p className="font-serif text-sm font-bold text-[#111]">{s.sale_price.toLocaleString()}원</p>
                  </div>
                ))}
              </div>
            )}

            {/* 30일 조회수 차트 */}
            {analytics?.byDay && Object.keys(analytics.byDay).length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
                <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold mb-4 uppercase">최근 30일 조회수</p>
                <MiniBarChart data={analytics.byDay} />
              </div>
            )}

            {/* KPI 카드 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '페이지 조회', value: analytics?.views ?? '—' },
                { label: '문의 클릭',   value: analytics?.contacts ?? '—' },
                { label: '딜 조회',     value: analytics?.dealViews ?? '—' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-[#E8E8E4] p-4 text-center">
                  <p className="font-serif text-2xl font-bold text-[#111]">{stat.value}</p>
                  <p className="text-[10px] text-[#9A9A94] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 재고 관리 탭 ─── */}
        {tab === 'inventory' && (
          isPro
            ? <InventoryTab shopId={shopId} shop={{
                id: shopId,
                name: shopName,
                phone: (shop.phone as string) || undefined,
                instagram_url: (shop.instagram_url as string) || undefined,
                address: (shop.address as string) || undefined,
                plan: shopPlan,
              }} />
            : <ProGate feature="재고 관리와 고객 관리" />
        )}

        {/* ─── 고객 관리 탭 ─── */}
        {tab === 'customers' && (
          isPro
            ? <CustomerTab shopId={shopId} />
            : <ProGate feature="고객 관리" />
        )}

        {/* ─── 타임딜 탭 ─── */}
        {tab === 'deals' && (
          <div className="px-5 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#111]">타임딜 관리</h2>
              <button onClick={() => { setEditingDeal(null); setShowDealForm(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#111] text-white text-sm font-bold rounded-lg">
                + 새 딜 등록
              </button>
            </div>

            {showDealForm && (
              <DealForm shopId={shopId} shopName={shopName} shopPlan={shopPlan}
                initialData={editingDeal}
                onSuccess={(deal) => {
                  if (editingDeal) setDeals(d => d.map(x => x.id === deal.id ? deal : x));
                  else setDeals(d => [deal, ...d]);
                  setShowDealForm(false); setEditingDeal(null);
                }}
                onCancel={() => { setShowDealForm(false); setEditingDeal(null); }} />
            )}

            {loadingDeals ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E8E8E4] h-20 animate-pulse" />
                ))}
              </div>
            ) : deals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E8E4] py-16 text-center">
                <p className="text-sm text-[#9A9A94] mb-1">등록된 딜이 없습니다</p>
                <p className="text-xs text-[#C8C8C4]">첫 타임딜을 등록해서 고객을 모아보세요</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E8E8E4]">
                      {['개체', '가격', '수량', '관리'].map(col => (
                        <th key={col} className="text-left text-[10px] text-[#9A9A94] tracking-widest font-semibold px-5 py-3.5 uppercase">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map(deal => (
                      <tr key={deal.id} className="border-b border-[#E8E8E4] last:border-0 hover:bg-[#F7F7F5]">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#111]">{deal.title}</p>
                          {deal.animal_type && <p className="text-xs text-[#9A9A94] mt-0.5">{deal.animal_type}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#111]">{deal.price.toLocaleString()}원</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-[#9A9A94]">{deal.remaining}/{deal.quantity}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingDeal(deal); setShowDealForm(true); }}
                              className="text-xs text-[#9A9A94] hover:text-[#111] px-2.5 py-1.5 rounded-lg bg-[#F7F7F5] hover:bg-[#E8E8E4]">수정</button>
                            <button onClick={() => handleEndDeal(deal.id)}
                              className="text-xs text-[#9A9A94] hover:text-[#111] px-2.5 py-1.5 rounded-lg bg-[#F7F7F5] hover:bg-[#E8E8E4]">종료</button>
                            <button onClick={() => handleDeleteDeal(deal.id)}
                              className="text-xs text-[#D94035] px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100">삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── 샵 정보 수정 (대시보드 하단에 편입) ─── */}
        {tab === 'overview' && (
          <div className="px-5 pb-8">
            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5 space-y-4">
              <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold uppercase">샵 정보 수정</p>
              {[
                { key: 'phone', label: '전화번호', placeholder: '010-0000-0000' },
                { key: 'opening_hours', label: '영업시간', placeholder: '평일 12:00~20:00' },
                { key: 'instagram_url', label: '인스타그램', placeholder: '@username' },
                { key: 'kakao_channel_url', label: '카카오 채널', placeholder: 'https://pf.kakao.com/...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">{label}</label>
                  <input value={profile[key as keyof typeof profile]}
                    onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">샵 소개</label>
                <textarea value={profile.description}
                  onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
                  placeholder="어떤 파충류를 전문으로 하는지 알려주세요" rows={3}
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving}
                className="w-full py-3 bg-[#111] text-white text-sm font-bold rounded-xl disabled:opacity-40">
                {saving ? '저장 중…' : '변경사항 저장'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
