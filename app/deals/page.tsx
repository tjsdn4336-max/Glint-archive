import { Suspense } from 'react';
import DealsClient from './DealsClient';

export const metadata = {
  title: '타임딜 | Glint Archive',
  description: '전국 파충류 샵의 실시간 분양 딜을 확인하세요',
};

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ga-bg" />}>
      <DealsClient />
    </Suspense>
  );
}
