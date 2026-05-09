import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface AccomplishAccessGuestData {
  id?: string;
  _id?: string;
  name?: string;
  document?: string;
  email?: string;
  is_legal_person?: boolean;
  birthday?: string;
  telephones?: string[];
  url_image?: string[];
  registration_complete?: boolean;
}

export interface AccomplishAccessPayload {
  name: string;
  birthday?: string;
  telephones?: string[];
  password: string;
  url_image?: string[];
  is_legal_person?: boolean;
  user_type: string;
}

export function useGetGuestByInviteId(id: string | null) {
  return useQuery({
    queryKey: ['app-accomplish-access-invite', id],
    queryFn: async () => {
      const response = await api.get<{ data: AccomplishAccessGuestData; statusCode: number }>(`/app/guests/invite-by-id/${id}`);
      return response.data.data;
    },
    enabled: !!id && typeof id === 'string',
    retry: false,
  });
}

export function useAccomplishAccess() {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AccomplishAccessPayload }) => {
      const response = await api.put<{ data: any; statusCode: number }>(`/app/accomplish-access/${id}`, payload);
      return response.data.data;
    },
  });
}
