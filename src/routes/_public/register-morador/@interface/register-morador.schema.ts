import { z } from 'zod';

export const registerMoradorFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  cpf: z.string().min(14, 'CPF obrigatório'),
  birthDate: z.string().optional(),
  email: z.string().email('E-mail inválido').min(1, 'Campo obrigatório'),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  url_image: z.array(z.string()),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type RegisterMoradorFormData = z.infer<typeof registerMoradorFormSchema>;
