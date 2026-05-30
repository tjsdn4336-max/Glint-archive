'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Bell, ChevronRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import PhotoUpload from '@/components/common/PhotoUpload';

interface MyAnimal {
  id: string;
  name: string;
  species_korean: string;
  morph?: string;
  gender?: string;
  birth_date?: string;
  acquired_date?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  // joined from feeding_alerts
  next_feed_at?: string;
  last_fed_at?: string;
  interval_days?: number;
}

interface Props {
  userId: string;
}

function daysDiff(from: string): number {
  const d = Math.floor((Date.now() - new Date(from).getTime()) / 86400000);
  return d;
}

function daysUntil(target: string): number {
  return Math.ceil((new Date(target).getTime() - Date.now()) / 86400000);
}

/* ─── 프리미엄 게이트 ─── */
function PremiumGate() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-[#9A9A94]" />
      </div>
      <h3 className="font-serif text-lg font-bold text-[#111] mb-2">프리미엄 기능입니다</h3>
      <p className="text-sm text-[#9A9A94] mb-6 max-w-xs leading-relaxed">
        개체를 무제한으로 등록하고 탈피·체중·건강 기록까지<br />월 4,900원으로 시작하세요.
      </p>
      <Link href="/pricing"
        className="bg-[#111] text-white rounded-lg px-6 py-3 text-sm font-bold">
        프리미엄 시작하기
      </Link>
    </div>
  );
}

