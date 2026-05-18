import { NavLink } from 'react-router-dom';

export default function Navigation() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-gold-400'
        : 'text-zinc-400 hover:text-zinc-100'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-surface-600 bg-surface-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <span className="text-2xl select-none">🦎</span>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-wide text-zinc-100 group-hover:text-gold-400 transition-colors">
              Glint Archive
            </span>
            <span className="text-[10px] tracking-[0.25em] text-zinc-500 mt-0.5">
              파충류 분양 쇼룸
            </span>
          </div>
        </NavLink>

        {/* Nav Links */}
        <nav className="flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>
            아카이브
          </NavLink>
          <NavLink to="/worldcup" className={linkClass}>
            이상형 월드컵
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
