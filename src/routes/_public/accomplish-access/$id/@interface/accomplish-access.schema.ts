import { z } from 'zod';

export const userTypeOptions = [
  { value: 'morador', label: 'Morador' },
  { value: 'visitante', label: 'Visitante' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'prestador_de_servico', label: 'Prestador de Serviço' },
  { value: 'dependente', label: 'Dependente' },
] as const;

export const userTypeValues = userTypeOptions.map((option) => option.value) as [string, ...string[]];

export const accomplishAccessSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    birthDate: z.string().optional(),
    primaryPhone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    url_image: z.array(z.string()),
    userType: z.enum(userTypeValues, { errorMap: () => ({ message: 'Selecione o tipo de usuário' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type AccomplishAccessFormData = z.infer<typeof accomplishAccessSchema>;
