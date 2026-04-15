import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

export interface RegisterMoradorPayload {
  name?: string;
  cpf?: string;
  birthday?: string;
  email?: string;
  telephones?: string[];
  url_image?: string[];
  password?: string;
}

export function useRegisterMorador() {
  return useMutation({
    mutationFn: async (payload: RegisterMoradorPayload) => {
      const response = await api.post('/app/moradores', payload);
      return response.data;
    },
  });
}
