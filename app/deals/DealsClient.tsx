'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import AnimalCard from '@/components/AnimalCard';
import FilterBar, { type FilterState } from '@/components/search/FilterBar';
import type { Animal } from '@/types';

const INIT_FILTER: FilterState = {
  type: '전체',
  dealOnly: false,
  priceKey: '전체 가격',
  minPrice: '',
  maxPrice: '',
};

function SkeletonCard() {
  return (
    <div className="bg-ga-white rounded-2xl border border-ga-border overflow-hidden animate-pulse">
      <div className="h-44 bg-ga-border" />
      <div className="p-5 space-y-3">
        <div className="h-2.5 bg-ga-border rounded-full w-1/3" />
        <div className="h-4 bg-ga-border rounded-full w-2/3" />
        <div className="h-2.5 bg-ga-border rounded-full w-1/2" />
        <div className="h-6 bg-ga-border rounded-full w-1/3 mt-2" />
      </div>
    </div>
  );
}

async function fetchAnimals(q: string, filter: FilterState): Promise<Animal[]> {
  const params = new URLSearchParams();
  if (q)                      params.set('q', q);
  if (filter.minPrice)        params.set('min_price', filter.minPrice);
  if (filter.maxPrice)        params.set('max_price', filter.maxPrice);
  if (filter.type !== '전체') params.set('type', filter.type);
  if (filter.dealOnly)        params.set('deal_only', 'true');

  const res = await fetch(`/api/animals/search?${params.toString()}`);
  if (!res.ok) return [];
  const { animals } = await res.json();
  return animals ?? [];
}

export default function DealsClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get('q') ?? '';

  const [query, setQuery]     = useState(initialQ);
  const [filter, setFilter]   = useState<FilterState>(INIT_FILTER);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q: string, f: FilterState) => {
    setLoading(true);
    const results = await fetchAnimals(q, f);
    setAnimals(results);
    setLoading(false);
  }, []);

  useEffect(() => { load(initialQ, filter); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback((q: string) => {
    load(q, filter);
  }, [filter, load]);

  const handleFilter = useCallback((f: FilterState) => {
    setFilter(f);
    load(query, f);
  }, [query, load]);

  const resetFilters = () => {
    setQuery('');
    setFilter(INIT_FILTER);
    load('', INIT_FILTER);
  };

  const hasActiveFilter =
    query !== '' ||
    filter.type !== '전체' ||
    filter.dealOnly ||
    filter.priceKey !== '전체 가격';

  return (
    <div className="max-w-screen-lg mx-auto">

      {/* 페이지 헤더 */}
      <div className="px-5 pt-8 pb-6 bg-ga-white border-b border-ga-border md:px-8">
        <p className="text-[10px] text-ga-muted tracking-[0.2em] font-semibold mb-2 uppercase">Time Deal</p>
        <h1 className="font-serif text-3xl font-bold text-ga-black mb-1">타임딜</h1>
        <p className="text-sm text-ga-muted">지금 이 순간, 파격가 분양 중</p>
      </div>

      <div className="px-5 py-5 space-y-3 md:px-8">
        {/* 검색 */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ga-faint pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
            placeholder="모프명, 종 이름으로 검색"
            className="ga-input pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); handleSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-ga-border text-ga-muted hover:bg-ga-muted hover:text-ga-white transition-colors text-xs"
              aria-label="검색어 지우기"
            >
              ×
            </button>
          )}
        </div>

        {/* 필터바 */}
        <FilterBar filter={filter} onChange={handleFilter} />

        {/* 결과 수 */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-ga-muted tracking-wide">
            {loading ? '검색 중…' : `${animals.length}개의 개체`}
          </span>
          {hasActiveFilter && !loading && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-ga-muted underline underline-offset-2 hover:text-ga-black transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* 그리드 */}
      <div className="px-5 pb-10 md:px-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : animals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {animals.map(animal => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-serif text-lg text-ga-faint mb-1">
              {hasActiveFilter ? '검색 결과가 없습니다' : '등록된 개체가 없습니다'}
            </p>
            <p className="text-sm text-ga-faint mt-1 mb-6">
              {hasActiveFilter ? '조건을 바꿔보세요' : '곧 분양 개체가 등록될 예정이에요'}
            </p>
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="px-5 py-3 bg-ga-black text-ga-white text-sm font-bold rounded-lg hover:opacity-80 transition-opacity"
              >
                필터 초기화
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
