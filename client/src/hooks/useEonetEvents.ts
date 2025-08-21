import { useQuery } from '@tanstack/react-query';
import { fetchEonet } from '../services/api.service'; // existing API wrapper
import { EonetEvent } from "interfaces/nasaExplorer.interface";

/**
 * React Query hook to load EONET events from backend.
 * Always returns an array (empty on error) plus loading/error flags.
 */
export function useEonetEvents(
  days: number,
  status: 'open' | 'closed' | 'all',
  limit: number
) {
  const query = useQuery({
    queryKey: ['eonet', { days, status, limit }],
    queryFn: async () => {
      // fetchEonet expects params as object; it returns { events: EonetEvent[] }
      return fetchEonet({ days, status, limit });
    },
    select: (data: any): EonetEvent[] => {
      // Normalize to an array
      return Array.isArray(data) ? data : data?.events || [];
    },
    staleTime: 60_000, // 1 minute cache
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
