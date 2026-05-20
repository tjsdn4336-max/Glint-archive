import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SHOPS } from '../data/mockData';
import type { Region, ShopStatus, SpeciesId, Shop } from '../types';

const ALL_REGIONS: (Region | 'all')[] = ['all', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '강원', '충청', '전라', '경상', '제주'];

const STATUS_LABELS: Record<ShopStatus, { label: string; color: string; dot: string }> = {
  open:   { label: '영업중', color: 'text-emerald-600', dot: 'bg-emerald-400' },
  busy:   { label: '혼잡', color: 'text-amber-600', dot: 'bg-amber-400' },
  closed: { label: '마감', color: 'text-slate-400', dot: 'bg-slate-300' },
};

const SPECIES_LABELS: Record<SpeciesId, string> = {
  crestie:    '크레스티',
  leopard:    '레오파드',
  beardie:    '베어디',
  gargoyle:   '가고일',
  chameleon:  '카멜레온',
  bluetongue: '블루텅',
  other:      '기타',
};

function ShopCard({ shop, index }: { shop: Shop; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { label, color, dot } = STATUS_LABELS[shop.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`relative group rounded-2xl bg-white border transition-all duration-300
        ${shop.status === 'closed' ? 'border-slate-200 opacity-70' : 'border-slate-200/80 hover:border-teal-200 hover:shadow-card-lg'}
        shadow-card
      `}
    >
      {/* 프리미엄 좌측 라인 */}
      {shop.plan === 'premium' && (
        <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300" />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* 썸네일 */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
            {shop.thumbnailUrl ? (
              <img src={shop.thumbnailUrl} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🦎</div>
            )}
          </div>

          {/* 샵 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-display text-base font-bold text-slate-800 truncate">{shop.name}</h3>
              {shop.plan === 'premium' && (
                <span
                  className="flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-md text-amber-800"
                  style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
                >
                  PREMIUM
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* 영업 상태 */}
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} ${shop.status === 'open' ? 'animate-pulse' : ''}`} />
                <span className={`text-xs font-sans font-semibold ${color}`}>{label}</span>
              </div>
              <span className="text-slate-200 text-xs">|</span>
              <span className="text-xs font-sans text-slate-400">{shop.region}</span>
              <span className="text-slate-200 text-xs">|</span>
              <div className="flex items-center gap-0.5">
                <svg width="10" height="10" fill="#fbbf24" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-xs font-sans font-semibold text-slate-700">{shop.rating}</span>
                <span className="text-xs font-sans text-slate-400">({shop.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* 딜 수 배지 */}
          {shop.dealCount > 0 && (
            <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <span className="text-sm font-bold text-red-500">{shop.dealCount}</span>
              </div>
              <span className="text-[8px] font-sans text-red-400 font-semibold">딜</span>
            </div>
          )}
        </div>

        {/* 신규 모프 알림 */}
        {shop.newMorphAlert && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-xl border border-teal-100">
            <span className="text-xs">🆕</span>
            <p className="text-xs font-sans font-semibold text-teal-700">{shop.newMorphAlert}</p>
          </div>
        )}

        {/* 취급 종 태그 */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {shop.specialties.map((s) => (
            <span key={s} className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
              {SPECIES_LABELS[s]}
            </span>
          ))}
        </div>

        {/* 확장 토글 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-sans font-semibold text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 border border-dashed border-slate-200 hover:border-teal-200"
        >
          {expanded ? '접기' : '상세 보기'}
          <svg
            width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        {/* 확장 콘텐츠 */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-dashed border-slate-200 mt-3 space-y-2.5">
                <p className="text-xs font-sans text-slate-600">{shop.description}</p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[9px] font-sans text-slate-400 uppercase tracking-wider mb-0.5">영업 시간</p>
                    <p className="text-xs font-sans font-semibold text-slate-700">{shop.openTime} – {shop.closeTime}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[9px] font-sans text-slate-400 uppercase tracking-wider mb-0.5">휴무</p>
                    <p className="text-xs font-sans font-semibold text-slate-700">{shop.closedDays}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[9px] font-sans text-slate-400 uppercase tracking-wider mb-0.5">팔로워</p>
                    <p className="text-xs font-sans font-semibold text-slate-700">{shop.followerCount.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[9px] font-sans text-slate-400 uppercase tracking-wider mb-0.5">전화</p>
                    <p className="text-xs font-sans font-semibold text-slate-700">{shop.phone}</p>
                  </div>
                </div>

                {shop.address && (
                  <div className="flex items-start gap-2">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2} className="flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <p className="text-[11px] font-sans text-slate-500">{shop.address}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-sans font-bold transition-colors duration-200">
                    샵 문의
                  </button>
                  {shop.instagram && (
                    <button className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-sans font-semibold transition-colors duration-200">
                      @{shop.instagram}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ShopMapTab() {
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ShopStatus | 'all'>('all');

  const filtered = MOCK_SHOPS.filter((s) => {
    const matchRegion = selectedRegion === 'all' || s.region === selectedRegion;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchRegion && matchStatus;
  });

  // 프리미엄 → 영업중 우선 정렬
  const sorted = [...filtered].sort((a, b) => {
    if (a.plan === 'premium' && b.plan !== 'premium') return -1;
    if (a.plan !== 'premium' && b.plan === 'premium') return 1;
    const statusOrder: Record<ShopStatus, number> = { open: 0, busy: 1, closed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const regionCounts = ALL_REGIONS.reduce((acc, r) => {
    acc[r] = r === 'all'
      ? MOCK_SHOPS.length
      : MOCK_SHOPS.filter((s) => s.region === r).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-sans font-bold text-emerald-600">
              {MOCK_SHOPS.filter((s) => s.status === 'open' || s.status === 'busy').length}개 샵 영업 중
            </span>
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-800">전국 파충류 샵 맵</h2>
        <p className="font-sans text-sm text-slate-500 mt-1">실시간 영업 현황 · 신규 모프 입고 알림 · 위치 안내</p>
      </motion.div>

      {/* 지역 필터 스크롤 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mb-4 -mx-1"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
          {ALL_REGIONS.filter(r => regionCounts[r] > 0).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-sans font-semibold transition-all duration-200
                ${selectedRegion === r
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }
              `}
            >
              <span>{r === 'all' ? '전체' : r}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md
                ${selectedRegion === r ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                {regionCounts[r]}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 상태 필터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 mb-6"
      >
        {(['all', 'open', 'busy', 'closed'] as const).map((s) => {
          const map = { all: '전체', open: '영업중', busy: '혼잡', closed: '마감' };
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold border transition-all duration-200
                ${statusFilter === s
                  ? s === 'open' ? 'bg-emerald-500 text-white border-emerald-500'
                    : s === 'busy' ? 'bg-amber-500 text-white border-amber-500'
                    : s === 'closed' ? 'bg-slate-400 text-white border-slate-400'
                    : 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }
              `}
            >
              {map[s]}
            </button>
          );
        })}
        <span className="ml-auto text-xs font-sans text-slate-400">{sorted.length}개 샵</span>
      </motion.div>

      {/* 샵 그리드 */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((shop, i) => (
            <ShopCard key={shop.id} shop={shop} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4 opacity-30">🗺️</span>
          <p className="font-sans font-semibold text-slate-500">해당 조건의 샵이 없습니다</p>
          <p className="font-sans text-sm text-slate-400 mt-1">지역 또는 상태 필터를 변경해 보세요</p>
        </div>
      )}

      {/* 하단 CTA — 샵 입점 유도 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" fill="white">
            <circle cx="80" cy="20" r="60" fill="currentColor" />
          </svg>
        </div>
        <p className="font-display text-lg font-bold text-white mb-1">내 샵을 GLINT에 등록하세요</p>
        <p className="font-sans text-sm text-teal-100 mb-4">전국 파충류 유저들에게 내 매장을 알리고 타임딜로 재고를 현금으로 전환하세요</p>
        <button className="px-5 py-2.5 rounded-xl bg-white text-teal-700 text-sm font-sans font-bold hover:bg-teal-50 transition-colors duration-200 shadow-sm">
          사장님 탭에서 시작하기 →
        </button>
      </motion.div>
    </div>
  );
}
