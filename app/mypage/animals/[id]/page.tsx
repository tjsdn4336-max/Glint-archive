'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ChevronLeft, Plus, X, Sparkles } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ─── 타입 ─── */
interface MyAnimal {
  id: string; name: string; species_korean: string; morph?: string;
  gender?: string; birth_date?: string; acquired_date?: string;
  acquired_from?: string; image_url?: string; notes?: string;
}
interface FeedingAlert {
  id: string; interval_days: number; last_fed_at?: string; next_feed_at?: string;
}
interface FeedingLog { id: string; fed_at: string; food_type: string; food_size?: string; quantity: number; accepted: boolean; notes?: string; }
interface SheddingLog { id: string; shed_at: string; condition: string; notes?: string; }
interface WeightLog { id: string; weight_g: number; measured_at: string; notes?: string; }
interface HealthLog { id: string; type: string; description: string; logged_at: string; }

type DetailTab = 'feeding' | 'shedding' | 'weight' | 'health';

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'feeding',  label: '먹이'   },
  { key: 'shedding', label: '탈피'   },
  { key: 'weight',   label: '체중'   },
  { key: 'health',   label: '건강'   },
];

function daysDiff(from: string) { return Math.floor((Date.now() - new Date(from).getTime()) / 86400000); }
function daysUntil(target: string) { return Math.ceil((new Date(target).getTime() - Date.now()) / 86400000); }

