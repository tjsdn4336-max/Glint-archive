'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

/**
 * 랜딩 페이지처럼 자체 nav를 가진 standalone 페이지에서는
 * 전역 Header / BottomNav 를 렌더하지 않습니다.
 */
const STANDALONE_ROUTES = ['/landing'];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = STANDALONE_ROUTES.includes(pathname);

  if (standalone) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="pt-14 pb-24 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
