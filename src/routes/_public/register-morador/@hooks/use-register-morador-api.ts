import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface RegisterMoradorPayload {
  name?: string;
  cpf?: string;
  cnpj?: string;
  document_type?: 'cpf' | 'cnpj';
  financial_code?: string;
  parentId?: string;
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

const mockFinancialCodes = new Set(['FIN-001', 'FIN001', '1234', '987654']);

function wait(ms = 450) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useRegisterMorador() {
  return useMutation({
    mutationFn: async (payload: RegisterMoradorPayload) => {
      const response = await api.post('/app/moradores', payload);
      return response.data;
    },
  });
}

export function useValidateFinancialCode() {
  return useMutation({
    mutationFn: async (financialCode: string) => {
      await wait();
      const normalizedCode = financialCode.trim().toUpperCase();

      if (!mockFinancialCodes.has(normalizedCode)) {
        throw new Error('Código financeiro não encontrado.');
      }

      return { financial_code: normalizedCode };
    },
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
