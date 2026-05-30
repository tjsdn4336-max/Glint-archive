'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export function useFavorite(animalId: string) {
  const [isSaved, setIsSaved]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('animal_id', animalId)
        .maybeSingle();
      setIsSaved(!!data);
    };
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId]);

  const toggle = async (): Promise<{ needLogin: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { needLogin: true };

    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    if (isSaved) {
      await sb.from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('animal_id', animalId);
    } else {
      await sb.from('wishlists')
        .insert({ user_id: user.id, animal_id: animalId });
    }
    setIsSaved(prev => !prev);
    setLoading(false);
    return { needLogin: false };
  };

  return { isSaved, toggle, loading };
}
