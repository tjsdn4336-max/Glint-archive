'use client';

import { forwardRef } from 'react';

export interface SaleAnimal {
  name_korean: string;
  morph?: string;
  gender?: string;
  birth_date?: string;
  price: number;
  image_url?: string;
}

export interface SaleShop {
  name: string;
  phone?: string;
  instagram?: string;
  kakao_channel_url?: string;
  address?: string;
}

interface Props {
  animal: SaleAnimal;
  shop: SaleShop;
  variant: 'square' | 'story';
}

function calcMonths(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now   = new Date();
  const m = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  return m > 0 ? m : null;
}

const SaleCardTemplate = forwardRef<HTMLDivElement, Props>(({ animal, shop, variant }, ref) => {
  const isSquare = variant === 'square';
  const W = 1080;
  const H = isSquare ? 1080 : 1920;
  const imgH = isSquare ? '68%' : '62%';
  const infoH = isSquare ? '32%' : '38%';
  const months = calcMonths(animal.birth_date);

  const titleSize  = isSquare ? '60px' : '72px';
  const morphSize  = isSquare ? '26px' : '32px';
  const priceSize  = isSquare ? '68px' : '80px';
  const metaSize   = isSquare ? '22px' : '26px';
  const shopSize   = isSquare ? '22px' : '26px';
  const smallSize  = isSquare ? '17px' : '21px';
  const padH       = isSquare ? '48px' : '60px';
  const padV       = isSquare ? '44px' : '52px';

  return (
    <div
      ref={ref}
      style={{
        width: `${W}px`,
        height: `${H}px`,
        fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
        position: 'relative',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* ── 상단 이미지 영역 ── */}
      <div style={{ width: '100%', height: imgH, position: 'relative', backgroundColor: '#F0F0EE', overflow: 'hidden' }}>
        {animal.image_url ? (
          <img
            src={animal.image_url}
            alt={animal.name_korean}
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F0F0EE, #E0E0DC)',
          }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '64px', color: '#C0C0C0' }}>
              {animal.name_korean}
            </span>
          </div>
        )}

        {/* 하단 그라디언트 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
        }} />

        {/* 좌상단 FOR SALE 배지 */}
        <div style={{ position: 'absolute', top: '32px', left: '36px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.96)',
            padding: '10px 22px',
            borderRadius: '6px',
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#1A7F4B',
          }}>
            FOR SALE
          </div>
        </div>

        {/* 우상단 GLINT ARCHIVE 배지 */}
        <div style={{ position: 'absolute', top: '32px', right: '36px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.96)',
            padding: '10px 20px',
            borderRadius: '6px',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#111',
          }}>
            GLINT ARCHIVE
          </div>
        </div>
      </div>

      {/* ── 하단 정보 영역 ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: infoH,
        backgroundColor: '#FFFFFF',
        padding: `${padV} ${padH}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* 종명 + 모프 */}
        <div>
          <div style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: titleSize,
            fontWeight: 700,
            color: '#111',
            lineHeight: 1.1,
            marginBottom: '10px',
          }}>
            {animal.name_korean}
          </div>
          {animal.morph && (
            <div style={{ fontSize: morphSize, color: '#555', fontWeight: 500, marginBottom: '8px' }}>
              {animal.morph}
            </div>
          )}
          {/* 메타 (성별 · 개월) */}
          {(animal.gender || months !== null) && (
            <div style={{ display: 'flex', gap: '16px', fontSize: metaSize, color: '#999', marginBottom: '6px' }}>
              {animal.gender && <span>{animal.gender}</span>}
              {animal.gender && months !== null && <span style={{ color: '#DDD' }}>·</span>}
              {months !== null && <span>{months}개월</span>}
            </div>
          )}
        </div>

        {/* 가격 */}
        <div style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: priceSize,
          fontWeight: 700,
          color: '#111',
          lineHeight: 1,
        }}>
          {animal.price.toLocaleString()}원
        </div>

        {/* 구분선 + 샵 정보 */}
        <div>
          <div style={{ height: '1px', background: '#E8E8E4', marginBottom: '20px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: shopSize, fontWeight: 700, color: '#111', marginBottom: '4px' }}>
                {shop.name}
              </div>
              {shop.address && (
                <div style={{ fontSize: smallSize, color: '#999' }}>📍 {shop.address}</div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              {shop.instagram && (
                <div style={{ fontSize: smallSize, color: '#555', marginBottom: '3px' }}>
                  @{shop.instagram.replace('@', '')}
                </div>
              )}
              {shop.phone && (
                <div style={{ fontSize: smallSize, color: '#555' }}>{shop.phone}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SaleCardTemplate.displayName = 'SaleCardTemplate';
export default SaleCardTemplate;
