import { createClient } from '@/lib/supabase';

export async function getMonthlyDealCount(shopId: string): Promise<number> {
  const supabase = createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .gte('created_at', startOfMonth.toISOString());

  return count ?? 0;
}

export function canPostDeal(plan: string, monthlyCount: number): boolean {
  if (plan === 'pro') return true;
  return monthlyCount < 3;
}

export function canTimeDeal(plan: string): boolean {
  return plan === 'pro';
}

export function canIssuePassport(plan: string): boolean {
  return plan === 'pro';
}
