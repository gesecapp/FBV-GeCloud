import { useQuery } from '@tanstack/react-query';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';

export interface UnitSearchResult {
  id: string;
  identifier: string;
  block?: string;
}

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useSearchUnits(term: string) {
  const { token } = useAppAuth();
  const trimmed = term.trim();

  const query = useQuery({
    queryKey: ['app', 'unities', 'search', trimmed],
    queryFn: async () => {
      const response = await api.get<{ data: UnitSearchResult[]; statusCode: number }>('/app/unities/search', {
        params: { q: trimmed },
        headers: authHeaders(token),
      });
      return response.data.data ?? [];
    },
    enabled: trimmed.length > 0,
  });

  return {
    results: query.data ?? [],
    isLoading: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
