export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string;
          name: string;
          location: string;
          address: string | null;
          phone: string | null;
          instagram: string | null;
          is_verified: boolean;
          is_open: boolean;
          plan: string;
          owner_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shops']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['shops']['Insert']>;
      };
      animals: {
        Row: {
          id: string;
          shop_id: string | null;
          name: string;
          morph: string;
          gender: string;
          birth_year: number | null;
          price: number;
          original_price: number | null;
          is_timedeal: boolean;
          deal_ends_at: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['animals']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['animals']['Insert']>;
      };
      passports: {
        Row: {
          id: string;
          animal_id: string | null;
          shop_id: string | null;
          owner_id: string | null;
          passport_number: string;
          issued_at: string;
          health_notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['passports']['Row'], 'id' | 'issued_at'> & { id?: string; issued_at?: string };
        Update: Partial<Database['public']['Tables']['passports']['Insert']>;
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          animal_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wishlists']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['wishlists']['Insert']>;
      };
      alert_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          morph_keyword: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['alert_subscriptions']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['alert_subscriptions']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