/* ─── 프리미엄 게이트 ─── */
function PremiumGate({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-[#9A9A94]" />
      </div>
      <h3 className="font-serif text-lg font-bold text-[#111] mb-2">프리미엄 기능입니다</h3>
      <p className="text-sm text-[#9A9A94] mb-6 max-w-xs leading-relaxed">
        {feature} 기록은 프리미엄 플랜에서 사용할 수 있습니다.
      </p>
      <a href="/pricing" className="bg-[#111] text-white rounded-lg px-6 py-3 text-sm font-bold">
        프리미엄 시작하기
      </a>
    </div>
  );
}

export default function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sb = createClient();

  const [animal, setAnimal]   = useState<MyAnimal | null>(null);
  const [alert, setAlert]     = useState<FeedingAlert | null>(null);
  const [tab, setTab]         = useState<DetailTab>('feeding');
  const [loading, setLoading] = useState(true);
  const [isPremium]           = useState(true); // 프리미엄 기능 전체 오픈

  // 로그 데이터
  const [feedLogs, setFeedLogs]   = useState<FeedingLog[]>([]);
  const [shedLogs, setShedLogs]   = useState<SheddingLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);

  // 모달
  const [showFeedModal, setShowFeedModal]     = useState(false);
  const [showShedModal, setShowShedModal]     = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState<string | null>(null);

  // 폼
  const [feedForm, setFeedForm]     = useState({ food_type:'', food_size:'', quantity:'1', accepted: true, notes:'' });
  const [shedForm, setShedForm]     = useState({ shed_at: new Date().toISOString().slice(0,10), condition:'완전', notes:'' });
  const [weightForm, setWeightForm] = useState({ weight_g:'', measured_at: new Date().toISOString().slice(0,10), notes:'' });
  const [healthForm, setHealthForm] = useState({ type:'이상증상', description:'', logged_at: new Date().toISOString().slice(0,10) });
  const [intervalDays, setIntervalDays] = useState(7);
  const [customInterval, setCustomInterval] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* 초기 로드 */
  const fetchAnimal = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: a } = await (sb as any).from('my_animals').select('*').eq('id', id).single();
    if (!a) { router.replace('/mypage'); return; }
    setAnimal(a);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: al } = await (sb as any).from('feeding_alerts').select('*').eq('animal_id', id).maybeSingle();
    if (al) { setAlert(al); setIntervalDays(al.interval_days); }
    setLoading(false);
  }, [id]);

  const fetchFeedLogs = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from('feeding_logs').select('*').eq('animal_id', id).order('fed_at', { ascending: false });
    setFeedLogs(data ?? []);
  }, [id]);

  const fetchShedLogs = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from('shedding_logs').select('*').eq('animal_id', id).order('shed_at', { ascending: false });
    setShedLogs(data ?? []);
  }, [id]);

  const fetchWeightLogs = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from('weight_logs').select('*').eq('animal_id', id).order('measured_at', { ascending: true });
    setWeightLogs(data ?? []);
  }, [id]);

  const fetchHealthLogs = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any).from('health_logs').select('*').eq('animal_id', id).order('logged_at', { ascending: false });
    setHealthLogs(data ?? []);
  }, [id]);

  useEffect(() => { fetchAnimal(); }, [fetchAnimal]);
  useEffect(() => {
    const t = searchParams.get('tab') as DetailTab | null;
    if (t && DETAIL_TABS.some(x => x.key === t)) setTab(t);
  }, [searchParams]);
  useEffect(() => { if (tab === 'feeding')  fetchFeedLogs();   }, [tab, fetchFeedLogs]);
  useEffect(() => { if (tab === 'shedding') fetchShedLogs();   }, [tab, fetchShedLogs]);
  useEffect(() => { if (tab === 'weight')   fetchWeightLogs(); }, [tab, fetchWeightLogs]);
  useEffect(() => { if (tab === 'health')   fetchHealthLogs(); }, [tab, fetchHealthLogs]);

  /* ── 급여 기록 저장 ── */
  const handleFeed = async () => {
    if (!feedForm.food_type.trim()) return;
    setSaving(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('feeding_logs').insert({
      animal_id: id, user_id: user.id,
      food_type: feedForm.food_type.trim(), food_size: feedForm.food_size || null,
      quantity: parseInt(feedForm.quantity) || 1, accepted: feedForm.accepted,
      notes: feedForm.notes || null,
    });
    // 알림 갱신
    const nextFeed = new Date();
    nextFeed.setDate(nextFeed.getDate() + intervalDays);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('feeding_alerts').upsert({
      animal_id: id, user_id: user.id,
      interval_days: intervalDays, last_fed_at: new Date().toISOString(), next_feed_at: nextFeed.toISOString(),
    }, { onConflict: 'animal_id' });
    setSaving(false); setShowFeedModal(false);
    setFeedForm({ food_type:'', food_size:'', quantity:'1', accepted:true, notes:'' });
    fetchFeedLogs(); fetchAnimal();
    showToast('급여 기록 완료!');
  };

  /* ── 탈피 기록 ── */
  const handleShed = async () => {
    setSaving(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('shedding_logs').insert({
      animal_id: id, user_id: user.id,
      shed_at: new Date(shedForm.shed_at).toISOString(), condition: shedForm.condition, notes: shedForm.notes || null,
    });
    setSaving(false); setShowShedModal(false);
    setShedForm({ shed_at: new Date().toISOString().slice(0,10), condition:'완전', notes:'' });
    fetchShedLogs(); showToast('탈피 기록 완료!');
  };

  /* ── 체중 기록 ── */
  const handleWeight = async () => {
    if (!weightForm.weight_g) return;
    setSaving(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('weight_logs').insert({
      animal_id: id, user_id: user.id,
      weight_g: parseInt(weightForm.weight_g), measured_at: new Date(weightForm.measured_at).toISOString(),
      notes: weightForm.notes || null,
    });
    setSaving(false); setShowWeightModal(false);
    setWeightForm({ weight_g:'', measured_at: new Date().toISOString().slice(0,10), notes:'' });
    fetchWeightLogs(); showToast('체중 기록 완료!');
  };

  /* ── 건강 기록 ── */
  const handleHealth = async () => {
    if (!healthForm.description.trim()) return;
    setSaving(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('health_logs').insert({
      animal_id: id, user_id: user.id,
      type: healthForm.type, description: healthForm.description.trim(),
      logged_at: new Date(healthForm.logged_at).toISOString(),
    });
    setSaving(false); setShowHealthModal(false);
    setHealthForm({ type:'이상증상', description:'', logged_at: new Date().toISOString().slice(0,10) });
    fetchHealthLogs(); showToast('건강 기록 완료!');
  };

  /* ── 급여 간격 변경 ── */
  const handleIntervalChange = async (days: number) => {
    setIntervalDays(days);
    const { data: { user } } = await sb.auth.getUser();
    if (!user || !alert) return;
    const nextFeed = alert.last_fed_at
      ? new Date(new Date(alert.last_fed_at).getTime() + days * 86400000).toISOString()
      : new Date(Date.now() + days * 86400000).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('feeding_alerts').update({ interval_days: days, next_feed_at: nextFeed }).eq('animal_id', id);
    fetchAnimal();
  };

  if (loading || !animal) {
    return (
      <div className="min-h-screen bg-[#F7F7F5]">
        <div className="h-48 bg-[#E8E8E4] animate-pulse" />
        <div className="px-5 py-6 space-y-4">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
        </div>
      </div>
    );
  }

  /* 체중 통계 */
  const wData = weightLogs.map(w => ({ date: w.measured_at.slice(0,10), g: w.weight_g }));
  const maxW  = Math.max(...weightLogs.map(w => w.weight_g), 0);
  const minW  = weightLogs.length ? Math.min(...weightLogs.map(w => w.weight_g)) : 0;
  const latW  = weightLogs.length ? weightLogs[weightLogs.length - 1].weight_g : null;

  /* 탈피 주기 평균 */
  const avgShed = shedLogs.length >= 2
    ? Math.round(daysDiff(shedLogs[shedLogs.length - 1].shed_at) / (shedLogs.length - 1))
    : null;

  /* 거부 비율 */
  const thisMonthFeeds = feedLogs.filter(f => {
    const d = new Date(f.fed_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const refusalRate = thisMonthFeeds.length
    ? Math.round(thisMonthFeeds.filter(f => !f.accepted).length / thisMonthFeeds.length * 100)
    : null;

  const daysSinceAcquired = animal.acquired_date
    ? Math.floor((Date.now() - new Date(animal.acquired_date).getTime()) / 86400000)
    : null;

  const dday = alert?.next_feed_at ? daysUntil(alert.next_feed_at) : null;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* 헤더 이미지 — 16:9 */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#E8E8E4] to-[#D8D8D4] overflow-hidden">
        {animal.image_url ? (
          <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-serif text-3xl text-[#C8C8C4]">🦎</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
          <ChevronLeft size={18} className="text-[#111]" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-white">{animal.name}</h1>
              <p className="text-sm text-white/70 mt-0.5">
                {animal.species_korean}{animal.morph ? ` · ${animal.morph}` : ''}{animal.gender ? ` · ${animal.gender}` : ''}
              </p>
            </div>
            {daysSinceAcquired !== null && (
              <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                함께한 지 {daysSinceAcquired}일
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-[#E8E8E4] sticky top-0 z-10">
        <div className="flex max-w-2xl mx-auto">
          {DETAIL_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key ? 'border-[#111] text-[#111]' : 'border-transparent text-[#9A9A94]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5">

        {/* ─── 먹이 탭 ─── */}
        {tab === 'feeding' && (
          <div className="space-y-4">
            {/* 다음 급여 카드 */}
            <div className={`rounded-2xl p-5 border ${
              dday !== null && dday <= 0 ? 'bg-red-50 border-red-100' :
              dday !== null && dday <= 2 ? 'bg-orange-50 border-orange-100' :
              'bg-white border-[#E8E8E4]'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase">다음 급여</p>
                <button onClick={() => setShowFeedModal(true)}
                  className="flex items-center gap-1 bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  <Plus size={12} /> 급여 기록
                </button>
              </div>
              {dday !== null ? (
                <p className={`font-serif text-3xl font-bold ${
                  dday <= 0 ? 'text-[#D94035]' : dday <= 2 ? 'text-orange-600' : 'text-[#111]'
                }`}>
                  {dday <= 0 ? `D+${Math.abs(dday)} 지남` : `D-${dday}`}
                </p>
              ) : (
                <p className="font-serif text-lg text-[#9A9A94]">아직 급여 기록 없음</p>
              )}
              {alert?.last_fed_at && (
                <p className="text-xs text-[#9A9A94] mt-1">마지막 급여 {daysDiff(alert.last_fed_at)}일 전</p>
              )}
            </div>

            {/* 급여 간격 설정 */}
            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4">
              <p className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-3">급여 간격</p>
              <div className="flex gap-2 mb-2">
                {[7, 10, 14].map(d => (
                  <button key={d} onClick={() => handleIntervalChange(d)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      intervalDays === d ? 'bg-[#111] text-white border-[#111] font-bold' : 'border-[#E8E8E4] text-[#9A9A94] hover:border-[#111]'
                    }`}>{d}일</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={customInterval} onChange={e => setCustomInterval(e.target.value)}
                  placeholder="직접 입력 (일)" type="number"
                  className="flex-1 border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                <button onClick={() => { const d = parseInt(customInterval); if (d > 0) handleIntervalChange(d); }}
                  className="px-3 py-2 bg-[#F7F7F5] border border-[#E8E8E4] rounded-lg text-sm hover:bg-[#E8E8E4]">적용</button>
              </div>
            </div>

            {/* 이번 달 거부율 */}
            {refusalRate !== null && (
              <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4 flex items-center justify-between">
                <p className="text-sm text-[#9A9A94]">이번 달 거부율</p>
                <p className={`font-serif text-xl font-bold ${refusalRate > 30 ? 'text-[#D94035]' : 'text-[#111]'}`}>
                  {refusalRate}%
                </p>
              </div>
            )}

            {/* 급여 이력 */}
            <div>
              <p className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-3">급여 이력</p>
              {feedLogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] py-10 text-center">
                  <p className="text-sm text-[#9A9A94]">급여 기록이 없습니다</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
                  {feedLogs.map((log, i) => (
                    <div key={log.id} className={`px-4 py-3 flex items-center justify-between ${i < feedLogs.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                      <div>
                        <p className="text-sm font-semibold text-[#111]">{log.food_type}
                          {log.food_size && <span className="text-[#9A9A94] font-normal"> · {log.food_size}</span>}
                          {log.quantity > 1 && <span className="text-[#9A9A94] font-normal"> × {log.quantity}</span>}
                        </p>
                        <p className="text-[10px] text-[#9A9A94]">{log.fed_at.slice(0,10)}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.accepted ? 'bg-green-50 text-[#1A7F4B]' : 'bg-red-50 text-[#D94035]'
                      }`}>{log.accepted ? '먹음' : '거부'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 탈피 탭 ─── */}
        {tab === 'shedding' && (
          isPremium ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase">탈피 기록</p>
                <button onClick={() => setShowShedModal(true)}
                  className="flex items-center gap-1 bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  <Plus size={12} /> 기록하기
                </button>
              </div>
              {avgShed && (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4 flex items-center justify-between">
                  <p className="text-sm text-[#9A9A94]">평균 탈피 주기</p>
                  <p className="font-serif text-xl font-bold text-[#111]">약 {avgShed}일</p>
                </div>
              )}
              {shedLogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] py-10 text-center">
                  <p className="text-sm text-[#9A9A94]">탈피 기록이 없습니다</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
                  {shedLogs.map((log, i) => (
                    <div key={log.id} className={`px-4 py-3 flex items-center justify-between ${i < shedLogs.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                      <div>
                        <p className="text-sm font-semibold text-[#111]">{log.shed_at.slice(0,10)}</p>
                        {log.notes && <p className="text-xs text-[#9A9A94]">{log.notes}</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.condition === '완전' ? 'bg-green-50 text-[#1A7F4B]' :
                        log.condition === '부분' ? 'bg-blue-50 text-[#1A56DB]' :
                        'bg-red-50 text-[#D94035]'
                      }`}>{log.condition}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : <PremiumGate feature="탈피" />
        )}

        {/* ─── 체중 탭 ─── */}
        {tab === 'weight' && (
          isPremium ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase">체중 기록</p>
                <button onClick={() => setShowWeightModal(true)}
                  className="flex items-center gap-1 bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  <Plus size={12} /> 기록하기
                </button>
              </div>

              {/* 통계 */}
              {weightLogs.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '최근', value: latW, unit: 'g' },
                    { label: '최고', value: maxW, unit: 'g' },
                    { label: '최저', value: minW, unit: 'g' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E4] p-4 text-center">
                      <p className="font-serif text-xl font-bold text-[#111]">{s.value}<span className="text-xs font-normal">{s.unit}</span></p>
                      <p className="text-[10px] text-[#9A9A94] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 그래프 */}
              {wData.length >= 2 && (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
                  <p className="text-xs text-[#9A9A94] font-semibold mb-4">체중 변화</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={wData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9A9A94' }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 9, fill: '#9A9A94' }} unit="g" />
                      <Tooltip formatter={(v) => [`${v}g`]} labelStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="g" stroke="#1A7F4B" strokeWidth={2} dot={{ r: 3, fill: '#1A7F4B' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {weightLogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] py-10 text-center">
                  <p className="text-sm text-[#9A9A94]">체중 기록이 없습니다</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
                  {[...weightLogs].reverse().map((log, i, arr) => (
                    <div key={log.id} className={`px-4 py-3 flex items-center justify-between ${i < arr.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                      <p className="text-sm text-[#9A9A94]">{log.measured_at.slice(0,10)}</p>
                      <p className="font-serif text-base font-bold text-[#111]">{log.weight_g}g</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : <PremiumGate feature="체중" />
        )}

        {/* ─── 건강 탭 ─── */}
        {tab === 'health' && (
          isPremium ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#9A9A94] font-semibold tracking-wider uppercase">건강 기록</p>
                <button onClick={() => setShowHealthModal(true)}
                  className="flex items-center gap-1 bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  <Plus size={12} /> 기록하기
                </button>
              </div>
              {healthLogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] py-10 text-center">
                  <p className="text-sm text-[#9A9A94]">건강 기록이 없습니다</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
                  {healthLogs.map((log, i) => (
                    <div key={log.id} className={`px-4 py-3 ${i < healthLogs.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F7F5] text-[#9A9A94]">{log.type}</span>
                        <span className="text-[10px] text-[#C8C8C4]">{log.logged_at.slice(0,10)}</span>
                      </div>
                      <p className="text-sm text-[#111]">{log.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : <PremiumGate feature="건강" />
        )}
      </div>

      {/* ── 급여 기록 모달 ── */}
      {showFeedModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md">
            <div className="px-5 py-4 border-b border-[#E8E8E4] flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#111]">급여 기록</h3>
              <button onClick={() => setShowFeedModal(false)}><X size={18} className="text-[#9A9A94]" /></button>
            </div>
            <div className="p-5 space-y-3">
              <input value={feedForm.food_type} onChange={e => setFeedForm(p => ({ ...p, food_type: e.target.value }))}
                placeholder="먹이 종류 (핀키, 성체마우스, 귀뚜라미 등) *"
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
              <div className="grid grid-cols-2 gap-2">
                <input value={feedForm.food_size} onChange={e => setFeedForm(p => ({ ...p, food_size: e.target.value }))}
                  placeholder="크기 (소/중/대)" className="border border-[#E8E8E4] rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                <input type="number" value={feedForm.quantity} onChange={e => setFeedForm(p => ({ ...p, quantity: e.target.value }))}
                  placeholder="수량" className="border border-[#E8E8E4] rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111]" />
              </div>
              <div className="flex gap-2">
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => setFeedForm(p => ({ ...p, accepted: v }))}
                    className={`flex-1 py-2.5 text-sm rounded-xl border transition-colors ${
                      feedForm.accepted === v ? 'bg-[#111] text-white border-[#111] font-bold' : 'border-[#E8E8E4] text-[#9A9A94]'
                    }`}>{v ? '먹음' : '거부'}</button>
                ))}
              </div>
              <textarea value={feedForm.notes} onChange={e => setFeedForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="메모 (선택)" rows={2}
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              <button onClick={handleFeed} disabled={saving || !feedForm.food_type.trim()}
                className="w-full bg-[#111] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-40">
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 탈피 기록 모달 ── */}
      {showShedModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md">
            <div className="px-5 py-4 border-b border-[#E8E8E4] flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#111]">탈피 기록</h3>
              <button onClick={() => setShowShedModal(false)}><X size={18} className="text-[#9A9A94]" /></button>
            </div>
            <div className="p-5 space-y-3">
              <input type="date" value={shedForm.shed_at} onChange={e => setShedForm(p => ({ ...p, shed_at: e.target.value }))}
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111]" />
              <div className="flex gap-2">
                {['완전','부분','미완료'].map(c => (
                  <button key={c} onClick={() => setShedForm(p => ({ ...p, condition: c }))}
                    className={`flex-1 py-2.5 text-sm rounded-xl border transition-colors ${
                      shedForm.condition === c ? 'bg-[#111] text-white border-[#111] font-bold' : 'border-[#E8E8E4] text-[#9A9A94]'
                    }`}>{c}</button>
                ))}
              </div>
              <textarea value={shedForm.notes} onChange={e => setShedForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="메모" rows={2}
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              <button onClick={handleShed} disabled={saving}
                className="w-full bg-[#111] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-40">
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 체중 기록 모달 ── */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md">
            <div className="px-5 py-4 border-b border-[#E8E8E4] flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#111]">체중 기록</h3>
              <button onClick={() => setShowWeightModal(false)}><X size={18} className="text-[#9A9A94]" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={weightForm.weight_g} onChange={e => setWeightForm(p => ({ ...p, weight_g: e.target.value }))}
                  placeholder="체중 (g) *" className="border border-[#E8E8E4] rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                <input type="date" value={weightForm.measured_at} onChange={e => setWeightForm(p => ({ ...p, measured_at: e.target.value }))}
                  className="border border-[#E8E8E4] rounded-xl px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111]" />
              </div>
              <textarea value={weightForm.notes} onChange={e => setWeightForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="메모" rows={2}
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              <button onClick={handleWeight} disabled={saving || !weightForm.weight_g}
                className="w-full bg-[#111] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-40">
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 건강 기록 모달 ── */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md">
            <div className="px-5 py-4 border-b border-[#E8E8E4] flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#111]">건강 기록</h3>
              <button onClick={() => setShowHealthModal(false)}><X size={18} className="text-[#9A9A94]" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {['병원','투약','이상증상','기타'].map(t => (
                  <button key={t} onClick={() => setHealthForm(p => ({ ...p, type: t }))}
                    className={`py-2.5 text-sm rounded-xl border transition-colors ${
                      healthForm.type === t ? 'bg-[#111] text-white border-[#111] font-bold' : 'border-[#E8E8E4] text-[#9A9A94]'
                    }`}>{t}</button>
                ))}
              </div>
              <input type="date" value={healthForm.logged_at} onChange={e => setHealthForm(p => ({ ...p, logged_at: e.target.value }))}
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111]" />
              <textarea value={healthForm.description} onChange={e => setHealthForm(p => ({ ...p, description: e.target.value }))}
                placeholder="내용을 입력하세요 *" rows={3}
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              <button onClick={handleHealth} disabled={saving || !healthForm.description.trim()}
                className="w-full bg-[#111] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-40">
                {saving ? '저장 중…' : '저장'}
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
