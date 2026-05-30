import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import MyPageClient from './MyPageClient';

export const metadata = { title: '마이페이지 | Glint Archive' };

export default async function MyPage() {
  const sb = await createServerSupabaseClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth?next=/mypage');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (sb as any)
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: credits } = await (sb as any)
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .maybeSingle();

  const { count: passportCount } = await sb
    .from('passports')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id);

  const { count: wishlistCount } = await sb
    .from('wishlists')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <MyPageClient
      user={{ id: user.id, email: user.email ?? '', created_at: user.created_at }}
      nickname={profile?.nickname ?? null}
      credits={credits?.balance ?? 0}
      passportCount={passportCount ?? 0}
      wishlistCount={wishlistCount ?? 0}
    />
  );
}
