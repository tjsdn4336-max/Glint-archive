'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

const SingleShopMap = dynamic(() => import('./SingleShopMap'), { ssr: false });

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function ShopMapToggle({ lat, lng, name }: Props) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowMap(v => !v)}
        className="flex items-center gap-2 text-[12px] text-ga-muted font-medium border border-ga-border rounded-lg px-3 py-2 bg-ga-bg hover:border-ga-muted transition-colors"
      >
        <MapPin size={14} strokeWidth={1.5} />
        {showMap ? '지도 닫기' : '위치 보기'}
      </button>

      {showMap && (
        <div className="mt-3 rounded-2xl overflow-hidden border border-ga-border h-[200px]">
          <SingleShopMap lat={lat} lng={lng} name={name} />
        </div>
      )}
    </div>
  );
}
