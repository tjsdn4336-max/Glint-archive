'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { ShopSearchResult } from '@/app/api/shops/search/route';

interface Props {
  shop: ShopSearchResult;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export default function MapShopCard({ shop, isSelected, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(shop.id)}
      className={`w-full text-left rounded-2xl border p-4 transition-all duration-150 ${
        isSelected
          ? 'bg-ga-black border-ga-black'
          : 'bg-ga-white border-ga-border hover:border-ga-muted hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className={`text-[13px] font-bold leading-snug ${isSelected ? 'text-ga-white' : 'text-ga-black'}`}>
          {shop.name}
        </p>
        {shop.is_verified && (
          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded ${
            isSelected ? 'bg-white/10 text-white/60' : 'bg-ga-bg text-ga-muted border border-ga-border'
          }`}>
            인증
          </span>
        )}
      </div>

      <div className={`flex items-start gap-1 text-[11px] leading-relaxed ${
        isSelected ? 'text-white/50' : 'text-ga-muted'
      }`}>
        <MapPin size={11} className="flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <span className="line-clamp-1">{shop.address || '주소 정보 없음'}</span>
      </div>

      {shop.phone && (
        <p className={`text-[11px] mt-1 ${isSelected ? 'text-white/40' : 'text-ga-faint'}`}>
          {shop.phone}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        {isSelected ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-ga-white animate-pulse" />
            <span className="text-[10px] font-medium text-white/50">지도에서 보는 중</span>
          </div>
        ) : <div />}
        <Link
          href={`/shops/${shop.id}`}
          onClick={e => e.stopPropagation()}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
            isSelected
              ? 'text-white/70 bg-white/10 hover:bg-white/20'
              : 'text-ga-black bg-ga-bg border border-ga-border hover:border-ga-muted'
          }`}
        >
          상세보기 →
        </Link>
      </div>
    </button>
  );
}
