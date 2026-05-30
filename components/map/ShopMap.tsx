'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useKakaoMap, type KakaoMap } from '@/hooks/useKakaoMap';
import type { ShopSearchResult } from '@/app/api/shops/search/route';

interface Props {
  shops: ShopSearchResult[];
  selectedId: string | null;
  onSelectShop: (id: string) => void;
  onMapReady?: (map: KakaoMap) => void;
}

/* ── 마커 색상 결정 ─────────────────────────────────────────────── */
function getMarkerStyle(shop: ShopSearchResult): { color: string; size: number } {
  if (shop.source === 'kakao')       return { color: '#1A56DB', size: 10 };
  if (shop.source === 'user_report') return { color: '#C8C8C4', size: 10 };
  // manual (verified or not)
  return { color: '#111111', size: 13 };
}

/* ── 커스텀 오버레이 DOM 요소 ─────────────────────────────────────── */
function makeMarkerEl(shop: ShopSearchResult): HTMLDivElement {
  const { color, size } = getMarkerStyle(shop);
  const el = document.createElement('div');
  el.style.cssText = `
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:2.5px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.25);cursor:pointer;
    transition:transform 0.15s;
  `;
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.4)'; });
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
  return el;
}

/* ── 인포윈도우 HTML ─────────────────────────────────────────────── */
function makeInfoHTML(shop: ShopSearchResult): string {
  const isGlintShop = shop.source === 'manual';
  return `<div style="
    padding:14px 16px;min-width:180px;
    font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif;
    background:white;border-radius:12px;
    border:1px solid #E8E8E4;
    box-shadow:0 4px 16px rgba(0,0,0,0.1);
  ">
    <div style="font-family:'Playfair Display',Georgia,serif;font-weight:700;
      font-size:14px;color:#111;margin-bottom:4px;">
      ${shop.name}
    </div>
    <div style="font-size:11px;color:#9A9A94;margin-bottom:2px;line-height:1.5;">
      ${shop.address || '주소 정보 없음'}
    </div>
    ${shop.phone ? `<div style="font-size:11px;color:#9A9A94;margin-bottom:8px;">${shop.phone}</div>` : ''}
    ${shop.is_verified ? `<span style="font-size:10px;background:#EFF6FF;
      color:#1A56DB;padding:2px 8px;border-radius:4px;
      font-weight:600;display:inline-block;margin-bottom:8px;">
      ✓ 인증
    </span>` : ''}
    ${isGlintShop ? `<a href="/shops/${shop.id}" style="
      display:block;text-align:center;
      background:#111;color:white;
      border-radius:8px;padding:8px 0;
      font-size:12px;font-weight:700;
      text-decoration:none;margin-top:8px;
      font-family:'Noto Sans KR',sans-serif;">
      상세보기 →
    </a>` : ''}
  </div>`;
}

export default function ShopMap({ shops, selectedId, onSelectShop, onMapReady }: Props) {
  const { isLoaded, error } = useKakaoMap();
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<KakaoMap | null>(null);
  const overlaysRef   = useRef<Map<string, { overlay: unknown; el: HTMLDivElement }>>(new Map());
  const activeInfoRef = useRef<{ close(): void } | null>(null);

  /* ── 지도 초기화 ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapRef.current) return;
    const map = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(37.5663, 126.9779),
      level: 8,
    });
    mapRef.current = map;
    onMapReady?.(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  /* ── 마커 렌더 + 자동 bounds 맞춤 ───────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    // 기존 오버레이 제거
    overlaysRef.current.forEach(({ overlay }) => {
      (overlay as { setMap(m: null): void }).setMap(null);
    });
    overlaysRef.current.clear();
    if (activeInfoRef.current) { activeInfoRef.current.close(); activeInfoRef.current = null; }

    const validShops = shops.filter(s => s.lat && s.lng);
    if (validShops.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();

    validShops.forEach(shop => {
      const position = new window.kakao.maps.LatLng(shop.lat, shop.lng);
      bounds.extend(position);

      const el = makeMarkerEl(shop);

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content:  el,
        yAnchor:  0.5,
        xAnchor:  0.5,
        zIndex:   3,
      });
      overlay.setMap(map);
      overlaysRef.current.set(shop.id, { overlay, el });

      // 인포윈도우 (임시 마커에 고정)
      const infoWindow = new window.kakao.maps.InfoWindow({
        content:   makeInfoHTML(shop),
        removable: true,
        zIndex:    10,
      });

      el.addEventListener('click', () => {
        if (activeInfoRef.current) activeInfoRef.current.close();
        const anchor = new window.kakao.maps.Marker({ position });
        infoWindow.open(map, anchor);
        activeInfoRef.current = infoWindow;
        map.setCenter(position);
        onSelectShop(shop.id);
      });
    });

    // 전체 샵이 보이도록 자동 맞춤
    map.setBounds(bounds);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops, isLoaded]);

  /* ── 선택된 샵 패닝 ─────────────────────────────────────────── */
  const panToShop = useCallback((id: string) => {
    const map = mapRef.current;
    if (!map) return;
    const shop = shops.find(s => s.id === id);
    if (!shop?.lat || !shop?.lng) return;
    map.setCenter(new window.kakao.maps.LatLng(shop.lat, shop.lng));
    map.setLevel(4);
  }, [shops]);

  useEffect(() => {
    if (selectedId) panToShop(selectedId);
  }, [selectedId, panToShop]);

  if (error) return (
    <div className="w-full h-full bg-ga-bg flex items-center justify-center rounded-2xl">
      <p className="text-sm text-ga-muted text-center px-4">{error}</p>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-ga-border animate-pulse rounded-2xl z-10" />
      )}
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
    </div>
  );
}
