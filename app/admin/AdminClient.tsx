'use client';

import { useState, useEffect, useCallback } from 'react';
import ShopClaimFlow from '@/components/admin/ShopClaimFlow';
import ShopDashboard from '@/components/admin/ShopDashboard';

interface Props {
  user: { id: string; email: string };
  initialShop: Record<string, unknown> | null;
}

export default function AdminClient({ user, initialShop }: Props) {
  const [shop, setShop] = useState<Record<string, unknown> | null>(initialShop);

  const handleClaimed = useCallback((claimedShop: Record<string, unknown>) => {
    setShop(claimedShop);
  }, []);

  if (!shop) {
    return <ShopClaimFlow user={user} onClaimed={handleClaimed} />;
  }

  return <ShopDashboard shop={shop} user={user} onShopUpdate={setShop} />;
}
