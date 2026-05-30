'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, Search } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  name_korean: string;
  name_english: string;
}

interface Species {
  id: string;
  slug: string;
  name_korean: string;
  name_english: string;
  name_scientific: string;
  difficulty: string;
  beginner_friendly: boolean;
  image_url: string;
  description: string;
  lifespan: string;
  adult_size: string;
  aliases: string[];
  morph_count?: number;
}

const DIFF_COLOR: Record<string, string> = {
  '입문': 'text-[#1A7F4B]',
  '중급': 'text-[#1A56DB]',
  '고급': 'text-[#D94035]',
};

export default function CategoryPage() {
  const params  = useParams();
  const router  = useRouter();
  const catSlug = decodeURIComponent(params?.category as string);

  const [category, setCategory] = useState<Category | null>(null);
  const [species,  setSpecies]  = useState<Species[]>([]);
  const [filtered, setFiltered] = useState<Species[]>([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [missing,  setMissing]  = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!catSlug) return;
    const fetchData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: cat } = await (supabase as any)
        .from('categories')
        .select('id, slug, name_korean, name_english')
        .eq('slug', catSlug)
        .maybeSingle() as { data: Category | null };

      if (!cat) { setMissing(true); setLoading(false); return; }
      setCategory(cat);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: sp } = await (supabase as any)
        .from('species')
        .select('id, slug, name_korean, name_english, name_scientific, difficulty, beginner_friendly, image_url, description, lifespan, adult_size, aliases')
        .eq('category_id', cat.id)
        .order('sort_order') as { data: Species[] | null };

      const list = sp || [];

      // 모프 수 일괄 조회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: morphRows } = await (supabase as any)
        .from('morphs')
        .select('species_id') as { data: { species_id: string }[] | null };

      const countMap: Record<string, number> = {};
      (morphRows || []).forEach((m: { species_id: string }) => {
        countMap[m.species_id] = (countMap[m.species_id] ?? 0) + 1;
      });

      const enriched = list.map(s => ({ ...s, morph_count: countMap[s.id] ?? 0 }));
      setSpecies(enriched);
      setFiltered(enriched);
      setLoading(false);
    };
    fetchData();
  }, [catSlug]);

  // 검색 — 한국어명, 영어명, 학명, aliases
  useEffect(() => {
    if (!search.trim()) { setFiltered(species); return; }
    const q = search.toLowerCase();
    setFiltered(species.filter(s =>
      s.name_korean.includes(search) ||
      s.name_english.toLowerCase().includes(q) ||
      s.name_scientific.toLowerCase().includes(q) ||
      (s.aliases ?? []).some(a => a.toLowerCase().includes(q))
    ));
  }, [search, species]);

  useEffect(() => {
    if (!loading && missing) router.replace('/encyclopedia');
  }, [loading, missing, router]);

  if (!loading && !category && !missing) return null;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">

      {/* 상단 네비 바 — sticky */}
      <div className="bg-white border-b border-[#E8E8E4] px-4 h-12 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="w-7 h-7 rounded-full bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#111]" />
        </button>
        <span className="font-serif text-sm font-bold text-[#111] truncate">
          {category?.name_korean ?? '파충류 사전'}
        </span>
        {!loading && (
          <span className="ml-auto text-[10px] text-[#9A9A94] flex-shrink-0">
            {filtered.length}종
          </span>
        )}
      </div>

      {/* 카테고리 헤더 */}
      <div className="bg-white border-b border-[#E8E8E4] px-4 pt-5 pb-4">
        <p className="text-[9px] text-[#9A9A94] tracking-widest font-semibold mb-1 uppercase">
          {category?.name_english}
        </p>
        <h1 className="font-serif text-2xl font-bold text-[#111]">
          {category?.name_korean}
        </h1>
      </div>

      {/* 검색바 — sticky */}
      <div className="px-4 py-2.5 bg-[#F7F7F5] sticky top-12 z-10 border-b border-[#E8E8E4]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8C8C4]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="종 이름, 별칭 검색"
            className="w-full bg-white border border-[#E8E8E4] rounded-lg pl-9 pr-4 py-2 text-sm text-[#111] placeholder:text-[#C8C8C4] focus:outline-none focus:ring-1 focus:ring-[#111]"
          />
        </div>
      </div>

      {/* 종 목록 */}
      <div className="px-4 pb-24 pt-3">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#E8E8E4] animate-pulse">
                <div className="aspect-[5/4] bg-[#E8E8E4]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#E8E8E4] rounded w-3/4" />
                  <div className="h-2.5 bg-[#F0F0EE] rounded w-full" />
                  <div className="h-2.5 bg-[#F0F0EE] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif text-base text-[#C8C8C4] mb-1">
              {species.length === 0 ? '아직 등록된 종이 없습니다' : '검색 결과가 없습니다'}
            </p>
            <p className="text-sm text-[#C8C8C4]">다른 검색어를 시도해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(s => (
              <Link
                key={s.id}
                href={`/encyclopedia/${catSlug}/${s.slug}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden hover:border-[#9A9A94] hover:shadow-sm transition-all active:scale-[0.98]">

                  {/* 이미지 영역 — 5:4 비율 */}
                  <div className="relative w-full aspect-[5/4] overflow-hidden bg-gradient-to-br from-[#F0F0EE] to-[#E4E4E0]">
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt={s.name_korean}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.parentElement?.querySelector('[data-fallback]');
                          if (fb) (fb as HTMLElement).hidden = false;
                        }}
                      />
                    ) : null}

                    {/* 폴백 — 이미지 없거나 로드 실패 시에만 표시 (영어명 제거, 한국명만) */}
                    <div
                      data-fallback
                      hidden={!!s.image_url}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="font-serif text-sm text-[#9A9A94] text-center px-3 leading-snug">
                        {s.name_korean}
                      </span>
                    </div>

                    {/* 하단 그라디언트 오버레이 — 더 진하게 */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                    {/* 좌상단 난이도 배지 */}
                    <div className="absolute top-2 left-2">
                      <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-white/95 backdrop-blur ${DIFF_COLOR[s.difficulty] ?? 'text-[#9A9A94]'}`}>
                        {s.difficulty}
                      </span>
                    </div>

                    {/* 우상단 입문 추천 배지 */}
                    {s.beginner_friendly && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-[#1A7F4B]/90 backdrop-blur text-white">
                          입문 추천
                        </span>
                      </div>
                    )}

                    {/* 하단 오버레이 — 한국명 + 학명, 가독성 강화 */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3
                        className="font-serif text-[15px] font-bold text-white leading-tight mb-0.5"
                        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}
                      >
                        {s.name_korean}
                      </h3>
                      <p
                        className="text-[9px] text-white/80 italic tracking-wide leading-none"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                      >
                        {s.name_scientific}
                      </p>
                    </div>
                  </div>

                  {/* 정보 영역 */}
                  <div className="p-3">
                    {/* 한 줄 설명 */}
                    <p className="text-[11px] text-[#9A9A94] leading-relaxed line-clamp-2 mb-2.5 min-h-[30px]">
                      {s.description ? `${s.description.split('.')[0]}.` : '정보를 준비 중입니다'}
                    </p>

                    {/* 수명 · 크기 메타 그리드 */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                      <div>
                        <p className="text-[8px] text-[#C8C8C4] tracking-widest uppercase mb-0.5">수명</p>
                        <p className="text-[11px] text-[#111] font-medium leading-tight">{s.lifespan || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-[#C8C8C4] tracking-widest uppercase mb-0.5">크기</p>
                        <p className="text-[11px] text-[#111] font-medium leading-tight">{s.adult_size || '—'}</p>
                      </div>
                    </div>

                    {/* 하단 모프 수 + 화살표 */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F0F0EE]">
                      <span className="text-[10px] text-[#9A9A94]">
                        {(s.morph_count ?? 0) > 0 ? `모프 ${s.morph_count}종` : '야생형 위주'}
                      </span>
                      <span className="text-[11px] text-[#C8C8C4] group-hover:text-[#111] transition-colors">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
