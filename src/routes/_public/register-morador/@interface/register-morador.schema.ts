import { z } from 'zod';

export const userTypeOptions = [
  { value: 'morador', label: 'Morador' },
  { value: 'visitante', label: 'Visitante' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'prestador_de_servico', label: 'Prestador de Serviço' },
  { value: 'dependente', label: 'Dependente' },
] as const;

export const registerMoradorFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  cpf: z.string().min(14, 'CPF obrigatório'),
  birthDate: z.string().optional(),
  user_type: z.enum(['morador', 'visitante', 'colaborador', 'prestador_de_servico', 'dependente']),
  email: z.string().email('E-mail inválido').min(1, 'Campo obrigatório'),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  url_image: z.array(z.string()),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type RegisterMoradorFormData = z.infer<typeof registerMoradorFormSchema>;
