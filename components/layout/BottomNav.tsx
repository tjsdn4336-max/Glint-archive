'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Zap, MapPin, Heart, User, Sparkles } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const sb = createClient();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    sb.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const myHref = loggedIn ? '/mypage' : '/auth';

  const NAV_ITEMS = [
    { href: '/deals',    label: '타임딜',  Icon: Zap,      center: false },
    { href: '/shops',    label: '샵 투어', Icon: MapPin,   center: false },
    { href: '/analyze',  label: '모프감정',Icon: Sparkles, center: true  },
    { href: '/wishlist', label: '찜',      Icon: Heart,    center: false },
    { href: myHref,      label: '마이',    Icon: User,     center: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-ga-white/95 backdrop-blur-xl border-t border-ga-border">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, label, Icon, center }) => {
          const active = href === myHref
            ? (pathname === '/mypage' || pathname.startsWith('/mypage') || pathname === '/auth')
            : (pathname === href || pathname.startsWith(href + '/'));

          if (center) {
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center justify-center gap-1 min-h-[56px] transition-opacity active:opacity-70">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  active ? 'bg-ga-black' : 'bg-ga-black/90'
                }`}>
                  <Sparkles size={20} strokeWidth={1.8} className="text-white"
                    fill={active ? 'rgba(255,255,255,0.15)' : 'none'} />
                </div>
              </Link>
            );
          }

          return (
            <Link key={label} href={href}
              className="flex flex-col items-center justify-center gap-1 min-h-[56px] transition-opacity active:opacity-60">
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.6}
                className={active ? 'text-ga-black' : 'text-ga-faint'}
                fill={active && href === '/wishlist' ? 'currentColor' : 'none'}
              />
              <span className={`text-[10px] font-semibold ${active ? 'text-ga-black' : 'text-ga-faint'}`}>
                {label}
              </span>
              {active && <span className="w-1 h-1 rounded-full bg-ga-black" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
