'use client';

import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export default function SearchBar({ value, onChange, onSearch }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="모프명, 종 이름으로 검색"
        className="w-full bg-ga-white border border-ga-border rounded-2xl px-5 py-3.5 pr-12 text-sm text-ga-black placeholder:text-ga-faint focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
      />
      {/* 검색 아이콘 */}
      <svg
        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ga-faint pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      {/* 지우기 버튼 */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-ga-border text-ga-muted hover:bg-ga-muted transition-colors text-xs"
          aria-label="검색어 지우기"
        >
          ×
        </button>
      )}
    </div>
  );
}
