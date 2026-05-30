'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

interface Category {
  id: string;
  slug: string;
  name_korean: string;
  name_english: string;
  description: string;
  sort_order: number;
  species_count?: number;
}

export default function EncyclopediaPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: cats } = await (supabase as any)
        .from('categories')
        .select('*')
        .order('sort_order') as { data: Category[] | null };

      if (!cats) { setLoading(false); return; }

      // Count species per category
      const withCounts = await Promise.all(
        cats.map(async (cat) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { count } = await (supabase as any)
            .from('species')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id);
          return { ...cat, species_count: count ?? 0 };
        })
      );

      setCategories(withCounts);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#E8E8E4] px-5 pt-8 pb-6">
        <p className="text-[10px] text-[#9A9A94] tracking-widest font-semibold mb-2 uppercase">
          Encyclopedia
        </p>
        <h1 className="font-serif text-3xl font-bold text-[#111] mb-1">
          파충류 사전
        </h1>
        <p className="text-sm text-[#9A9A94]">
          카테고리를 선택하세요
        </p>
      </div>

      {/* 카테고리 목록 */}
      <div className="px-5 py-5 pb-24 flex flex-col gap-4 md:grid md:grid-cols-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#E8E8E4] rounded-2xl h-32 animate-pulse" />
            ))
          : categories.map((cat) => (
              <Link key={cat.id} href={`/encyclopedia/${cat.slug}`}>
                <div className="bg-white rounded-2xl border border-[#E8E8E4] p-6 hover:border-[#9A9A94] transition-colors cursor-pointer relative">
                  {/* 종 개수 뱃지 */}
                  <span className="absolute top-4 right-4 text-[10px] text-[#C8C8C4] font-medium">
                    {cat.species_count ?? 0}종
                  </span>

                  <h2 className="font-serif text-xl font-bold text-[#111] mb-0.5">
                    {cat.name_korean}
                  </h2>
                  <p className="text-[11px] text-[#C8C8C4] tracking-wider uppercase mb-3">
                    {cat.name_english}
                  </p>
                  <p className="text-sm text-[#9A9A94] leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}

        {!loading && categories.length === 0 && (
          <div className="text-center py-16 col-span-2">
            <p className="font-serif text-lg text-[#C8C8C4]">카테고리가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
