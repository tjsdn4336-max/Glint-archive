// ─── 지역 ────────────────────────────────────────────────────────────────────
export type Region = '서울' | '경기' | '인천' | '부산' | '대구' | '광주' | '대전' | '울산' | '강원' | '충청' | '전라' | '경상' | '제주';

// ─── 영업 상태 ────────────────────────────────────────────────────────────────
export type ShopStatus = 'open' | 'closed' | 'busy';

// ─── 타임딜 상태 ──────────────────────────────────────────────────────────────
export type DealStatus = 'live' | 'ending' | 'ended' | 'upcoming';

// ─── 종 ──────────────────────────────────────────────────────────────────────
export type SpeciesId = 'crestie' | 'leopard' | 'beardie' | 'gargoyle' | 'chameleon' | 'bluetongue' | 'other';

// ─── 성별 ─────────────────────────────────────────────────────────────────────
export type Gender = '수컷' | '암컷' | '미확인';

// ─── 구독 플랜 ────────────────────────────────────────────────────────────────
export type PlanType = 'standard' | 'premium';

// ─── 샵 ──────────────────────────────────────────────────────────────────────
export interface Shop {
  id: string;
  name: string;
  region: Region;
  address: string;
  phone: string;
  instagram?: string;
  status: ShopStatus;
  plan: PlanType;
  rating: number;
  reviewCount: number;
  specialties: SpeciesId[];
  newMorphAlert?: string;
  thumbnailUrl?: string;
  description: string;
  openTime: string;
  closeTime: string;
  closedDays: string;
  dealCount: number;
  followerCount: number;
}

// ─── 타임딜 ───────────────────────────────────────────────────────────────────
export interface TimeDeal {
  id: string;
  shopId: string;
  shopName: string;
  shopRegion: Region;
  shopPlan: PlanType;
  title: string;
  species: SpeciesId;
  speciesLabel: string;
  morphName: string;
  gender: Gender;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  stock: number;
  remainingStock: number;
  status: DealStatus;
  endsAt: Date;
  startsAt: Date;
  imageUrl?: string;
  description: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
}

// ─── 어드민 플랜 비교 ─────────────────────────────────────────────────────────
export interface PlanFeature {
  label: string;
  standard: string | boolean;
  premium: string | boolean;
}

// ─── 타임딜 등록 폼 ───────────────────────────────────────────────────────────
export interface DealForm {
  title: string;
  species: SpeciesId | '';
  morphName: string;
  gender: Gender | '';
  originalPrice: string;
  salePrice: string;
  stock: string;
  durationHours: string;
  description: string;
  imageUrl: string;
}

// ─── 보증서 (CertificateCard 호환) ──────────────────────────────────────────
export interface Certificate {
  id: string;
  shopName: string;
  animalName: string;
  species: SpeciesId;
  speciesLabel: string;
  morphName: string;
  gender: Gender;
  hatchDate: string;
  imageUrl: string;
  isPremium: boolean;
  issuedAt: string;
}
