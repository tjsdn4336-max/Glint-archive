import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlintLogo from './GlintLogo';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm'
          : 'bg-white border-b border-slate-100'
      }`}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        {/* 브랜드 로고 */}
        <div className="flex items-center gap-3">
          <GlintLogo size={34} className="text-teal-700" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-slate-800 tracking-tight">
              GLINT
            </span>
            <span className="font-sans text-[9px] tracking-[0.35em] text-slate-400 uppercase mt-0.5">
              Archive
            </span>
          </div>
        </div>

        {/* 우측 태그라인 */}
        <p className="hidden sm:block font-sans text-xs text-slate-400 tracking-wide">
          파충류 디지털 보증서 플랫폼
        </p>
      </div>
    </motion.header>
  );
}
