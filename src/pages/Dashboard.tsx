import { useState, useMemo } from 'react';
import { useSpecies } from '../hooks/useSpecies';
import type { SpeciesWithMorphs } from '../lib/supabase';
import MorphCard from '../components/MorphCard';

export default function Dashboard() {
  const { data: species, loading, error } = useSpecies();
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeMorphIds, setActiveMorphIds] = useState<Set<string>>(new Set());

  // 첫 데이터 로드 시 첫 번째 종 자동 선택
  const currentSpecies: SpeciesWithMorphs | undefined =
    species.find((s) => s.id === (selectedId || species[0]?.id));

  function handleSelectSpecies(id: string) {
    setSelectedId(id);
    setActiveMorphIds(new Set());
  }

  function toggleMorph(id: string) {
    setActiveMorphIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const visibleMorphs = useMemo(() => {
    if (!currentSpecies) return [];
    if (activeMorphIds.size === 0) return currentSpecies.morphs;
    return currentSpecies.morphs.filter((m) => activeMorphIds.has(m.id));
  }, [currentSpecies, activeMorphIds]);

  // ── 로딩 ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-surface-950 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent mb-4" />
          <p className="text-sm text-zinc-500 tracking-wide">불러오는 중...</p>
        </div>
      </main>
    );
  }

  // ── 에러 ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="min-h-screen bg-surface-950 pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400 mb-2">데이터를 불러오지 못했습니다</p>
          <p className="text-xs text-zinc-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-950 pt-16">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="border-b border-surface-700 bg-surface-900 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] tracking-[0.3em] text-gold-400 mb-2">파충류 아카이브</p>
          <h1 className="font-display text-4xl font-bold text-zinc-100">Glint Archive</h1>
          <p className="mt-2 text-sm text-zinc-500 max-w-lg">
            엄선된 파충류 모프 데이터베이스 & 프리미엄 분양 쇼룸
          </p>
        </div>
      </section>

      {/* ── Species tabs ────────────────────────────────────────────────────── */}
      <section className="sticky top-16 z-40 border-b border-surface-700 bg-surface-900/95 backdrop-blur-md px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-0 overflow-x-auto">
            {species.map((sp) => (
              <button
                key={sp.id}
                onClick={() => handleSelectSpecies(sp.id)}
                className={`relative flex-shrink-0 px-6 py-4 text-sm font-medium tracking-wide transition-colors duration-200 border-b-2 ${
                  (selectedId || species[0]?.id) === sp.id
                    ? 'border-gold-400 text-gold-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <span className="block text-base">{sp.name_ko}</span>
                <span className="block text-[10px] tracking-wide text-zinc-600 mt-0.5">
                  {sp.name_en}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Morph filters ───────────────────────────────────────────────────── */}
      {currentSpecies && (
        <section className="border-b border-surface-700 bg-surface-800/50 px-6 py-5">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs text-zinc-500 mb-4">{currentSpecies.tagline}</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] tracking-wide text-zinc-600 mr-1">모프 필터</span>
              <button
                onClick={() => setActiveMorphIds(new Set())}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-150 ${
                  activeMorphIds.size === 0
                    ? 'bg-gold-400 text-surface-950'
                    : 'bg-surface-600 text-zinc-400 hover:bg-surface-500 hover:text-zinc-200'
                }`}
              >
                전체
              </button>
              {currentSpecies.morphs.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMorph(m.id)}
                  className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-150 ${
                    activeMorphIds.has(m.id)
                      ? 'bg-gold-400 text-surface-950'
                      : 'bg-surface-600 text-zinc-400 hover:bg-surface-500 hover:text-zinc-200'
                  }`}
                >
                  {m.name_ko}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Card grid ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs text-zinc-600 mb-6 tracking-wide">
            {currentSpecies ? `${currentSpecies.name_ko} — ` : ''}총 {visibleMorphs.length}종 표시 중
          </p>
          {visibleMorphs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
              <span className="text-4xl mb-3">🦎</span>
              <p className="text-sm">선택된 모프가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleMorphs.map((morph) => (
                <MorphCard key={morph.id} morph={morph} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
