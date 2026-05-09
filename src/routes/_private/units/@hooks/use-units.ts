import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { Unit } from '@/routes/_private/units/@interface/unit.interface';

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const unitsKeys = {
  all: ['app', 'unities'] as const,
  current: () => [...unitsKeys.all, 'current'] as const,
};

export function useUnits() {
  const { token } = useAppAuth();

  const query = useQuery({
    queryKey: unitsKeys.current(),
    queryFn: async () => {
      const response = await api.get<{ data: Unit[]; statusCode: number }>('/app/unities/current', {
        headers: authHeaders(token),
      });
      return response.data.data;
    },
    enabled: !!token,
  });

  const units = query.data ?? [];

  return {
    units,
    currentUnit: units[0],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useAssignUnits() {
  const { token } = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unityIds: string[]) => {
      const response = await api.put<{ data: Unit[]; statusCode: number }>('/app/unities/current', { unityIds }, { headers: authHeaders(token) });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitsKeys.current() });
    },
  });
}
