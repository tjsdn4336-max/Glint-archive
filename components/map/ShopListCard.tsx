import Link from 'next/link';
import { Store, ChevronRight, Zap } from 'lucide-react';
import type { ShopSearchResult } from '@/app/api/shops/search/route';

interface Props {
  shop: ShopSearchResult;
  index: number;
}

export default function ShopListCard({ shop, index }: Props) {
  return (
    <Link
      href={`/shops/${shop.id}`}
      className="flex items-center gap-4 py-4 border-b border-ga-border last:border-0 hover:bg-ga-bg transition-colors active:bg-[#F0F0EE] cursor-pointer"
    >
      {/* 번호 */}
      <span className="font-serif text-[13px] text-ga-faint w-5 text-center flex-shrink-0">
        {index + 1}
      </span>

      {/* 샵 아이콘 */}
      <div className="w-12 h-12 rounded-xl bg-ga-bg border border-ga-border flex items-center justify-center flex-shrink-0">
        <Store size={20} className="text-ga-faint" strokeWidth={1.5} />
      </div>

      {/* 샵 정보 */}
      <div className="flex-1 min-w-0">
        {/* 샵명 + 인증 */}
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-serif text-[15px] font-bold text-ga-black truncate">
            {shop.name}
          </h3>
          {shop.is_verified && (
            <span className="text-[9px] bg-blue-50 text-ga-blue px-1.5 py-0.5 rounded font-bold tracking-wider flex-shrink-0">
              인증
            </span>
          )}
        </div>

        {/* 지역 */}
        <p className="text-[12px] text-ga-muted mb-1.5">
          {shop.location || shop.address?.split(' ').slice(0, 2).join(' ') || '위치 정보 없음'}
        </p>

        {/* 태그 뱅크 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 영업 상태 */}
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: shop.is_open ? '#1A7F4B' : '#C8C8C4' }}
            />
            <span
              className="text-[11px] font-semibold"
              style={{ color: shop.is_open ? '#1A7F4B' : '#C8C8C4' }}
            >
              {shop.is_open ? '영업중' : '마감'}
            </span>
          </div>

          {/* 오늘 신규 입고 */}
          {shop.today_count > 0 && (
            <>
              <span className="text-ga-faint">·</span>
              <span className="text-[11px] text-ga-red font-bold">
                오늘 {shop.today_count}건 입고
              </span>
            </>
          )}

          {/* 타임딜 진행중 */}
          {shop.has_timedeal && (
            <>
              <span className="text-ga-faint">·</span>
              <span className="text-[11px] text-ga-red font-bold flex items-center gap-0.5">
                <Zap size={10} strokeWidth={2.5} />
                딜 진행중
              </span>
            </>
          )}
        </div>
      </div>

      {/* 화살표 */}
      <ChevronRight size={16} className="text-ga-faint flex-shrink-0" strokeWidth={1.5} />
    </Link>
  );
}