export default function MyAnimalsTab({ userId }: Props) {
  const sb = createClient();
  const [animals, setAnimals]   = useState<MyAnimal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [isPremium]             = useState(true); // 프리미엄 기능 전체 오픈
  const [toast, setToast]       = useState<string | null>(null);

  const [speciesSuggestions, setSpeciesSuggestions] = useState<string[]>([]);
  const [speciesQuery, setSpeciesQuery] = useState('');

  const [form, setForm] = useState({
    name: '', species_korean: '', morph: '', gender: '미구분',
    birth_date: '', acquired_date: '', acquired_from: '', notes: '', image_url: '',
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* 개체 + 먹이 알림 join */
  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: animalData } = await (sb as any)
      .from('my_animals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!animalData) { setLoading(false); return; }

    // 먹이 알림
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: alerts } = await (sb as any)
      .from('feeding_alerts')
      .select('animal_id, next_feed_at, last_fed_at, interval_days')
      .in('animal_id', animalData.map((a: MyAnimal) => a.id));

    const alertMap: Record<string, { next_feed_at?: string; last_fed_at?: string; interval_days?: number }> = {};
    (alerts ?? []).forEach((a: { animal_id: string; next_feed_at?: string; last_fed_at?: string; interval_days?: number }) => {
      alertMap[a.animal_id] = a;
    });

    setAnimals(animalData.map((a: MyAnimal) => ({ ...a, ...alertMap[a.id] })));
    setLoading(false);
  }, [userId]);

  /* 종 자동완성 */
  useEffect(() => {
    if (speciesQuery.length < 1) { setSpeciesSuggestions([]); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sb as any).from('species').select('name_korean').ilike('name_korean', `%${speciesQuery}%`).limit(5)
      .then(({ data }: { data: { name_korean: string }[] | null }) => {
        setSpeciesSuggestions((data ?? []).map(d => d.name_korean));
      });
  }, [speciesQuery]);

  useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.species_korean.trim()) return;
    // 무료 플랜 1마리 제한
    if (!isPremium && animals.length >= 1) {
      setShowAdd(false);
      showToast('무료 플랜은 1마리만 등록 가능합니다');
      return;
    }
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newAnimal, error } = await (sb as any).from('my_animals').insert({
      user_id: userId,
      name: form.name.trim(),
      species_korean: form.species_korean.trim(),
      morph: form.morph || null,
      gender: form.gender,
      birth_date: form.birth_date || null,
      acquired_date: form.acquired_date || null,
      acquired_from: form.acquired_from || null,
      notes: form.notes || null,
      image_url: form.image_url || null,
    }).select('id').single();

    if (!error && newAnimal) {
      // 먹이 알림 기본 생성 (7일 간격)
      const nextFeed = new Date();
      nextFeed.setDate(nextFeed.getDate() + 7);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sb as any).from('feeding_alerts').insert({
        animal_id: newAnimal.id, user_id: userId,
        interval_days: 7, next_feed_at: nextFeed.toISOString(),
      });
      setShowAdd(false);
      setForm({ name:'', species_korean:'', morph:'', gender:'미구분', birth_date:'', acquired_date:'', acquired_from:'', notes:'', image_url:'' });
      fetchAnimals();
      showToast(`${form.name} 등록 완료!`);
    }
    setSaving(false);
  };

  /* 먹이 알림 배너 (오늘 or 지난) */
  const alertAnimals = animals.filter(a => a.next_feed_at && daysUntil(a.next_feed_at) <= 0);

  return (
    <div>
      {/* 액션 바 */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold mb-0.5">MY REPTILES</p>
          <h2 className="font-serif text-xl font-bold text-[#111]">내 파충류</h2>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-[#111] text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center gap-1.5">
          <Plus size={14} /> 등록하기
        </button>
      </div>

      {/* 먹이 알림 배너 */}
      {alertAnimals.map(a => {
        const daysAgo = a.last_fed_at ? daysDiff(a.last_fed_at) : null;
        return (
          <div key={a.id} className="mx-5 mb-3 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#D94035] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-[#D94035]">{a.name} 먹이 줄 날이에요</p>
              <p className="text-xs text-[#9A9A94]">
                {daysAgo !== null ? `마지막 급여: ${daysAgo}일 전` : '아직 급여 기록 없음'}
              </p>
            </div>
            <Link href={`/mypage/animals/${a.id}?tab=feeding`}
              className="text-xs font-bold text-[#D94035] border border-red-200 rounded-lg px-3 py-1.5 flex-shrink-0">
              기록하기
            </Link>
          </div>
        );
      })}

      {/* 개체 리스트 */}
      <div className="px-5 pb-8 space-y-3">
        {loading ? (
          [1,2].map(i => <div key={i} className="bg-white rounded-2xl border border-[#E8E8E4] h-32 animate-pulse" />)
        ) : animals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E4] py-16 text-center">
            <p className="font-serif text-3xl text-[#E8E8E4] mb-3">🦎</p>
            <p className="text-sm text-[#9A9A94] mb-1">아직 등록된 파충류가 없어요</p>
            <p className="text-xs text-[#C8C8C4]">상단 버튼으로 첫 개체를 등록해보세요</p>
          </div>
        ) : animals.map(animal => {
          const dday = animal.next_feed_at ? daysUntil(animal.next_feed_at) : null;
          const daysSinceAcquired = animal.acquired_date
            ? Math.floor((Date.now() - new Date(animal.acquired_date).getTime()) / 86400000)
            : null;

          return (
            <Link key={animal.id} href={`/mypage/animals/${animal.id}`}
              className="block bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden hover:border-[#9A9A94] transition-colors">
              {/* 사진 — 4:3 비율 */}
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#F0F0EE] to-[#E4E4E0] overflow-hidden">
                {animal.image_url ? (
                  <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-sm text-[#C8C8C4]">{animal.species_korean}</span>
                  </div>
                )}
                {/* D-day 배지 (사진 위) */}
                {dday !== null && (
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur bg-white/90 ${
                      dday <= 0 ? 'text-[#D94035]' : dday <= 2 ? 'text-orange-600' : 'text-[#9A9A94]'
                    }`}>
                      {dday <= 0 ? '급여일!' : `D-${dday}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-serif text-base font-bold text-[#111]">{animal.name}</h3>
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-serif text-base font-bold text-[#111]">{animal.name}</h3>
                    {dday !== null && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                        dday <= 0 ? 'bg-red-50 text-[#D94035]' :
                        dday <= 2 ? 'bg-orange-50 text-orange-600' :
                        'bg-[#F7F7F5] text-[#9A9A94]'
                      }`}>
                        {dday <= 0 ? '먹이 D-Day' : `D-${dday}`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9A9A94]">{animal.species_korean}{animal.morph ? ` · ${animal.morph}` : ''}</p>
                  {animal.gender && <p className="text-[10px] text-[#C8C8C4] mt-0.5">{animal.gender}</p>}

                  <div className="flex items-center gap-3 mt-2">
                    {animal.last_fed_at && (
                      <span className="text-[10px] text-[#9A9A94]">
                        급여 {daysDiff(animal.last_fed_at)}일 전
                      </span>
                    )}
                    {daysSinceAcquired !== null && (
                      <span className="text-[10px] text-[#C8C8C4]">
                        함께한 지 {daysSinceAcquired}일
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* 무료 플랜 — 추가 등록 유도 */}
        {!isPremium && animals.length >= 1 && (
          <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
            <PremiumGate />
          </div>
        )}
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
                  userId={userId}
                  currentUrl={form.image_url}
                  onUploaded={url => setForm(p => ({ ...p, image_url: url }))}
                  aspectRatio="landscape"
                />
              </div>
              {/* 이름 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">별명 *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="두부, 콩이, 고구마 등"
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
              </div>

              {/* 종 (자동완성) */}
              <div className="relative">
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">종 이름 *</label>
                <input value={speciesQuery}
                  onChange={e => { setSpeciesQuery(e.target.value); setForm(p => ({ ...p, species_korean: e.target.value })); }}
                  placeholder="레오파드 게코, 볼파이톤 등"
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
                {speciesSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-[#E8E8E4] rounded-xl mt-1 overflow-hidden z-10 shadow-lg">
                    {speciesSuggestions.map(s => (
                      <button key={s} onClick={() => { setForm(p => ({ ...p, species_korean: s })); setSpeciesQuery(s); setSpeciesSuggestions([]); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F7F5] border-b border-[#E8E8E4] last:border-0">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 모프 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">모프</label>
                <input value={form.morph} onChange={e => setForm(p => ({ ...p, morph: e.target.value }))}
                  placeholder="블리자드, 노말 등"
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">성별</label>
                <div className="flex gap-2">
                  {['수컷','암컷','미구분'].map(g => (
                    <button key={g} onClick={() => setForm(p => ({ ...p, gender: g }))}
                      className={`flex-1 py-2.5 text-sm rounded-xl border transition-colors ${
                        form.gender === g ? 'border-[#111] bg-[#111] text-white font-semibold' : 'border-[#E8E8E4] text-[#9A9A94] hover:border-[#111]'
                      }`}>{g}</button>
                  ))}
                </div>
              </div>

              {/* 날짜 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'birth_date', label: '생년월일' },
                  { key: 'acquired_date', label: '입양일' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">{f.label}</label>
                    <input type="date" value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-[#E8E8E4] rounded-xl px-3 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111]" />
                  </div>
                ))}
              </div>

              {/* 입양처 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">어디서 입양</label>
                <input value={form.acquired_from} onChange={e => setForm(p => ({ ...p, acquired_from: e.target.value }))}
                  placeholder="샵명, 분양자 닉네임 등"
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] placeholder:text-[#C8C8C4]" />
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-[11px] text-[#9A9A94] font-semibold tracking-wider uppercase mb-1.5">메모</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="특이사항, 성격 등" rows={3}
                  className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:ring-1 focus:ring-[#111] resize-none placeholder:text-[#C8C8C4]" />
              </div>

              <button onClick={handleAdd} disabled={saving || !form.name.trim() || !form.species_korean.trim()}
                className="w-full bg-[#111] text-white py-3.5 rounded-xl text-sm font-bold disabled:opacity-40">
                {saving ? '등록 중…' : '등록하기'}
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
