import { useQuery } from '@tanstack/react-query';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { Unit } from '@/routes/_private/units/@interface/unit.interface';

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useParentUnits(enabled: boolean) {
  const { token } = useAppAuth();

  const query = useQuery({
    queryKey: ['app', 'unities', 'parent'],
    queryFn: async () => {
      const response = await api.get<{ data: Unit[]; statusCode: number }>('/app/unities/parent', {
        headers: authHeaders(token),
      });
      return response.data.data ?? [];
    },
    enabled: !!token && enabled,
  });

  return {
    results: query.data ?? [],
    isLoading: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
