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
    parentDocumentType: z.enum(['cpf', 'cnpj']).optional(),
    parentDocument: z.string().optional(),
    documentType: z.enum(['cpf', 'cnpj']),
    document: z.string().min(1, 'Documento obrigatório'),
    unityIds: z.array(z.string()),
    parentId: z.string().optional(),
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

    if (data.user_type === 'morador' && (!data.unityIds || data.unityIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione ao menos uma unidade',
        path: ['unityIds'],
      });
    }

    if ((data.user_type === 'visitante' || data.user_type === 'dependente') && !data.parentId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Busque e selecione o morador responsável',
        path: ['parentDocument'],
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
