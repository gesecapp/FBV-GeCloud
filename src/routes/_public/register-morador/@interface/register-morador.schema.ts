import { z } from 'zod';

export const userTypeOptions = [
  { value: 'morador', label: 'Morador' },
  { value: 'visitante', label: 'Visitante' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'prestador_de_servico', label: 'Prestador de Serviço' },
  { value: 'dependente', label: 'Dependente' },
] as const;

export const registerMoradorFormSchema = z
  .object({
    name: z.string().min(1, 'Campo obrigatório'),
    documentType: z.enum(['cpf', 'cnpj']),
    document: z.string().min(1, 'Documento obrigatório'),
    financialCode: z.string().optional(),
    birthDate: z.string().optional(),
    user_type: z.enum(['morador', 'visitante', 'colaborador', 'prestador_de_servico', 'dependente']),
    email: z.string().email('E-mail inválido').min(1, 'Campo obrigatório'),
    primaryPhone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    url_image: z.array(z.string()),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  })
  .superRefine((data, ctx) => {
    const documentDigits = data.document.replace(/\D/g, '');

    if (data.user_type === 'morador' && !data.financialCode?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Código financeiro obrigatório para moradores',
        path: ['financialCode'],
      });
    }

    if (data.documentType === 'cpf' && documentDigits.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF inválido',
        path: ['document'],
      });
    }

    if (data.documentType === 'cnpj' && documentDigits.length !== 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CNPJ inválido',
        path: ['document'],
      });
    }
  });

export type RegisterMoradorFormData = z.infer<typeof registerMoradorFormSchema>;
