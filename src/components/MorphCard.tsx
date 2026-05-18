import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { MorphRow, Status } from '../lib/supabase';
import { getMorphFilter } from '../lib/morphFilters';

interface Props {
  morph: MorphRow;
  index?: number;
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string; text: string }> = {
  available: { label: '분양 가능', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  reserved:  { label: '예약 중',   dot: 'bg-amber-400',   text: 'text-amber-400'  },
  sold:      { label: '분양 완료', dot: 'bg-zinc-500',    text: 'text-zinc-500'   },
};

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

export default function MorphCard({ morph, index = 0 }: Props) {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_CONFIG[morph.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-surface-600 bg-surface-800 transition-all duration-300 hover:border-gold-500/40 hover:shadow-[0_0_40px_-8px_rgba(200,169,110,0.15)] hover:-translate-y-0.5">
        {/* Image — clickable to detail */}
        <Link to={`/morph/${morph.id}`} className="relative aspect-[4/3] overflow-hidden bg-surface-700 block">
          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-700">
              <span className="text-5xl mb-2 select-none">🦎</span>
              <span className="text-xs text-zinc-500 tracking-widest uppercase">{morph.name_en}</span>
            </div>
          ) : (
            <img
              src={morph.image_url}
              alt={`${morph.name_ko} (${morph.name_en})`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ filter: getMorphFilter(morph.id) }}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-surface-950/80 px-3 py-1 text-[11px] font-medium tracking-wide backdrop-blur-sm ${s.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/50 via-transparent to-transparent" />
          {/* Sold overlay */}
          {morph.status === 'sold' && (
            <div className="absolute inset-0 bg-surface-950/60 flex items-center justify-center">
              <span className="text-sm font-semibold tracking-[0.15em] text-zinc-400">분양 완료</span>
            </div>
          )}
          {/* Hover: "자세히 보기" */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="rounded-full bg-surface-950/80 backdrop-blur-sm border border-gold-400/40 px-5 py-2 text-xs font-semibold text-gold-400">
              자세히 보기 →
            </span>
          </div>
        </Link>

        {/* Body */}
        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap gap-1.5">
            {morph.tags.map((tag) => (
              <span key={tag} className="rounded-sm bg-surface-600 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                {tag}
              </span>
            ))}
          </div>
          <div>
            <Link to={`/morph/${morph.id}`}>
              <h3 className="font-display text-lg font-semibold text-zinc-100 leading-snug hover:text-gold-400 transition-colors">
                {morph.name_ko}
              </h3>
            </Link>
            <p className="mt-0.5 text-xs tracking-widest text-zinc-500 uppercase">{morph.name_en}</p>
          </div>
          <p className="text-gold-400 font-semibold text-base tracking-wide">{formatPrice(morph.price)}</p>
          <div className="border-t border-surface-600 pt-3">
            <p className={`text-sm leading-relaxed text-zinc-400 ${expanded ? '' : 'line-clamp-3'}`}>
              {morph.description}
            </p>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-[11px] font-medium text-gold-400/70 hover:text-gold-400 transition-colors"
            >
              {expanded ? '접기 ↑' : '더 보기 ↓'}
            </button>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
