'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';
import type { Shop } from '@/types';

interface Props { shop: Shop }

export default function ShopCard({ shop }: Props) {
  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group flex items-center gap-4 bg-ga-white rounded-2xl border border-ga-border p-5 hover:border-ga-muted transition-colors duration-150"
    >
      {/* 아이콘 */}
      <div className="w-11 h-11 rounded-xl bg-ga-bg flex items-center justify-center flex-shrink-0">
        <Store size={20} className="text-ga-muted" strokeWidth={1.6} />
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-serif text-[15px] font-bold text-ga-black truncate">{shop.name}</h3>
          {shop.is_verified && (
            <svg className="w-3.5 h-3.5 text-ga-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {shop.plan === 'pro' && (
            <span className="ga-badge ga-badge-black text-[9px]">PRO</span>
          )}
        </div>
        <p className="text-xs text-ga-muted truncate">{shop.location}</p>
      </div>

      {/* 상태 */}
      <div className="text-right flex-shrink-0">
        {shop.is_open !== undefined && (
          <div className="flex items-center gap-1.5 justify-end mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${shop.is_open ? 'bg-ga-green' : 'bg-ga-faint'}`} />
            <span className={`text-[11px] font-semibold ${shop.is_open ? 'text-ga-green' : 'text-ga-faint'}`}>
              {shop.is_open ? '영업중' : '마감'}
            </span>
          </div>
        )}
        {shop.new_today !== undefined && shop.new_today > 0 && (
          <p className="text-[10px] text-ga-red font-bold">신규 {shop.new_today}건</p>
        )}
      </div>
    </Link>
  );
}
