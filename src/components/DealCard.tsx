import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TimeDeal } from '../types';

interface Props {
  deal: TimeDeal;
  index: number;
}

function useCountdown(endsAt: Date) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endsAt.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, endsAt.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const totalSec = Math.floor(remaining / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
    isExpired: remaining === 0,
    isUrgent: remaining < 60 * 60 * 1000, // < 1시간
    isCritical: remaining < 30 * 60 * 1000, // < 30분
  };
}

export default function DealCard({ deal, index }: Props) {
  const { h, m, s, isExpired, isUrgent, isCritical } = useCountdown(deal.endsAt);
  const [liked, setLiked] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const stockRatio = deal.remainingStock / deal.stock;
  const isEnding = deal.status === 'ending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {/* 마감임박 글로우 */}
      {isEnding && (
        <div
          className="absolute -inset-[1.5px] rounded-2xl z-0 opacity-70"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #ef4444 100%)',
            borderRadius: '16px',
          }}
        />
      )}

      <div
        className={`relative z-10 rounded-2xl overflow-hidden bg-white flex flex-col
          ${isEnding ? 'border-transparent shadow-lg' : 'border border-slate-200/80 shadow-card'}
          transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-card-lg
        `}
      >
        {/* 이미지 영역 */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {deal.imageUrl && !imgErr ? (
            <img
              src={deal.imageUrl}
              alt={deal.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-20">🦎</span>
            </div>
          )}

          {/* 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* 타이머 — 이미지 하단 오버레이 */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {/* 할인율 배지 */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white font-sans font-black text-sm"
              style={{ background: isCritical ? '#ef4444' : isUrgent ? '#f97316' : '#0d9488' }}
            >
              -{deal.discountRate}%
            </div>

            {/* 카운트다운 */}
            {!isExpired ? (
              <div
                className={`flex items-center gap-0.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold text-white backdrop-blur-sm
                  ${isCritical ? 'bg-red-500/90' : isUrgent ? 'bg-orange-500/90' : 'bg-black/50'}
                `}
              >
                <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20" className="opacity-80">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span className="ml-1">{h}:{m}:{s}</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg bg-slate-600/80 font-sans text-xs font-bold text-white backdrop-blur-sm">
                마감
              </div>
            )}
          </div>

          {/* 프리미엄 샵 배지 */}
          {deal.shopPlan === 'premium' && (
            <div className="absolute top-3 left-3">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-900 tracking-wide"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
              >
                ★ PREMIUM
              </div>
            </div>
          )}

          {/* 찜 버튼 */}
          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors duration-200"
          >
            <svg
              width="14" height="14"
              viewBox="0 0 24 24"
              fill={liked ? '#ef4444' : 'none'}
              stroke={liked ? '#ef4444' : 'white'}
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>

        {/* 카드 본문 */}
        <div className="p-4 flex flex-col gap-3">
          {/* 태그 */}
          {deal.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {deal.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[9px] font-sans font-bold tracking-wider px-2 py-0.5 rounded-md
                    ${tag === '마감임박' || tag.includes('잔여') ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}
                  `}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 제목 + 모프 */}
          <div>
            <h3 className="font-display text-base font-bold text-slate-800 leading-snug line-clamp-2">
              {deal.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-sans text-teal-600 font-semibold">{deal.speciesLabel}</span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs font-sans text-slate-500">{deal.morphName}</span>
              <span className="text-slate-300 text-xs">·</span>
              <span className={`text-xs font-sans font-semibold px-1.5 py-0.5 rounded-md
                ${deal.gender === '수컷' ? 'bg-blue-50 text-blue-500' : deal.gender === '암컷' ? 'bg-pink-50 text-pink-500' : 'bg-slate-100 text-slate-500'}
              `}>{deal.gender}</span>
            </div>
          </div>

          {/* 가격 */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-sans text-slate-400 line-through">
                {deal.originalPrice.toLocaleString()}원
              </p>
              <p className="font-display text-xl font-black text-slate-900">
                {deal.salePrice.toLocaleString()}<span className="text-sm font-sans font-semibold text-slate-500 ml-0.5">원</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-sans text-slate-400 mb-0.5">잔여</p>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stockRatio < 0.3 ? 'bg-red-400' : stockRatio < 0.6 ? 'bg-orange-400' : 'bg-teal-400'}`}
                    style={{ width: `${stockRatio * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-sans font-bold ${stockRatio < 0.3 ? 'text-red-500' : 'text-slate-600'}`}>
                  {deal.remainingStock}마리
                </span>
              </div>
            </div>
          </div>

          {/* 구분선 + 샵 정보 */}
          <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#0d9488" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <span className="text-xs font-sans font-semibold text-slate-600">{deal.shopName}</span>
              <span className="text-[9px] font-sans text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{deal.shopRegion}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-sans text-slate-400">
              <span>👁 {deal.viewCount.toLocaleString()}</span>
              <span>♡ {(deal.likeCount + (liked ? 1 : 0)).toLocaleString()}</span>
            </div>
          </div>

          {/* CTA 버튼 */}
          <button
            className={`w-full py-2.5 rounded-xl font-sans font-bold text-sm transition-all duration-200
              ${isExpired
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm active:scale-95'
              }
            `}
            disabled={isExpired}
          >
            {isExpired ? '마감된 딜' : '샵 문의하기'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
