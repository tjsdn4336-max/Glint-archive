import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── DB 타입 정의 ─────────────────────────────────────────────────────────────

export type Status = 'available' | 'reserved' | 'sold';

export interface SpeciesRow {
  id: string;
  name_ko: string;
  name_en: string;
  tagline: string;
  sort_order: number;
}

export interface MorphRow {
  id: string;
  species_id: string;
  name_ko: string;
  name_en: string;
  price: number;
  status: Status;
  description: string;
  image_url: string;
  tags: string[];
  sort_order: number;
}

export interface SpeciesWithMorphs extends SpeciesRow {
  morphs: MorphRow[];
}
