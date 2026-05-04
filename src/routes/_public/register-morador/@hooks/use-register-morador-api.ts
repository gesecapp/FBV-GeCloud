import { useMutation } from '@tanstack/react-query';

export interface RegisterMoradorPayload {
  name?: string;
  cpf?: string;
  cnpj?: string;
  document_type?: 'cpf' | 'cnpj';
  financial_code?: string;
  birthday?: string;
  user_type?: string;
  email?: string;
  telephones?: string[];
  url_image?: string[];
  password?: string;
}

export interface MockMoradorRegistration {
  name: string;
  document_type: 'cpf' | 'cnpj';
  document: string;
  birthday?: string;
  email?: string;
  telephones?: string[];
  url_image?: string[];
}

const mockRegistrations: Record<string, MockMoradorRegistration> = {
  '12345678909': {
    name: 'Joao da Silva',
    document_type: 'cpf',
    document: '12345678909',
    birthday: '1990-05-12T03:00:00.000Z',
    email: 'joao.silva@email.com',
    telephones: ['11987654321', '1133334444'],
  },
  '11222333000181': {
    name: 'Condominio Exemplo LTDA',
    document_type: 'cnpj',
    document: '11222333000181',
    email: 'financeiro@exemplo.com',
    telephones: ['1130004000'],
  },
};

const mockFinancialCodes = new Set(['FIN-001', 'FIN001', '1234', '987654']);

function wait(ms = 450) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useRegisterMorador() {
  return useMutation({
    mutationFn: async (payload: RegisterMoradorPayload) => {
      await wait();
      return {
        id: crypto.randomUUID(),
        ...payload,
      };
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
      await wait();
      const registration = mockRegistrations[document.replace(/\D/g, '')];

      if (!registration) {
        throw new Error('Cadastro não encontrado para este documento.');
      }

      return registration;
    },
  });
}
