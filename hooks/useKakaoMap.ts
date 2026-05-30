'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: object) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: object) => KakaoMarker;
        InfoWindow: new (options: object) => KakaoInfoWindow;
        MarkerImage: new (src: string, size: KakaoSize) => KakaoMarkerImage;
        Size: new (w: number, h: number) => KakaoSize;
        CustomOverlay: new (options: object) => KakaoCustomOverlay;
        MarkerClusterer: new (options: object) => KakaoMarkerClusterer;
        LatLngBounds: new () => KakaoLatLngBounds;
        services: {
          Geocoder: new () => KakaoGeocoder;
          Status: { OK: string };
        };
        event: {
          addListener: (target: object, type: string, handler: () => void) => void;
        };
      };
    };
  }
}

export interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  setLevel: (level: number) => void;
  setBounds: (bounds: KakaoLatLngBounds) => void;
  relayout: () => void;
}

export interface KakaoLatLngBounds {
  extend: (latlng: KakaoLatLng) => void;
  isEmpty: () => boolean;
}

export interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

export interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
  getPosition: () => KakaoLatLng;
}

export interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
}

export interface KakaoMarkerImage {
  _src?: string;
}

export interface KakaoSize {
  width: number;
  height: number;
}

export interface KakaoCustomOverlay {
  setMap: (map: KakaoMap | null) => void;
}

export interface KakaoMarkerClusterer {
  addMarkers: (markers: unknown[]) => void;
  clear: () => void;
}

export interface KakaoGeocoder {
  addressSearch: (
    address: string,
    callback: (result: Array<{ y: string; x: string }>, status: string) => void
  ) => void;
}

export function useKakaoMap(): { isLoaded: boolean; error: string | null } {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 이미 로드돼 있으면 바로 반환
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => setIsLoaded(true));
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!apiKey) {
      setError('NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수가 설정되지 않았습니다.');
      return;
    }

    // 이미 스크립트가 삽입된 경우
    if (document.querySelector('#kakao-map-sdk')) {
      const wait = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(wait);
          window.kakao.maps.load(() => setIsLoaded(true));
        }
      }, 100);
      return () => clearInterval(wait);
    }

    const script = document.createElement('script');
    script.id = 'kakao-map-sdk';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => setIsLoaded(true));
      }
    };

    script.onerror = () => {
      setError('카카오맵 SDK 로드에 실패했습니다.');
    };

    document.head.appendChild(script);
  }, []);

  return { isLoaded, error };
}
