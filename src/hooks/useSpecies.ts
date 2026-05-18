import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SpeciesWithMorphs } from '../lib/supabase';

interface UseSpeciesResult {
  data: SpeciesWithMorphs[];
  loading: boolean;
  error: string | null;
}

export function useSpecies(): UseSpeciesResult {
  const [data, setData] = useState<SpeciesWithMorphs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        // Species + Morphs 한 번에 fetch
        const { data: speciesRows, error: speciesErr } = await supabase
          .from('species')
          .select('*')
          .order('sort_order');

        if (speciesErr) throw speciesErr;

        const { data: morphRows, error: morphsErr } = await supabase
          .from('morphs')
          .select('*')
          .order('sort_order');

        if (morphsErr) throw morphsErr;

        // 종별로 morphs 그룹핑
        const combined: SpeciesWithMorphs[] = (speciesRows ?? []).map((sp) => ({
          ...sp,
          morphs: (morphRows ?? []).filter((m) => m.species_id === sp.id),
        }));

        setData(combined);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { data, loading, error };
}
