import { useState, useCallback } from 'react';
import { useSpecies } from '../hooks/useSpecies';
import type { SpeciesWithMorphs, MorphRow } from '../lib/supabase';

// ─── Tournament helpers ───────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toBracketPool(morphs: MorphRow[]): MorphRow[] {
  const sizes = [16, 8, 4, 2];
  const size = sizes.find((s) => s <= morphs.length) ?? 2;
  return shuffle(morphs).slice(0, size);
}

function getRoundLabel(roundSize: number): string {
  const m = roundSize / 2;
  if (m >= 8) return '16강';
  if (m >= 4) return '8강';
  if (m >= 2) return '4강';
  return '결승';
}

// ─── CandidateCard ────────────────────────────────────────────────────────────
function CandidateCard({ morph, onPick }: { morph: MorphRow; onPick: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <button
      onClick={onPick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-surface-600 bg-surface-800 transition-all duration-300 hover:border-gold-400 hover:shadow-[0_0_60px_-10px_rgba(200,169,110,0.35)] hover:scale-[1.02] active:scale-[0.99] w-full text-left"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-700">
        {imgErr ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-700">
            <span className="text-5xl mb-2">🦎</span>
            <span className="text-xs text-zinc-500">{morph.name_ko}</span>
          </div>
        ) : (
          <img
            src={morph.image_url}
            alt={morph.name_ko}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="rounded-full bg-gold-400 px-6 py-2 text-sm font-bold text-surface-950 shadow-lg">선택</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1">
        <p className="font-display text-lg font-semibold text-zinc-100 leading-snug">{morph.name_ko}</p>
        <p className="text-xs text-zinc-500">{morph.name_en}</p>
        <p className="mt-1 text-gold-400 text-sm font-medium">{morph.price.toLocaleString('ko-KR')}원</p>
        <p className="mt-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">{morph.description}</p>
      </div>
    </button>
  );
}

// ─── Worldcup page ────────────────────────────────────────────────────────────
type Phase = 'select' | 'match' | 'champion';

interface TState {
  currentRound: MorphRow[];
  matchIndex: number;
  pendingWinners: MorphRow[];
}

export default function Worldcup() {
  const { data: species, loading } = useSpecies();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesWithMorphs | null>(null);
  const [tournament, setTournament] = useState<TState | null>(null);
  const [champion, setChampion] = useState<MorphRow | null>(null);
  const [champImgErr, setChampImgErr] = useState(false);

  function startTournament(sp: SpeciesWithMorphs) {
    const pool = toBracketPool(sp.morphs);
    setSelectedSpecies(sp);
    setTournament({ currentRound: pool, matchIndex: 0, pendingWinners: [] });
    setChampion(null);
    setChampImgErr(false);
    setPhase('match');
  }

  const pickWinner = useCallback((winner: MorphRow) => {
    if (!tournament) return;
    const { currentRound, matchIndex, pendingWinners } = tournament;
    const newWinners = [...pendingWinners, winner];
    const nextIdx = matchIndex + 1;
    const totalMatches = currentRound.length / 2;

    if (nextIdx >= totalMatches) {
      if (newWinners.length === 1) {
        setChampion(newWinners[0]);
        setPhase('champion');
        setTournament(null);
      } else {
        setTournament({ currentRound: shuffle(newWinners), matchIndex: 0, pendingWinners: [] });
      }
    } else {
      setTournament({ ...tournament, matchIndex: nextIdx, pendingWinners: newWinners });
    }
  }, [tournament]);

  function reset() {
    setPhase('select');
    setSelectedSpecies(null);
    setTournament(null);
    setChampion(null);
  }

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

  // ── 종 선택 ──────────────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <main className="min-h-screen bg-surface-950 pt-16">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.3em] text-gold-400 mb-3">이상형 월드컵</p>
          <h1 className="font-display text-4xl font-bold text-zinc-100 mb-3">어떤 종이 나의 이상형?</h1>
          <p className="text-sm text-zinc-500">종을 선택하고 토너먼트를 시작하세요</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {species.map((sp) => (
            <button key={sp.id} onClick={() => startTournament(sp)}
              className="group flex flex-col gap-3 rounded-2xl border border-surface-600 bg-surface-800 p-7 text-left transition-all duration-300 hover:border-gold-500/50 hover:bg-surface-700 hover:shadow-[0_0_40px_-10px_rgba(200,169,110,0.2)]">
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-semibold text-zinc-100 group-hover:text-gold-400 transition-colors">{sp.name_ko}</span>
                <span className="rounded-full bg-surface-600 px-3 py-1 text-[10px] text-zinc-500">{sp.morphs.length}개 모프</span>
              </div>
              <p className="text-xs text-zinc-500">{sp.name_en}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{sp.tagline}</p>
              <span className="text-[10px] text-gold-400/70 font-medium mt-2">
                {toBracketPool(sp.morphs).length}강 토너먼트 시작 →
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );

  // ── 대결 ─────────────────────────────────────────────────────────────────────
  if (phase === 'match' && tournament && selectedSpecies) {
    const { currentRound, matchIndex, pendingWinners } = tournament;
    const left = currentRound[matchIndex * 2];
    const right = currentRound[matchIndex * 2 + 1];
    const totalMatches = currentRound.length / 2;

    return (
      <main className="min-h-screen bg-surface-950 pt-16">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold-500/30 bg-surface-800 px-5 py-2 mb-4">
              <span className="text-gold-400 font-bold text-sm">{getRoundLabel(currentRound.length)}</span>
              <span className="text-zinc-600 text-xs">·</span>
              <span className="text-zinc-500 text-xs">{matchIndex + 1} / {totalMatches} 경기</span>
            </div>
            <p className="text-xs text-zinc-600">{selectedSpecies.name_ko} 이상형 월드컵</p>
          </div>
          <div className="max-w-md mx-auto mb-10">
            <div className="h-0.5 bg-surface-600 rounded-full overflow-hidden">
              <div className="h-full bg-gold-400 transition-all duration-500 rounded-full"
                style={{ width: `${(pendingWinners.length / totalMatches) * 100}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 md:gap-8">
            <CandidateCard morph={left} onPick={() => pickWinner(left)} />
            <div className="flex flex-col items-center justify-center py-12 self-center">
              <span className="font-display text-3xl font-bold text-gold-400/80">VS</span>
            </div>
            <CandidateCard morph={right} onPick={() => pickWinner(right)} />
          </div>
          <div className="flex justify-center mt-10">
            <button onClick={reset} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              ← 종 다시 선택
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── 챔피언 ───────────────────────────────────────────────────────────────────
  if (phase === 'champion' && champion && selectedSpecies) return (
    <main className="min-h-screen bg-surface-950 pt-16">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mb-4 text-5xl select-none">🏆</div>
        <p className="text-[11px] tracking-[0.3em] text-gold-400 mb-2">나의 이상형</p>
        <h2 className="font-display text-3xl font-bold text-zinc-100 mb-1">{champion.name_ko}</h2>
        <p className="text-sm text-zinc-500 mb-6">
          {champion.name_en} · {selectedSpecies.name_ko}
        </p>
        <div className="relative mx-auto mb-8 aspect-[4/3] max-w-md overflow-hidden rounded-3xl border-2 border-gold-400/50 shadow-[0_0_80px_-15px_rgba(200,169,110,0.5)]">
          {champImgErr ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-700">
              <span className="text-6xl mb-2">🦎</span>
            </div>
          ) : (
            <img src={champion.image_url} alt={champion.name_ko}
              className="h-full w-full object-cover" onError={() => setChampImgErr(true)} />
          )}
        </div>
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-gold-400 font-semibold text-lg">{champion.price.toLocaleString('ko-KR')}원</p>
            <p className="text-[10px] tracking-wide text-zinc-600">분양가</p>
          </div>
          <div className="w-px bg-surface-600" />
          <div className="text-center">
            <p className="text-zinc-300 font-semibold text-lg">
              {champion.status === 'available' ? '분양 가능' : champion.status === 'reserved' ? '예약 중' : '분양 완료'}
            </p>
            <p className="text-[10px] tracking-wide text-zinc-600">상태</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {champion.tags.map((tag) => (
            <span key={tag} className="rounded-sm bg-gold-400/10 border border-gold-400/20 px-3 py-1 text-[10px] font-semibold text-gold-400">{tag}</span>
          ))}
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto mb-10">{champion.description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => startTournament(selectedSpecies)}
            className="rounded-full bg-gold-400 px-8 py-3 text-sm font-bold text-surface-950 hover:bg-gold-300 transition-colors">
            다시 하기
          </button>
          <button onClick={reset}
            className="rounded-full border border-surface-500 px-8 py-3 text-sm font-medium text-zinc-400 hover:border-zinc-400 hover:text-zinc-200 transition-colors">
            종 다시 선택
          </button>
        </div>
      </div>
    </main>
  );

  return null;
}
