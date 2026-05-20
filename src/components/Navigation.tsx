import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlintLogo from './GlintLogo';

interface Props {
  activeTab: 'deals' | 'map' | 'admin';
  onTabChange: (tab: 'deals' | 'map' | 'admin') => void;
}

const TABS = [
  {
    id: 'deals' as const,
    label: '핫딜',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
  {
    id: 'map' as const,
    label: '샵 맵',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
    ),
  },
  {
    id: 'admin' as const,
    label: '사장님',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    ),
  },
];

export default function Navigation({ activeTab, onTabChange }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
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
        {/* 브랜드 로고 */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <GlintLogo size={32} className="text-teal-700" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold text-slate-800 tracking-tight">
              GLINT
            </span>
            <span className="font-sans text-[8px] tracking-[0.4em] text-teal-600 uppercase mt-0.5">
              Archive
            </span>
          </div>
        </div>

        {/* 중앙 탭 네비게이션 */}
        <nav className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-sans font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-teal-600 shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* 우측 태그라인 */}
        <p className="hidden md:block font-sans text-xs text-slate-400 tracking-wide flex-shrink-0">
          사장님의 재고를 현금으로
        </p>
      </div>
    </motion.header>
  );
}
