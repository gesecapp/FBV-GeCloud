import { z } from 'zod';

export const addDependentSearchSchema = z.object({
  guestId: z.string().optional(),
});

export type AddDependentSearch = z.infer<typeof addDependentSearchSchema>;

export const dependentFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  cpf: z.string().min(14, 'CPF obrigatório e deve ser válido'),
  birthDate: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  url_image: z.array(z.string()).min(1, 'Pelo menos uma foto é obrigatória'),
});

export type DependentFormData = z.infer<typeof dependentFormSchema>;
