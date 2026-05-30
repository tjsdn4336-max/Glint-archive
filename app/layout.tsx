import type { Metadata } from 'next';
import './globals.css';
import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'Glint Archive — 전국 파충류 분양 마켓',
  description: '전국 파충류 샵의 실시간 타임딜과 신규 입고 정보를 한눈에. 디지털 패스포트로 내 개체를 증명하세요.',
  metadataBase: new URL('https://glint-archive.vercel.app'),
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon-32.png',
  },
  openGraph: {
    title: 'Glint Archive — 전국 파충류 분양 마켓',
    description: '전국 파충류 샵의 실시간 타임딜과 신규 입고 정보를 한눈에.',
    url: 'https://glint-archive.vercel.app',
    siteName: 'Glint Archive',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard Variable — 국내 최고 한국어 가변 폰트 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* DM Serif Display — 날카롭고 럭셔리한 영문 세리프 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
        />
      </head>
      <body className="bg-ga-bg min-h-screen font-sans">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
