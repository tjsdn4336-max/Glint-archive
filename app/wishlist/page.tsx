import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AnimalCard from '@/components/AnimalCard';
import type { Animal } from '@/types';

export default async function WishlistPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('wishlists')
    .select('animal_id, animal:animals(*, shop:shops(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const animals: Animal[] = (data ?? [])
    .map((row: { animal: Animal | null }) => row.animal)
    .filter(Boolean) as Animal[];

  return (
    <div className="max-w-screen-lg mx-auto">

      {/* 페이지 헤더 */}
      <div className="px-5 pt-8 pb-6 bg-ga-white border-b border-ga-border md:px-8">
        <p className="text-[10px] text-ga-muted tracking-[0.2em] font-semibold mb-2 uppercase">Wishlist</p>
        <h1 className="font-serif text-3xl font-bold text-ga-black mb-1">찜 목록</h1>
        <p className="text-sm text-ga-muted">관심 있는 개체를 모아보세요</p>
      </div>

      <div className="px-5 py-8 md:px-8">
        {animals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Heart size={40} className="text-ga-faint mb-4" strokeWidth={1.5} />
            <p className="font-serif text-lg text-ga-faint mb-1">아직 찜한 개체가 없습니다</p>
            <p className="text-sm text-ga-faint mb-8">마음에 드는 개체의 하트를 눌러보세요</p>
            <Link href="/deals"
              className="px-5 py-3 bg-ga-black text-ga-white text-sm font-bold rounded-lg hover:opacity-80 transition-opacity">
              타임딜 보러가기
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-ga-muted mb-5 tracking-wide">{animals.length}개의 개체</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {animals.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
