import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminClient from './AdminClient';

export const metadata = { title: '사장님 대시보드 | Glint Archive' };

export default async function AdminPage() {
  const sb = await createServerSupabaseClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth?next=/admin');

  const { data: shop } = await sb
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  return <AdminClient user={{ id: user.id, email: user.email ?? '' }} initialShop={shop} />;
}
