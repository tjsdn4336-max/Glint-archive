'use client';

import { useState, useRef } from 'react';
import { X, Download, Copy, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import SaleCardTemplate, { SaleAnimal, SaleShop } from './SaleCardTemplate';

interface Props {
  animal: SaleAnimal & { id?: string };
  shop: SaleShop & { plan?: string };
  onClose: () => void;
}

export default function SaleCardModal({ animal, shop, onClose }: Props) {
  const [variant, setVariant]       = useState<'square' | 'story'>('square');
  const [downloading, setDownloading] = useState(false);
  const cardRef                     = useRef<HTMLDivElement>(null);
  const isPro                       = (shop.plan ?? 'basic') === 'pro';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // html2canvas는 동적 import
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      const link     = document.createElement('a');
      link.download  = `${animal.name_korean}_분양카드_${variant === 'square' ? '정사각' : '세로형'}.png`;
      link.href      = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error(err);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    const morph    = animal.morph    ? ` ${animal.morph}`    : '';
    const gender   = animal.gender   ? `⚧ ${animal.gender}\n` : '';
    const birth    = animal.birth_date ? `📅 ${animal.birth_date} 생\n` : '';
    const insta    = shop.instagram   ? `📱 @${shop.instagram.replace('@','')}\n` : '';
    const phone    = shop.phone       ? `📞 ${shop.phone}\n`   : '';
    const location = shop.address     ? ` (${shop.address})`   : '';
    const morphTag = animal.morph ? `#${animal.morph.replace(/\s/g,'')} ` : '';
    const nameTag  = animal.name_korean.replace(/\s/g,'');

    const text = `🦎 ${animal.name_korean}${morph} 분양합니다
💰 ${animal.price.toLocaleString()}원
${gender}${birth}
📍 ${shop.name}${location}
${phone}${insta}
#파충류 #파충류분양 #${nameTag} ${morphTag}#글린트아카이브 #glintarchive`.trim();

    navigator.clipboard.writeText(text).then(() => {
      alert('문구를 복사했습니다!\n인스타그램·당근마켓·카카오에 바로 붙여넣으세요.');
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md my-4 overflow-hidden shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E4]">
          <div>
            <p className="text-[9px] text-[#9A9A94] tracking-widest uppercase">SALE CARD GENERATOR</p>
            <h3 className="font-serif text-lg font-bold text-[#111]">분양 카드 만들기</h3>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F7F7F5] flex items-center justify-center hover:bg-[#E8E8E4] transition-colors">
            <X className="w-4 h-4 text-[#111]" />
          </button>
        </div>

        {/* PRO 플랜 게이트 */}
        {!isPro ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-[#9A9A94]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#111] mb-2">PRO 플랜 전용 기능</h3>
            <p className="text-sm text-[#9A9A94] mb-6 leading-relaxed">
              분양 카드 자동 생성으로<br />인스타 마케팅 시간을 절약하세요.
            </p>
            <Link href="/pricing?tab=shop"
              className="bg-[#111] text-white rounded-lg px-6 py-3 text-sm font-bold">
              PRO 시작하기
            </Link>
          </div>
        ) : (
          <>
            {/* 비율 선택 */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-[9px] text-[#9A9A94] tracking-widest uppercase mb-2">비율 선택</p>
              <div className="flex gap-2">
                {([
                  { key: 'square' as const, label: '정사각형', sub: '인스타 피드' },
                  { key: 'story'  as const, label: '세로형',   sub: '인스타 스토리·당근' },
                ] as const).map(v => (
                  <button key={v.key} onClick={() => setVariant(v.key)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      variant === v.key
                        ? 'bg-[#111] text-white'
                        : 'bg-[#F7F7F5] text-[#9A9A94] border border-[#E8E8E4] hover:border-[#111]'
                    }`}>
                    {v.label}
                    <span className="block text-[10px] opacity-60 mt-0.5">{v.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 미리보기 */}
            <div className="px-5 py-3">
              <p className="text-[9px] text-[#9A9A94] tracking-widest uppercase mb-2">미리보기</p>
              <div className="bg-[#F7F7F5] rounded-xl flex items-center justify-center overflow-hidden"
                style={{ height: variant === 'square' ? '260px' : '320px' }}>
                <div style={{
                  transform: variant === 'square' ? 'scale(0.24)' : 'scale(0.155)',
                  transformOrigin: 'center center',
                }}>
                  <SaleCardTemplate animal={animal} shop={shop} variant={variant} />
                </div>
              </div>
            </div>

            {/* 다운로드 + 문구복사 버튼 */}
            <div className="px-5 pb-4 flex flex-col gap-2">
              <button onClick={handleDownload} disabled={downloading}
                className="w-full bg-[#111] text-white rounded-xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-80 transition-opacity">
                {downloading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />이미지 생성 중...</>
                ) : (
                  <><Download className="w-4 h-4" />이미지 다운로드 (PNG)</>
                )}
              </button>
              <button onClick={handleCopyText}
                className="w-full bg-white border border-[#E8E8E4] text-[#111] rounded-xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 hover:border-[#111] transition-colors">
                <Copy className="w-4 h-4" />
                문구 복사하기
              </button>
            </div>

            {/* 안내 */}
            <div className="bg-[#F7F7F5] px-5 py-4 border-t border-[#E8E8E4]">
              <p className="text-[11px] text-[#9A9A94] leading-relaxed">
                💡 다운로드한 이미지와 복사한 문구를 인스타그램·당근마켓·카카오에 바로 올리세요.
                GLINT ARCHIVE 로고가 새겨져 신뢰도가 올라갑니다.
              </p>
            </div>
          </>
        )}
      </div>

      {/* 실제 캡처용 컴포넌트 — 화면 밖에 숨김 */}
      {isPro && (
        <div style={{ position: 'absolute', left: '-99999px', top: 0 }}>
          <SaleCardTemplate ref={cardRef} animal={animal} shop={shop} variant={variant} />
        </div>
      )}
    </div>
  );
}
