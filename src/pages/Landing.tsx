import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSpecies } from '../hooks/useSpecies';
import { getMorphFilter } from '../lib/morphFilters';

// ─── Floating morph card (hero decoration) ───────────────────────────────────
function FloatingCard({
  imageUrl,
  morphId,
  name,
  style,
  delay,
}: {
  imageUrl: string;
  morphId: string;
  name: string;
  style?: React.CSSProperties;
  delay: number;
}) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.div
      className="absolute overflow-hidden rounded-2xl border border-surface-600/60 bg-surface-800 shadow-2xl"
      style={style}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
      >
        <div className="w-40 h-52 md:w-48 md:h-64 relative overflow-hidden">
          {imgErr ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-700">
              <span className="text-4xl">🦎</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: getMorphFilter(morphId) }}
              onError={() => setImgErr(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-xs font-semibold text-zinc-200 leading-tight">{name}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Species card ─────────────────────────────────────────────────────────────
function SpeciesCard({
  nameKo,
  nameEn,
  morphCount,
  imageSrc,
  morphId,
  index,
}: {
  nameKo: string;
  nameEn: string;
  morphCount: number;
  imageSrc: string;
  morphId: string;
  index: number;
}) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/archive"
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-surface-600 bg-surface-800 transition-all duration-500 hover:border-gold-400/40 hover:shadow-[0_0_60px_-15px_rgba(200,169,110,0.3)] hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-700">
          {imgErr ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">🦎</span>
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={nameKo}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-107"
              style={{ filter: getMorphFilter(morphId) }}
              onError={() => setImgErr(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-surface-950/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-display text-2xl font-bold text-zinc-100 group-hover:text-gold-400 transition-colors duration-300">
              {nameKo}
            </h3>
            <p className="text-xs tracking-widest text-zinc-400 mt-1">{nameEn}</p>
          </div>
          <div className="absolute top-4 right-4">
            <span className="rounded-full bg-surface-950/80 backdrop-blur-sm px-3 py-1 text-[10px] font-medium text-zinc-400 border border-surface-500">
              {morphCount}종 모프
            </span>
          </div>
        </div>
        <div className="p-5 flex items-center justify-between">
          <span className="text-xs text-zinc-500">아카이브에서 보기</span>
          <span className="text-gold-400/60 group-hover:text-gold-400 group-hover:translate-x-1 transition-all duration-300 text-sm">→</span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Stat counter ─────────────────────────────────────────────────────────────
function StatItem({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="font-display text-4xl font-bold text-shimmer">{value}</p>
      <p className="text-xs tracking-widest text-zinc-500 mt-2">{label}</p>
    </motion.div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
export default function Landing() {
  const { data: species, loading } = useSpecies();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const totalMorphs = species.reduce((acc, sp) => acc + sp.morphs.length, 0);

  // Pick featured morphs for hero floating cards
  const featuredMorphs = species.flatMap((sp) => sp.morphs.slice(0, 2)).slice(0, 6);

  return (
    <main className="min-h-screen bg-surface-950 overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background orbs */}
        <div
          className="absolute pointer-events-none select-none"
          style={{ top: '15%', left: '-5%', width: 600, height: 600 }}
        >
          <motion.div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(200,169,110,0.07) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div
          className="absolute pointer-events-none select-none"
          style={{ bottom: '10%', right: '-8%', width: 500, height: 500 }}
        >
          <motion.div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(200,169,110,0.05) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* Floating morph cards */}
        <div className="absolute inset-0 pointer-events-none select-none hidden lg:block">
          {featuredMorphs[0] && (
            <FloatingCard
              imageUrl={featuredMorphs[0].image_url}
              morphId={featuredMorphs[0].id}
              name={featuredMorphs[0].name_ko}
              style={{ top: '18%', right: '6%' }}
              delay={0.6}
            />
          )}
          {featuredMorphs[1] && (
            <FloatingCard
              imageUrl={featuredMorphs[1].image_url}
              morphId={featuredMorphs[1].id}
              name={featuredMorphs[1].name_ko}
              style={{ top: '45%', right: '18%' }}
              delay={0.9}
            />
          )}
          {featuredMorphs[2] && (
            <FloatingCard
              imageUrl={featuredMorphs[2].image_url}
              morphId={featuredMorphs[2].id}
              name={featuredMorphs[2].name_ko}
              style={{ bottom: '12%', right: '8%' }}
              delay={1.1}
            />
          )}
          {featuredMorphs[3] && (
            <FloatingCard
              imageUrl={featuredMorphs[3].image_url}
              morphId={featuredMorphs[3].id}
              name={featuredMorphs[3].name_ko}
              style={{ top: '20%', left: '3%' }}
              delay={0.8}
            />
          )}
          {featuredMorphs[4] && (
            <FloatingCard
              imageUrl={featuredMorphs[4].image_url}
              morphId={featuredMorphs[4].id}
              name={featuredMorphs[4].name_ko}
              style={{ bottom: '25%', left: '5%' }}
              delay={1.2}
            />
          )}
        </div>

        {/* Center copy */}
        <div
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <motion.p
            className="text-[11px] tracking-[0.4em] text-gold-400 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            파충류 프리미엄 아카이브
          </motion.p>

          <motion.h1
            className="font-display font-bold leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block text-5xl md:text-7xl text-zinc-100">희귀 모프의</span>
            <span className="block text-5xl md:text-7xl text-shimmer mt-1">
              Glint Archive
            </span>
          </motion.h1>

          <motion.p
            className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            엄선된 파충류 모프 데이터베이스와 프리미엄 분양 쇼룸.<br className="hidden md:block" />
            당신의 이상형 파충류를 찾아보세요.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/archive"
              className="group relative overflow-hidden rounded-full bg-gold-400 px-8 py-3.5 text-sm font-bold text-surface-950 transition-all duration-300 hover:bg-gold-300 hover:shadow-[0_0_40px_-8px_rgba(200,169,110,0.6)] hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">아카이브 둘러보기 →</span>
            </Link>
            <Link
              to="/worldcup"
              className="rounded-full border border-surface-500 px-8 py-3.5 text-sm font-medium text-zinc-400 transition-all duration-300 hover:border-zinc-400 hover:text-zinc-200 hover:scale-105 active:scale-95"
            >
              이상형 월드컵
            </Link>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <motion.div
            className="w-5 h-8 rounded-full border border-zinc-700 flex items-start justify-center pt-1.5"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-1.5 rounded-full bg-gold-400"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          <span className="text-[10px] tracking-[0.2em] text-zinc-700">SCROLL</span>
        </motion.div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="border-y border-surface-700 bg-surface-900/80 backdrop-blur-sm py-12 px-6">
        <div className="mx-auto max-w-3xl grid grid-cols-3 gap-8">
          <StatItem value={`${species.length}`} label="파충류 종" delay={0} />
          <StatItem value={`${totalMorphs}`} label="등록 모프" delay={0.1} />
          <StatItem value="CC" label="라이선스 이미지" delay={0.2} />
        </div>
      </section>

      {/* ── Species showcase ──────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] tracking-[0.35em] text-gold-400 mb-3">등록 종</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              어떤 파충류를 찾고 있나요?
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              각 종별로 엄선된 모프를 확인하세요. 희귀 색상변이부터 프리미엄 품종까지.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {species.map((sp, i) => (
                <SpeciesCard
                  key={sp.id}
                  nameKo={sp.name_ko}
                  nameEn={sp.name_en}
                  morphCount={sp.morphs.length}
                  imageSrc={sp.morphs[0]?.image_url ?? ''}
                  morphId={sp.morphs[0]?.id ?? ''}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────────── */}
      <section className="px-6 py-16 bg-surface-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: '상세 정보',
                desc: '각 모프의 색상 특징, 분양가, 상태를 한눈에 확인할 수 있습니다.',
                delay: 0,
              },
              {
                icon: '🏆',
                title: '이상형 월드컵',
                desc: '토너먼트 방식으로 나만의 이상형 파충류를 찾아보세요.',
                delay: 0.12,
              },
              {
                icon: '✨',
                title: '프리미엄 모프',
                desc: '희귀하고 아름다운 색상변이 모프를 엄선해 소개합니다.',
                delay: 0.24,
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                className="rounded-2xl border border-surface-600 bg-surface-800 p-7"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: f.delay, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="text-3xl mb-4 select-none">{f.icon}</div>
                <h3 className="font-display text-lg font-semibold text-zinc-100 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Worldcup CTA ──────────────────────────────────────────────────── */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-gold-400/20 bg-surface-800 p-12 md:p-16"
          >
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%)',
                }}
              />
            </div>
            <div className="relative z-10">
              <div className="text-5xl mb-6 select-none">🏆</div>
              <p className="text-[11px] tracking-[0.35em] text-gold-400 mb-3">
                이상형 월드컵
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
                나의 이상형 파충류는?
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto mb-8">
                1:1 토너먼트 방식으로 모프들을 비교하고,<br className="hidden md:block" />
                당신만의 이상형을 발견해보세요.
              </p>
              <Link
                to="/worldcup"
                className="inline-block rounded-full bg-gold-400 px-10 py-3.5 text-sm font-bold text-surface-950 transition-all duration-300 hover:bg-gold-300 hover:shadow-[0_0_40px_-8px_rgba(200,169,110,0.5)] hover:scale-105 active:scale-95"
              >
                월드컵 시작하기 →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-700 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl select-none">🦎</span>
            <div>
              <p className="font-display font-semibold text-zinc-300 text-sm">Glint Archive</p>
              <p className="text-[10px] tracking-wider text-zinc-600">파충류 분양 쇼룸</p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-700">
            이미지 출처: Wikimedia Commons (CC BY / CC BY-SA)
          </p>
        </div>
      </footer>
    </main>
  );
}
