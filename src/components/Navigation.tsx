import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlintLogo from './GlintLogo';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-gold-400' : 'text-zinc-400 hover:text-zinc-100'
    }`;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? 'border-surface-600 bg-surface-950/95 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)]'
          : 'border-transparent bg-surface-950/70 backdrop-blur-sm'
      }`}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center group">
          <GlintLogo
            size={38}
            showText={true}
            className="text-zinc-100 group-hover:text-gold-400 transition-colors duration-200"
          />
        </NavLink>

        {/* Nav Links */}
        <nav className="flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>
            도감
          </NavLink>
          <NavLink to="/mypage" className={linkClass}>
            마이페이지
          </NavLink>
        </nav>
      </div>
    </motion.header>
  );
}
