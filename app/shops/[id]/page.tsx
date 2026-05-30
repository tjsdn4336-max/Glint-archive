import { createServerSupabaseClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { ChevronLeft, Store, Phone, ExternalLink, Package } from 'lucide-react';
import AnimalCard from '@/components/AnimalCard';
import ShopMapToggle from '@/components/map/ShopMapToggle';
import type { Animal } from '@/types';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ShopDetailPage({ params }: Props) {
  const { id } = await params;
  const sb = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba = sb as any;

  // UUID로 직접 조회
  const { data: shopData } = await sba
    .from('shops')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  const cs = shopData as Record<string, unknown> | null;

  let animals: Animal[] = [];
  if (cs?.id) {
    const { data } = await sba
      .from('animals')
      .select('*, shop:shops(*)')
      .eq('shop_id', cs.id)
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    animals = (data ?? []) as Animal[];
  }

  const name              = (cs?.name              as string | undefined) ?? '파충류 샵';
  const address           = (cs?.address           as string | undefined) ?? '';
  const phone             = (cs?.phone             as string | undefined) ?? '';
  const description       = (cs?.description       as string | undefined) ?? '';
  const opening_hours     = (cs?.opening_hours     as string | undefined) ?? '';
  const instagram_url     = (cs?.instagram_url     as string | undefined) ?? '';
  const kakao_channel_url = (cs?.kakao_channel_url as string | undefined) ?? '';
  const website_url       = (cs?.website_url       as string | undefined) ?? '';
  const lat               = (cs?.lat               as number | undefined) ?? null;
  const lng               = (cs?.lng               as number | undefined) ?? null;
  const isClaimed         = !!cs?.claimed_at;
  const isVerified        = !!cs?.is_verified;

  return (
    <div className="max-w-screen-lg mx-auto">

      {/* 페이지 헤더 */}
      <div className="px-5 pt-6 pb-5 bg-ga-white border-b border-ga-border md:px-8">
        <Link
          href="/shops"
          className="inline-flex items-center gap-1 text-xs text-ga-muted hover:text-ga-black transition-colors mb-5 font-medium"
        >
          <ChevronLeft size={14} strokeWidth={2} />
          샵 투어로 돌아가기
        </Link>

        <div className="flex items-start gap-4">
          {/* 샵 아이콘 */}
          <div className="w-16 h-16 rounded-2xl bg-ga-bg flex items-center justify-center flex-shrink-0 border border-ga-border">
            <Store size={26} className="text-ga-muted" strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-serif text-2xl font-bold text-ga-black">{name}</h1>
              {isVerified && (
                <span className="ga-badge ga-badge-blue">인증</span>
              )}
              {isClaimed && !isVerified && (
                <span className="ga-badge">등록 샵</span>
              )}
            </div>

            {address && (
              <p className="text-sm text-ga-muted mt-1">{address}</p>
            )}
            {opening_hours && (
              <p className="text-xs text-ga-faint mt-0.5">{opening_hours}</p>
            )}
            {description && (
              <p className="text-sm text-ga-muted mt-3 leading-relaxed max-w-xl">{description}</p>
            )}

            {/* 연락처 버튼 */}
            <div className="flex flex-wrap gap-2 mt-4">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-ga-black text-ga-white text-xs font-bold rounded-lg hover:opacity-80 transition-opacity"
                >
                  <Phone size={12} strokeWidth={2} />
                  전화
                </a>
              )}
              {kakao_channel_url && (
                <a
                  href={kakao_channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FEE500] text-[#3A1D1D] text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <ExternalLink size={12} strokeWidth={2} />
                  카카오
                </a>
              )}
              {instagram_url && (
                <a
                  href={instagram_url.startsWith('http') ? instagram_url : `https://instagram.com/${instagram_url.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-ga-bg text-ga-black text-xs font-bold rounded-lg border border-ga-border hover:border-ga-muted transition-colors"
                >
                  <ExternalLink size={12} strokeWidth={2} />
                  인스타그램
                </a>
              )}
              {website_url && (
                <a
                  href={website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-ga-bg text-ga-black text-xs font-bold rounded-lg border border-ga-border hover:border-ga-muted transition-colors"
                >
                  <ExternalLink size={12} strokeWidth={2} />
                  웹사이트
                </a>
              )}
            </div>

            {/* 위치 보기 토글 (클라이언트 컴포넌트) */}
            {lat && lng && (
              <ShopMapToggle lat={lat} lng={lng} name={name} />
            )}
          </div>
        </div>
      </div>

      {/* 분양 중인 개체 섹션 */}
      <div className="px-5 py-7 md:px-8 pb-24">

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-bold text-ga-black">분양 중인 개체</h2>
          {animals.length > 0 && (
            <span className="text-sm text-ga-muted">{animals.length}마리</span>
          )}
        </div>

        {animals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {animals.map(animal => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <div className="bg-ga-white rounded-2xl border border-ga-border py-16 text-center">
            <Package size={36} className="text-ga-faint mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-sm text-ga-muted mb-1">분양 중인 개체가 없습니다</p>
            {!isClaimed && (
              <p className="text-xs text-ga-faint mt-2">
                사장님이신가요?{' '}
                <Link href="/admin" className="text-ga-black font-semibold underline underline-offset-2">
                  샵 등록하기
                </Link>
              </p>
            )}
          </div>
        )}

        {/* 미등록 샵 CTA */}
        {!isClaimed && (
          <div className="mt-6 rounded-2xl border border-ga-border bg-ga-bg p-6 text-center">
            <p className="text-sm font-bold text-ga-black mb-1">이 샵의 사장님이신가요?</p>
            <p className="text-xs text-ga-muted mb-4 leading-relaxed">
              샵을 등록하면 개체를 올리고 고객 통계를 확인할 수 있어요
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center px-5 py-3 bg-ga-black text-ga-white text-sm font-bold rounded-lg hover:opacity-80 transition-opacity"
            >
              무료로 샵 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
