import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HotDealsTab from '../tabs/HotDealsTab';
import ShopMapTab from '../tabs/ShopMapTab';
import AdminTab from '../tabs/AdminTab';
import GlintLogo from '../components/GlintLogo';

type TabId = 'deals' | 'map' | 'admin';

const MARKET_STATS = [
  { label: '2022 시장 규모', value: '8.5조', suffix: '원', sub: '파충류 시장' },
  { label: '2032 예상 규모', value: '21.0조', suffix: '원', sub: '10년 후 전망' },
  { label: '연 성장률', value: '15%', suffix: '', sub: 'CAGR 2022–2032' },
  { label: '전국 파트너 샵', value: '150+', suffix: '', sub: '베타 목표' },
];

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('deals');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* ─── 고정 헤더 ──────────────────────────────────────────────────────── */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/96 backdrop-blur-lg border-b border-slate-100/80 shadow-sm'
            : 'bg-white border-b border-slate-100'
        }`}
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 flex-shrink-0">
            <GlintLogo size={32} className="text-teal-700" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-bold text-slate-800 tracking-tight">GLINT</span>
              <span className="font-sans text-[8px] tracking-[0.4em] text-teal-600 uppercase mt-0.5">Archive</span>
            </div>
          </div>
          <p className="hidden md:block font-sans text-xs text-slate-400 tracking-wide">
            사장님의 재고를 현금으로 · 유저의 발걸음을 매장으로
          </p>
        </div>
      </motion.header>

      {/* pt-16 = 고정 헤더 높이 보정 */}
      <div className="pt-16">

      {/* ─── 히어로 섹션 ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100">
        {/* 배경 도트 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #0d9488 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* 우측 글로우 */}
        <div
          className="absolute -right-32 top-0 bottom-0 w-96 opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse at right, #0d9488, transparent)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 좌측 — 카피 */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-xs font-sans font-bold text-teal-700 tracking-wide">파충류 B2B2C 플랫폼 — 수도권 베타 운영 중</span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
                  사장님의 재고를 현금으로,<br />
                  <span className="text-teal-600">유저의 발걸음을 매장으로</span>
                </h1>

                <p className="font-sans text-base text-slate-500 leading-relaxed mb-8 max-w-lg">
                  전국 파충류 샵의 실시간 타임딜 플랫폼.
                  악성 재고는 현금화하고, 유저는 최고의 딜을 발견합니다.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('deals')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-sans font-bold text-sm transition-all duration-200 shadow-teal active:scale-95"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    핫딜 보기
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-sans font-bold text-sm border border-slate-200 hover:border-slate-300 transition-all duration-200"
                  >
                    사장님 시작하기 →
                  </button>
                </div>
              </motion.div>
            </div>

            {/* 우측 — 시장 통계 카드 그리드 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-4"
            >
              {MARKET_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className={`rounded-2xl p-5 border
                    ${i === 0 ? 'bg-teal-600 border-teal-700'
                      : i === 1 ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-slate-200 shadow-card'
                    }
                  `}
                >
                  <p className={`text-[10px] font-sans tracking-widest uppercase mb-2
                    ${i < 2 ? 'text-white/60' : 'text-slate-400'}
                  `}>
                    {stat.label}
                  </p>
                  <p className={`font-display text-2xl font-black leading-none
                    ${i < 2 ? 'text-white' : 'text-slate-800'}
                  `}>
                    {stat.value}
                    <span className={`text-sm font-sans font-semibold ml-0.5 ${i < 2 ? 'text-white/70' : 'text-slate-400'}`}>
                      {stat.suffix}
                    </span>
                  </p>
                  <p className={`text-xs font-sans mt-1 ${i < 2 ? 'text-white/50' : 'text-slate-400'}`}>
                    {stat.sub}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* 하단 가치 제안 배너 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              {
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                ),
                title: '실시간 타임딜',
                desc: '마감 임박 재고를 타임딜로 즉시 현금화',
                color: 'text-red-500 bg-red-50',
                tab: 'deals' as TabId,
              },
              {
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                ),
                title: '전국 샵 투어 맵',
                desc: '실시간 영업 상태 + 신규 모프 입고 알림',
                color: 'text-teal-600 bg-teal-50',
                tab: 'map' as TabId,
              },
              {
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                ),
                title: '사장님 어드민',
                desc: '모프별 시세 분석 + 타겟 마케팅 솔루션',
                color: 'text-amber-600 bg-amber-50',
                tab: 'admin' as TabId,
              },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => setActiveTab(item.tab)}
                className="flex items-start gap-3 bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-card text-left transition-all duration-200"
              >
                <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-sans text-sm font-bold text-slate-800">{item.title}</p>
                  <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 스티키 탭 바 ───────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-0">
            {([
              { id: 'deals', label: '⚡ 핫딜', sub: '실시간 타임딜' },
              { id: 'map',   label: '🗺️ 샵 맵', sub: '전국 파충류 샵' },
              { id: 'admin', label: '🏢 사장님', sub: '비즈니스 어드민' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-start px-5 py-3.5 border-b-2 transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                  }
                `}
              >
                <span className="font-sans font-bold text-sm">{tab.label}</span>
                <span className="font-sans text-[10px] opacity-70 hidden sm:block">{tab.sub}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-teal-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 탭 패널 ────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'deals' && <HotDealsTab />}
          {activeTab === 'map'   && <ShopMapTab />}
          {activeTab === 'admin' && <AdminTab />}
        </motion.div>
      </AnimatePresence>

      {/* ─── 푸터 ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-slate-700">GLINT Archive</span>
            <span className="text-slate-300">·</span>
            <span className="font-sans text-xs text-slate-400">파충류 디지털 비즈니스 플랫폼</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-sans text-slate-400">
            <span>info@glintarchive.co.kr</span>
            <span className="text-slate-200">|</span>
            <span>www.glintarchive.co.kr</span>
          </div>
        </div>
      </footer>
      </div> {/* /pt-16 */}
    </div>
  );
}
