export type ShopPlan = 'basic' | 'pro';
export type AnimalGender = 'male' | 'female' | 'unknown';
export type AnimalStatus = 'available' | 'reserved' | 'sold';

export interface Shop {
  id: string;
  name: string;
  location: string;
  address: string | null;
  phone: string | null;
  instagram: string | null;
  is_verified: boolean;
  is_open: boolean;
  plan: ShopPlan;
  owner_id: string | null;
  created_at: string;
  // 조인 필드 (선택)
  animals?: Animal[];
  animal_count?: number;
  new_today?: number;
}

export interface Animal {
  id: string;
  shop_id: string;
  name: string;
  morph: string;
  gender: AnimalGender;
  birth_year: number | null;
  price: number;
  original_price: number | null;
  is_timedeal: boolean;
  deal_ends_at: string | null;
  status: AnimalStatus;
  created_at: string;
  // 조인 필드 (선택)
  shop?: Shop;
}

export interface Passport {
  id: string;
  animal_id: string;
  shop_id: string | null;
  owner_id: string | null;
  passport_number: string;
  issued_at: string;
  health_notes: string | null;
  animal?: Animal;
  shop?: Shop;
}

export interface Wishlist {
  id: string;
  user_id: string;
  animal_id: string;
  created_at: string;
  animal?: Animal;
}

export interface AlertSubscription {
  id: string;
  user_id: string;
  morph_keyword: string;
  is_active: boolean;
  created_at: string;
}

export type UserRole = 'shop' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  shop_id?: string;
}
