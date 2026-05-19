import { useState, useMemo } from 'react';
import { useSpecies } from '../hooks/useSpecies';
import type { SpeciesWithMorphs } from '../lib/supabase';
import MorphCard from '../components/MorphCard';
import GlintLogo from '../components/GlintLogo';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: species, loading, error } = useSpecies();
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeMorphIds, setActiveMorphIds] = useState<Set<string>>(new Set());

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

  // ── 로딩 ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-surface-950 pt-16 flex items-center justify-center">
        <div className="text-center">
          <GlintLogo size={56} showText={false} className="text-gold-400 justify-center mb-6" />
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent mb-4" />
          <p className="text-sm text-zinc-500 tracking-wide">도감을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  // ── 에러 ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="min-h-screen bg-surface-950 pt-16 flex items-center justify-center">
        <div className="text-center">
          <GlintLogo size={48} showText={false} className="text-zinc-600 justify-center mb-4" />
          <p className="text-sm text-red-400 mb-2">데이터를 불러오지 못했습니다</p>
          <p className="text-xs text-zinc-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-950 pt-16">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-surface-700 bg-surface-900 px-6 py-14">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(200,169,110,0.07),transparent)]" />
        <div className="mx-auto max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] tracking-[0.4em] text-gold-400 mb-3 uppercase">
              Reptile Morph Encyclopedia
            </p>
            <div className="flex items-end gap-5 mb-3">
              <GlintLogo size={52} showText={false} className="text-gold-400" />
              <h1 className="font-display text-5xl font-bold text-zinc-100 leading-none">
                파충류 도감
              </h1>
            </div>
            <p className="mt-3 text-sm text-zinc-500 max-w-lg leading-relaxed">
              엄선된 파충류 모프별 정확한 정보와 분양가를 확인하세요.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="flex gap-8 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div>
              <p className="text-2xl font-bold text-zinc-100 font-display">
                {species.reduce((acc, s) => acc + s.morphs.length, 0)}
              </p>
              <p className="text-[10px] tracking-widest text-zinc-600 mt-0.5 uppercase">모프 수록</p>
            </div>
            <div className="w-px bg-surface-600" />
            <div>
              <p className="text-2xl font-bold text-zinc-100 font-display">{species.length}</p>
              <p className="text-[10px] tracking-widest text-zinc-600 mt-0.5 uppercase">종(Species)</p>
            </div>
            <div className="w-px bg-surface-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-400 font-display">
                {species.reduce(
                  (acc, s) => acc + s.morphs.filter((m) => m.status === 'available').length,
                  0
                )}
              </p>
              <p className="text-[10px] tracking-widest text-zinc-600 mt-0.5 uppercase">분양 가능</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Species tabs ─────────────────────────────────────────────────────── */}
      <section className="sticky top-16 z-40 border-b border-surface-700 bg-surface-900/95 backdrop-blur-md px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {species.map((sp) => {
              const isActive = (selectedId || species[0]?.id) === sp.id;
              return (
                <button
                  key={sp.id}
                  onClick={() => handleSelectSpecies(sp.id)}
                  className={`relative flex-shrink-0 px-6 py-4 text-sm font-medium tracking-wide transition-colors duration-200 border-b-2 ${
                    isActive
                      ? 'border-gold-400 text-gold-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <span className="block text-[15px] font-semibold">{sp.name_ko}</span>
                  <span className="block text-[10px] tracking-wide text-zinc-600 mt-0.5">
                    {sp.name_en}
                  </span>
                  {/* morph count badge */}
                  <span className={`absolute top-3 right-3 text-[9px] font-bold rounded-full px-1.5 py-0.5 ${
                    isActive ? 'bg-gold-400/20 text-gold-400' : 'bg-surface-700 text-zinc-600'
                  }`}>
                    {sp.morphs.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Species description + morph filters ──────────────────────────────── */}
      {currentSpecies && (
        <section className="border-b border-surface-700 bg-surface-800/40 px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed max-w-2xl">
              {currentSpecies.tagline}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] tracking-widest text-zinc-600 mr-1 uppercase">모프 필터</span>
              <button
                onClick={() => setActiveMorphIds(new Set())}
                className={`rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-150 ${
                  activeMorphIds.size === 0
                    ? 'bg-gold-400 text-surface-950'
                    : 'bg-surface-700 text-zinc-400 hover:bg-surface-600 hover:text-zinc-200'
                }`}
              >
                전체
              </button>
              {currentSpecies.morphs.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMorph(m.id)}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-150 ${
                    activeMorphIds.has(m.id)
                      ? 'bg-gold-400 text-surface-950'
                      : 'bg-surface-700 text-zinc-400 hover:bg-surface-600 hover:text-zinc-200'
                  }`}
                >
                  {m.name_ko}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Magazine card grid ───────────────────────────────────────────────── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs text-zinc-600 tracking-wide">
              {currentSpecies ? `${currentSpecies.name_ko}` : ''}{' '}
              <span className="text-zinc-700">—</span>{' '}
              <span className="text-zinc-500">총 {visibleMorphs.length}종 표시 중</span>
            </p>
          </div>

          {visibleMorphs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
              <GlintLogo size={56} showText={false} className="text-zinc-700 justify-center mb-5" />
              <p className="text-sm">선택된 모프가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleMorphs.map((morph, i) => (
                <MorphCard key={morph.id} morph={morph} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
