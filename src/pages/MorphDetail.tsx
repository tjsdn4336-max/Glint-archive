import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { MorphRow, SpeciesRow, Status } from '../lib/supabase';
const STATUS_CONFIG: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
  available: {
    label: '분양 가능',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  reserved: {
    label: '예약 중',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  sold: {
    label: '분양 완료',
    dot: 'bg-zinc-500',
    text: 'text-zinc-500',
    bg: 'bg-zinc-500/10 border-zinc-500/20',
  },
};

interface DetailData {
  morph: MorphRow;
  species: SpeciesRow;
  related: MorphRow[];
}

function RelatedCard({ morph }: { morph: MorphRow }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <Link
      to={`/morph/${morph.id}`}
      className="group relative overflow-hidden rounded-xl border border-surface-600 bg-surface-800 transition-all duration-300 hover:border-gold-400/40 hover:-translate-y-0.5 hover:shadow-[0_0_30px_-10px_rgba(200,169,110,0.25)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-700">
        {imgErr ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🦎</span>
          </div>
        ) : (
          <img
            src={morph.image_url}
            alt={morph.name_ko}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/70 to-transparent" />
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-zinc-200 group-hover:text-gold-400 transition-colors">
          {morph.name_ko}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{morph.price.toLocaleString('ko-KR')}원</p>
      </div>
    </Link>
  );
}

export default function MorphDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgErr(false);
    setImgLoaded(false);

    async function fetchDetail() {
      try {
        // Fetch the morph
        const { data: morphData, error: mErr } = await supabase
          .from('morphs')
          .select('*')
          .eq('id', id)
          .single();
        if (mErr) throw mErr;

        // Fetch its species
        const { data: speciesData, error: sErr } = await supabase
          .from('species')
          .select('*')
          .eq('id', morphData.species_id)
          .single();
        if (sErr) throw sErr;

        // Fetch related (same species, different morph, limit 4)
        const { data: relatedData, error: rErr } = await supabase
          .from('morphs')
          .select('*')
          .eq('species_id', morphData.species_id)
          .neq('id', id)
          .order('sort_order')
          .limit(4);
        if (rErr) throw rErr;

        setDetail({
          morph: morphData,
          species: speciesData,
          related: relatedData ?? [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-950 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent mb-4" />
          <p className="text-sm text-zinc-500">불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen bg-surface-950 pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400 mb-4">데이터를 불러오지 못했습니다</p>
          <button onClick={() => navigate(-1)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← 뒤로가기
          </button>
        </div>
      </main>
    );
  }

  const { morph, species, related } = detail;
  const s = STATUS_CONFIG[morph.status];

  return (
    <main className="min-h-screen bg-surface-950 pt-16">
      {/* Back nav */}
      <div className="border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-12 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>뒤로가기</span>
          </button>
          <span className="text-zinc-700 text-xs">·</span>
          <Link to="/archive" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            아카이브
          </Link>
          <span className="text-zinc-700 text-xs">·</span>
          <span className="text-xs text-zinc-500">{species.name_ko}</span>
          <span className="text-zinc-700 text-xs">·</span>
          <span className="text-xs text-gold-400">{morph.name_ko}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* ── Left: Image ───────────────────────────────────────────────── */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-surface-800 border border-surface-600 aspect-[4/3]">
              {imgErr ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-700">
                  <span className="text-8xl mb-3">🦎</span>
                  <p className="text-xs text-zinc-500">{morph.name_en}</p>
                </div>
              ) : (
                <>
                  <img
                    src={morph.image_url}
                    alt={morph.name_ko}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onError={() => setImgErr(true)}
                    onLoad={() => setImgLoaded(true)}
                  />
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-800">
                      <div className="h-6 w-6 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
                    </div>
                  )}
                </>
              )}
              {/* Status overlay for sold */}
              {morph.status === 'sold' && (
                <div className="absolute inset-0 bg-surface-950/60 flex items-center justify-center">
                  <span className="text-sm font-semibold tracking-[0.2em] text-zinc-400">분양 완료</span>
                </div>
              )}
            </div>

            {/* Attribution */}
            <p className="mt-2 text-[10px] text-zinc-700 text-right">
              이미지: Wikimedia Commons (CC BY / CC BY-SA)
            </p>
          </motion.div>

          {/* ── Right: Info ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Species label */}
            <p className="text-[11px] tracking-[0.35em] text-gold-400 mb-2">
              {species.name_ko} · {species.name_en}
            </p>

            {/* Title */}
            <h1 className="font-display text-4xl font-bold text-zinc-100 leading-tight mb-1">
              {morph.name_ko}
            </h1>
            <p className="text-sm tracking-widest text-zinc-500 uppercase mb-6">{morph.name_en}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {morph.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-gold-400/10 border border-gold-400/20 px-3 py-1 text-[10px] font-semibold tracking-widest text-gold-400 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl border border-surface-600 bg-surface-800 p-5">
                <p className="text-[10px] tracking-widest text-zinc-600 mb-1.5">분양가</p>
                <p className="font-display text-2xl font-bold text-gold-400">
                  {morph.price.toLocaleString('ko-KR')}원
                </p>
              </div>
              <div className={`rounded-2xl border ${s.bg} p-5`}>
                <p className="text-[10px] tracking-widest text-zinc-600 mb-1.5">현재 상태</p>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <p className={`font-display text-xl font-semibold ${s.text}`}>{s.label}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-[11px] tracking-[0.25em] text-zinc-600 mb-3">설명</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{morph.description}</p>
            </div>

            {/* CTA */}
            {morph.status === 'available' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="rounded-2xl border border-gold-400/20 bg-gold-400/5 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">분양 문의</p>
                    <p className="text-xs text-zinc-500 mt-0.5">현재 분양 가능한 모프입니다</p>
                  </div>
                  <a
                    href="mailto:contact@glintarchive.com"
                    className="rounded-full bg-gold-400 px-5 py-2 text-xs font-bold text-surface-950 hover:bg-gold-300 transition-colors"
                  >
                    문의하기
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ── Related morphs ───────────────────────────────────────────────── */}
        {related.length > 0 && (
          <motion.section
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[11px] tracking-[0.3em] text-gold-400 mb-1">같은 종의 모프</p>
                <h2 className="font-display text-2xl font-bold text-zinc-100">
                  {species.name_ko} 다른 모프
                </h2>
              </div>
              <Link
                to="/archive"
                className="text-xs text-zinc-500 hover:text-gold-400 transition-colors"
              >
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <RelatedCard morph={r} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
