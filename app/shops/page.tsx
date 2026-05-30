import { createServerSupabaseClient } from '@/lib/supabase-server';
import ShopsClient from './ShopsClient';

export const metadata = {
  title: '샵 투어 | Glint Archive',
  description: '전국 파충류 샵을 찾아보세요',
};

export const revalidate = 3600;

export default async function ShopsPage() {
  const supabase = await createServerSupabaseClient();
  const { count } = await supabase
    .from('shops')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  return <ShopsClient totalCount={count ?? 0} />;
}
