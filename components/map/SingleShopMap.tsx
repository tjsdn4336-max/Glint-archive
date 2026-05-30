'use client';

import { useEffect, useRef } from 'react';
import { useKakaoMap } from '@/hooks/useKakaoMap';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function SingleShopMap({ lat, lng, name }: Props) {
  const { isLoaded, error } = useKakaoMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const initedRef    = useRef(false);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || initedRef.current) return;
    initedRef.current = true;

    const position = new window.kakao.maps.LatLng(lat, lng);
    const map = new window.kakao.maps.Map(containerRef.current, {
      center: position,
      level:  4,
    });

    // 검정 커스텀 오버레이 마커 (14px)
    const el = document.createElement('div');
    el.style.cssText = `
      width:14px;height:14px;border-radius:50%;
      background:#111111;border:2.5px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    `;
    new window.kakao.maps.CustomOverlay({
      position,
      content:  el,
      yAnchor:  0.5,
      xAnchor:  0.5,
      zIndex:   3,
    }).setMap(map);

    // 샵명 라벨 오버레이
    const label = document.createElement('div');
    label.style.cssText = `
      font-family:'Noto Sans KR',sans-serif;
      font-size:11px;font-weight:700;
      background:white;color:#111;
      padding:3px 7px;border-radius:6px;
      border:1px solid #E8E8E4;
      box-shadow:0 1px 4px rgba(0,0,0,0.1);
      white-space:nowrap;
    `;
    label.textContent = name;
    new window.kakao.maps.CustomOverlay({
      position,
      content:  label,
      yAnchor:  2.8,
      xAnchor:  0.5,
      zIndex:   4,
    }).setMap(map);
  }, [isLoaded, lat, lng, name]);

  if (error) return (
    <div className="w-full h-full bg-ga-bg flex items-center justify-center">
      <p className="text-xs text-ga-muted">{error}</p>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-ga-border animate-pulse" />
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
