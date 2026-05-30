'use client';

import { useState, useEffect } from 'react';

interface CountdownResult {
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
  isUrgent: boolean;   // < 3시간
  isCritical: boolean; // < 1시간
  totalSeconds: number;
}

const ZERO: CountdownResult = {
  hours: '00', minutes: '00', seconds: '00',
  isExpired: false, isUrgent: false, isCritical: false, totalSeconds: 0,
};

export function useCountdown(endsAt: string | null): CountdownResult {
  const [mounted, setMounted]     = useState(false);
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    if (!endsAt) return;

    const tick = () => {
      setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  // SSR / before mount — return stable zero to avoid hydration mismatch
  if (!mounted) return ZERO;

  const totalSeconds = Math.floor(remaining / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return {
    hours:      String(h).padStart(2, '0'),
    minutes:    String(m).padStart(2, '0'),
    seconds:    String(s).padStart(2, '0'),
    isExpired:  remaining === 0,
    isUrgent:   remaining > 0 && remaining < 3 * 3600 * 1000,
    isCritical: remaining > 0 && remaining < 3600 * 1000,
    totalSeconds,
  };
}
