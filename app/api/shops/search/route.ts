import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export interface ShopSearchResult {
  id: string;
  name: string;
  address: string;
  location: string;       // 시/도 단위 지역 (예: "서울")
  phone?: string;
  lat: number;
  lng: number;
  is_verified: boolean;
  is_open: boolean;
  source: string;         // 'manual' | 'kakao' | 'public_data' | 'user_report'
  today_count: number;    // 오늘 입고된 개체 수
  has_timedeal: boolean;  // 진행 중인 타임딜 여부
  kakao_place_id?: string;
}

// 파충류 관련 업체만 통과
const WHITELIST = ['파충류', '렙타일', 'reptile', '도마뱀', 'gecko'];
// 관련 없는 업체 제거
const BLACKLIST = ['카페', '병원', '동물병원', '용품점'];

function passesFilter(name: string): boolean {
  const lower = name.toLowerCase();
  if (BLACKLIST.some(w => lower.includes(w.toLowerCase()))) return false;
  return WHITELIST.some(w => lower.includes(w.toLowerCase()));
}

/** 주소에서 시/도 추출 */
function extractLocation(address: string): string {
  if (!address) return '';
  const parts = address.trim().split(' ');
  return parts[0] ?? '';
}

interface KakaoDoc {
  id: string;
  place_name: string;
  road_address_name: string;
  address_name: string;
  phone: string;
  x: string; // lng
  y: string; // lat
}

async function fetchKakaoPage(query: string, page: number): Promise<KakaoDoc[]> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) return [];
  const params = new URLSearchParams({ query, size: '15', page: String(page) });
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
      {
        headers: { Authorization: `KakaoAK ${apiKey}` },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents ?? []) as KakaoDoc[];
  } catch {
    return [];
  }
}

async function searchKakao(region: string): Promise<ShopSearchResult[]> {
  const query = region === '전체' ? '파충류샵' : `${region} 파충류`;
  const pages = await Promise.all([1, 2, 3].map(p => fetchKakaoPage(query, p)));
  const docs  = pages.flat();
  const seen  = new Set<string>();
  const results: ShopSearchResult[] = [];
  for (const d of docs) {
    if (seen.has(d.id)) continue;
    if (!passesFilter(d.place_name)) continue;
    seen.add(d.id);
    const addr = d.road_address_name || d.address_name;
    results.push({
      id:             `kakao_${d.id}`,
      name:           d.place_name,
      address:        addr,
      location:       extractLocation(addr),
      phone:          d.phone || undefined,
      lat:            parseFloat(d.y),
      lng:            parseFloat(d.x),
      is_verified:    false,
      is_open:        false,
      source:         'kakao',
      today_count:    0,
      has_timedeal:   false,
      kakao_place_id: d.id,
    });
  }
  return results;
}

interface AnimalRow {
  shop_id: string;
  id: string;
  is_timedeal: boolean;
  deal_ends_at: string | null;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const region = searchParams.get('region') ?? '전체';

  // ── 1. Supabase 샵 조회 ───────────────────────────────────────────
  const supabase = await createServerSupabaseClient();

  const { data: dbShops } = await supabase
    .from('shops')
    .select('id, name, address, phone, lat, lng, is_verified, is_open, source, kakao_place_id')
    .eq('status', 'approved')
    .not('lat', 'is', null);

  const rawShops = (dbShops ?? []) as Array<{
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    lat: number;
    lng: number;
    is_verified: boolean;
    is_open: boolean;
    source: string | null;
    kakao_place_id: string | null;
  }>;

  // 지역 필터
  const filteredRaw = region === '전체'
    ? rawShops
    : rawShops.filter(s => (s.address ?? '').includes(region));

  const shopIds = filteredRaw.map(s => s.id);

  // ── 2. animals 조회 (오늘 입고 수 + 타임딜) ──────────────────────
  const todayStr = new Date().toISOString().slice(0, 10); // "2026-05-25"
  const now      = new Date().toISOString();

  let animalRows: AnimalRow[] = [];
  if (shopIds.length > 0) {
    const { data: aRows } = await supabase
      .from('animals')
      .select('shop_id, id, is_timedeal, deal_ends_at, created_at')
      .in('shop_id', shopIds)
      .eq('status', 'available');
    animalRows = (aRows ?? []) as AnimalRow[];
  }

  // shop_id → animals 맵
  const animalsByShop = new Map<string, AnimalRow[]>();
  for (const a of animalRows) {
    if (!animalsByShop.has(a.shop_id)) animalsByShop.set(a.shop_id, []);
    animalsByShop.get(a.shop_id)!.push(a);
  }

  // ── 3. Supabase 샵 가공 ──────────────────────────────────────────
  const supabaseResults: ShopSearchResult[] = filteredRaw
    .filter(s => s.lat && s.lng)
    .map(s => {
      const animals = animalsByShop.get(s.id) ?? [];
      const today_count = animals.filter(a =>
        a.created_at.slice(0, 10) === todayStr
      ).length;
      const has_timedeal = animals.some(a =>
        a.is_timedeal && a.deal_ends_at && a.deal_ends_at > now
      );
      return {
        id:             s.id,
        name:           s.name,
        address:        s.address ?? '',
        location:       extractLocation(s.address ?? ''),
        phone:          s.phone ?? undefined,
        lat:            s.lat,
        lng:            s.lng,
        is_verified:    s.is_verified,
        is_open:        s.is_open,
        source:         s.source ?? 'manual',
        today_count,
        has_timedeal,
        kakao_place_id: s.kakao_place_id ?? undefined,
      };
    });

  // ── 4. 카카오 검색 ────────────────────────────────────────────────
  const kakaoResults = await searchKakao(region);

  // ── 5. 중복 제거 + 합산 ──────────────────────────────────────────
  const usedKakaoIds = new Set(
    supabaseResults.map(s => s.kakao_place_id).filter(Boolean)
  );
  const dedupedKakao = kakaoResults.filter(k => !usedKakaoIds.has(k.kakao_place_id));

  const combined = [...supabaseResults, ...dedupedKakao];

  // ── 6. 영업중 우선 정렬 ──────────────────────────────────────────
  combined.sort((a, b) => {
    if (a.is_open && !b.is_open) return -1;
    if (!a.is_open && b.is_open) return 1;
    return 0;
  });

  return NextResponse.json({ results: combined, total: combined.length });
}
