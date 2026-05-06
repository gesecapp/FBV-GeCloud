import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface RegisterMoradorPayload {
  name?: string;
  document?: string;
  is_legal_person?: boolean;
  parentId?: string;
  unityIds?: string[];
  birthday?: string;
  user_type?: string;
  email?: string;
  telephones?: string[];
  url_image?: string[];
  password?: string;
}

export interface GuestSearchResult {
  id?: string;
  _id?: string;
  name: string;
  document_type?: 'cpf' | 'cnpj';
  document?: string;
  user_type?: string;
  cpf?: string;
  cnpj?: string;
  birthday?: string;
  email?: string;
  telephones?: string[];
  url_image?: string[];
}

export interface UnitySearchResult {
  id: string;
  identifier: string;
  block?: string;
}

export function useRegisterMorador() {
  return useMutation({
    mutationFn: async (payload: RegisterMoradorPayload) => {
      const response = await api.post('/app/moradores', payload);
      return response.data;
    },
  });
}

export function useSearchUnities(query: string, enabled: boolean) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['app', 'unities', 'search', trimmed],
    queryFn: async () => {
      const response = await api.get<{ data: UnitySearchResult[]; statusCode: number }>('/app/unities/search', {
        params: { q: trimmed, limit: 10 },
      });
      return response.data.data;
    },
    enabled: enabled && trimmed.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useFetchRegistrationByDocument() {
  return useMutation({
    mutationFn: async ({ document }: { documentType: 'cpf' | 'cnpj'; document: string }) => {
      const response = await api.get<{ data: GuestSearchResult; statusCode: number }>('/app/guests/search/cpf', {
        params: { cpf: document.replace(/\D/g, '') },
      });
      return response.data.data;
    },
  });
}

export function useFindParentByDocument() {
  return useMutation({
    mutationFn: async ({ document }: { documentType: 'cpf' | 'cnpj'; document: string }) => {
      const response = await api.get<{ data: GuestSearchResult; statusCode: number }>('/app/guests/search/cpf', {
        params: { cpf: document.replace(/\D/g, '') },
      });
      return response.data.data;
    },
  });
}
