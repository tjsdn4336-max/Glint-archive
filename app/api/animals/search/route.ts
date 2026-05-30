import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q          = searchParams.get('q')          ?? '';
  const min_price  = searchParams.get('min_price')  ?? '';
  const max_price  = searchParams.get('max_price')  ?? '';
  const type       = searchParams.get('type')       ?? '';
  const deal_only  = searchParams.get('deal_only')  ?? '';

  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase as any)
    .from('animals')
    .select('*, shop:shops(name, location, is_verified, plan)')
    .eq('status', 'available');

  if (q)                  query = query.or(`name.ilike.%${q}%,morph.ilike.%${q}%`);
  if (min_price)          query = query.gte('price', Number(min_price));
  if (max_price)          query = query.lte('price', Number(max_price));
  if (type && type !== '전체') query = query.eq('name', type);
  if (deal_only === 'true') query = query.eq('is_timedeal', true);

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ animals: data ?? [] });
}
