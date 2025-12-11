import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Threat = Tables<'threats'>;

export function useRealtimeThreats() {
  const [realtimeThreats, setRealtimeThreats] = useState<Threat[]>([]);

  useEffect(() => {
    // Fetch initial threats
    const fetchThreats = async () => {
      const { data, error } = await supabase
        .from('threats')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching threats:', error);
        return;
      }

      setRealtimeThreats(data || []);
    };

    fetchThreats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('threats-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'threats',
        },
        (payload) => {
          console.log('New threat detected:', payload.new);
          setRealtimeThreats((prev) => [payload.new as Threat, ...prev].slice(0, 50));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'threats',
        },
        (payload) => {
          console.log('Threat updated:', payload.new);
          setRealtimeThreats((prev) =>
            prev.map((t) => (t.id === (payload.new as Threat).id ? (payload.new as Threat) : t))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { realtimeThreats };
}
