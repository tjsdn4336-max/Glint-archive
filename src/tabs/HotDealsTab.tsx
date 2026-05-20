import { useState } from 'react';
import { motion } from 'framer-motion';
import DealCard from '../components/DealCard';
import { MOCK_DEALS } from '../data/mockData';
import type { DealStatus, SpeciesId } from '../types';

const STATUS_FILTERS: { id: DealStatus | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'ending', label: '🔥 마감임박' },
  { id: 'live', label: '진행중' },
];

const SPECIES_FILTERS: { id: SpeciesId | 'all'; label: string }[] = [
  { id: 'all', label: '전체 종' },
  { id: 'crestie', label: '크레스티' },
  { id: 'leopard', label: '레오파드' },
  { id: 'beardie', label: '베어디' },
  { id: 'gargoyle', label: '가고일' },
  { id: 'chameleon', label: '카멜레온' },
];

export default function HotDealsTab() {
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesId | 'all'>('all');

  const filtered = MOCK_DEALS.filter((d) => {
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchSpecies = speciesFilter === 'all' || d.species === speciesFilter;
    return matchStatus && matchSpecies;
  });

  // 마감임박 → 진행중 순 정렬
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'ending' && b.status !== 'ending') return -1;
    if (a.status !== 'ending' && b.status === 'ending') return 1;
    return a.endsAt.getTime() - b.endsAt.getTime();
  });

  const endingCount = MOCK_DEALS.filter((d) => d.status === 'ending').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* 섹션 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-sans font-bold text-red-600">LIVE</span>
          </div>
          {endingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1">
              <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20" className="text-orange-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs font-sans font-bold text-orange-600">마감임박 {endingCount}건</span>
            </div>
          )}
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-800">실시간 타임딜</h2>
        <p className="font-sans text-sm text-slate-500 mt-1">전국 파충류 샵의 특가 딜 — 지금 놓치면 사라집니다</p>
      </motion.div>

      {/* 필터 바 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        {/* 상태 필터 */}
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1 border border-slate-100">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-200
                ${statusFilter === f.id ? 'text-white' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              {statusFilter === f.id && (
                <motion.div
                  layoutId="status-pill"
                  className="absolute inset-0 rounded-lg bg-slate-700"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>

        {/* 종 필터 */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {SPECIES_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSpeciesFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold border transition-all duration-200
                ${speciesFilter === f.id
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 딜 그리드 */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((deal, i) => (
            <DealCard key={deal.id} deal={deal} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <span className="text-5xl mb-4 opacity-30">🦎</span>
          <p className="font-sans font-semibold text-slate-500">해당 조건의 딜이 없습니다</p>
          <p className="font-sans text-sm text-slate-400 mt-1">필터를 변경해 보세요</p>
        </motion.div>
      )}

      {/* 하단 안내 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100"
      >
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#0d9488" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-teal-800">새 딜 알림 받기</p>
          <p className="font-sans text-xs text-teal-600 mt-0.5">프리미엄 샵 구독 시 신규 타임딜 실시간 푸시 알림을 받을 수 있습니다</p>
        </div>
        <button className="ml-auto flex-shrink-0 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-sans font-bold hover:bg-teal-700 transition-colors duration-200">
          알림 설정
        </button>
      </motion.div>
    </div>
  );
}
