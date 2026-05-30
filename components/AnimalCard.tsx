'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { useFavorite } from '@/hooks/useFavorite';
import type { Animal } from '@/types';

interface Props {
  animal: Animal;
  compact?: boolean;
}

const GENDER_LABEL: Record<string, string> = {
  male: '♂ 수컷', female: '♀ 암컷', unknown: '미확인',
};

function CountdownBadge({ endsAt }: { endsAt: string }) {
  const { hours, minutes, seconds, isExpired, isCritical } = useCountdown(endsAt);
  if (isExpired) return <span className="font-mono text-xs font-bold text-ga-muted">마감됨</span>;
  return (
    <span className={`font-mono text-sm font-bold tabular-nums ${isCritical ? 'text-ga-red' : 'text-ga-black'}`}>
      {hours}:{minutes}:{seconds}
    </span>
  );
}

function FavoriteButton({ animalId }: { animalId: string }) {
  const { isSaved, toggle, loading } = useFavorite(animalId);
  const [burst, setBurst]            = useState(false);
  const [toast, setToast]            = useState(false);
  const timerRef                     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    const result = await toggle();
    if (result?.needLogin) {
      setToast(true);
      timerRef.current = setTimeout(() => setToast(false), 2500);
    } else {
      setBurst(true);
      setTimeout(() => setBurst(false), 200);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`absolute bottom-3 right-3 w-8 h-8 rounded-full bg-ga-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform active:scale-90 ${burst ? 'scale-125' : 'scale-100'}`}
        style={{ transition: 'transform 0.15s ease' }}
        aria-label="찜하기"
      >
        <Heart
          size={15}
          className={isSaved ? 'text-ga-red' : 'text-ga-faint'}
          fill={isSaved ? 'currentColor' : 'none'}
          strokeWidth={1.8}
        />
      </button>
      {toast && (
        <div className="absolute bottom-12 right-2 z-20 bg-ga-black text-white text-xs font-semibold px-4 py-2 rounded-xl whitespace-nowrap pointer-events-none">
          로그인이 필요합니다
        </div>
      )}
    </>
  );
}

export default function AnimalCard({ animal, compact = false }: Props) {
  const discountRate = animal.original_price
    ? Math.round((1 - animal.price / animal.original_price) * 100)
    : 0;
  const isNew = Date.now() - new Date(animal.created_at).getTime() < 86400000;

  return (
    <article className="group bg-ga-white rounded-2xl border border-ga-border overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">

      {/* 타임딜 강조 바 */}
      {animal.is_timedeal && (
        <div className="h-0.5 bg-ga-black w-full" />
      )}

      {/* 이미지 영역 */}
      <div
        className={`relative overflow-hidden ${compact ? 'h-32' : 'h-44 sm:h-48'}`}
        style={{ background: 'linear-gradient(150deg, #EEECEA 0%, #E2E0DC 50%, #D8D6D2 100%)' }}
      >
        {/* 모프명 플레이스홀더 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-1.5">
          <span className="font-serif text-ga-faint/50 text-[11px] tracking-[0.2em] uppercase">
            {animal.gender === 'male' ? '♂' : animal.gender === 'female' ? '♀' : ''}
          </span>
          <span className="font-serif text-ga-muted text-[13px] tracking-wide px-4 text-center leading-snug">
            {animal.morph}
          </span>
        </div>

        {/* 좌상단 태그 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {animal.is_timedeal && (
            <span className="ga-badge ga-badge-black text-[9px] tracking-wider">⚡ 타임딜</span>
          )}
          {isNew && !animal.is_timedeal && (
            <span className="ga-badge ga-badge-green">오늘 입고</span>
          )}
        </div>

        {/* 우상단 할인율 */}
        {discountRate > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="ga-badge ga-badge-red">-{discountRate}%</span>
          </div>
        )}

        {/* 우하단 찜 버튼 */}
        <FavoriteButton animalId={animal.id} />
      </div>

      {/* 텍스트 영역 */}
      <div className="p-5">
        {/* 메타 정보 */}
        <p className="text-[10px] text-ga-muted tracking-wider font-semibold mb-1.5 uppercase truncate">
          {GENDER_LABEL[animal.gender] ?? ''}
          {animal.shop?.name && ` · ${animal.shop.name}`}
          {animal.shop?.is_verified && (
            <span className="ml-1 inline-flex items-center">
              <svg className="w-2.5 h-2.5 text-ga-blue inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </p>

        {/* 개체명 */}
        <h3 className="font-serif text-[17px] font-bold text-ga-black leading-snug mb-4">
          {animal.name}
        </h3>

        {/* 가격 + 카운트다운 */}
        <div className="flex items-end justify-between gap-2">
          <div>
            {animal.original_price && (
              <p className="text-[11px] text-ga-faint line-through mb-0.5 tabular-nums">
                {animal.original_price.toLocaleString()}원
              </p>
            )}
            <p className={`font-serif text-[22px] font-bold leading-none ${animal.is_timedeal ? 'text-ga-red' : 'text-ga-black'}`}>
              {animal.price.toLocaleString()}
              <span className="text-sm font-sans font-medium text-ga-muted ml-0.5">원</span>
            </p>
          </div>

          {animal.is_timedeal && animal.deal_ends_at && (
            <CountdownBadge endsAt={animal.deal_ends_at} />
          )}
        </div>

        {/* CTA */}
        {!compact && (
          <Link
            href={`/shops/${animal.shop_id}`}
            className="mt-4 block w-full py-3 rounded-lg bg-ga-black text-ga-white text-sm font-bold text-center hover:opacity-80 transition-opacity tracking-wide"
          >
            예약하기
          </Link>
        )}
      </div>
    </article>
  );
}
