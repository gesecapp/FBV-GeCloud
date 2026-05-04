import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Save, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImagePreview from '@/components/ui/image-preview';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent } from '@/components/ui/item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applyCnpjMask, applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import { cn } from '@/lib/utils';
import { type RegisterMoradorPayload, useFetchRegistrationByDocument, useValidateFinancialCode } from '../@hooks/use-register-morador-api';
import { type RegisterMoradorFormData, registerMoradorFormSchema, userTypeOptions } from '../@interface/register-morador.schema';

interface MoradorFormProps {
  onSubmit: (payload: RegisterMoradorPayload) => void;
  isLoading?: boolean;
}

export function MoradorForm({ onSubmit, isLoading }: MoradorFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFinancialCodeValidated, setIsFinancialCodeValidated] = useState(false);
  const [hasTriedDocumentValidation, setHasTriedDocumentValidation] = useState(false);
  const validateFinancialCode = useValidateFinancialCode();
  const fetchRegistrationByDocument = useFetchRegistrationByDocument();

  const form = useForm<RegisterMoradorFormData>({
    resolver: zodResolver(registerMoradorFormSchema),
    defaultValues: {
      name: '',
      documentType: 'cpf',
      document: '',
      financialCode: '',
      birthDate: '',
      user_type: undefined,
      email: '',
      primaryPhone: '',
      secondaryPhone: '',
      url_image: [],
      password: '',
    },
  });

  const urlImages = form.watch('url_image');
  const userType = form.watch('user_type');
  const documentType = form.watch('documentType');
  const hasSelectedUserType = Boolean(userType);
  const isMorador = userType === 'morador';
  const isValidatingFinancialCode = validateFinancialCode.isPending;
  const isFetchingDocument = fetchRegistrationByDocument.isPending;
  const canUseDocument = hasSelectedUserType && (!isMorador || isFinancialCodeValidated);
  const canFillRegistrationFields = canUseDocument && hasTriedDocumentValidation;

  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
    } catch {
      return '';
    }
  }

  function formatISOToDateInput(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  function formatPhone(phone: string | undefined): string {
    return phone ? applyPhoneMask(phone) : '';
  }

  function applyDocumentMask(value: string, type = documentType) {
    return type === 'cpf' ? applyCpfMask(value) : applyCnpjMask(value);
  }

  function handleFormSubmit(data: RegisterMoradorFormData) {
    const phones: string[] = [];
    if (data.primaryPhone?.trim()) phones.push(data.primaryPhone.replace(/\D/g, ''));
    if (data.secondaryPhone?.trim()) phones.push(data.secondaryPhone.replace(/\D/g, ''));

    const documentClean = data.document.replace(/\D/g, '');
    const payload: RegisterMoradorPayload = {
      document_type: data.documentType,
    };

    if (data.name) payload.name = data.name;
    if (data.documentType === 'cpf') payload.cpf = documentClean;
    if (data.documentType === 'cnpj') payload.cnpj = documentClean;

    if (data.financialCode?.trim() && data.user_type === 'morador') {
      payload.financial_code = data.financialCode.trim().toUpperCase();
    }

    const isoDate = formatDateToISO(data.birthDate);
    if (isoDate) payload.birthday = isoDate;

    if (data.user_type) payload.user_type = data.user_type;
    if (data.email) payload.email = data.email;
    if (phones.length > 0) payload.telephones = phones;
    if (data.url_image && data.url_image.length > 0) payload.url_image = data.url_image;
    if (data.password) payload.password = data.password;

    onSubmit(payload);
  }

  function handleImageChange(image: string | undefined) {
    if (!canFillRegistrationFields) return;
    form.setValue('url_image', image ? [image] : [], { shouldValidate: true });
  }

  function resetDocumentStep() {
    setHasTriedDocumentValidation(false);
    form.setValue('document', '', { shouldValidate: true });
    form.clearErrors('document');
  }

  function handleUserTypeChange(value: RegisterMoradorFormData['user_type']) {
    form.setValue('user_type', value, { shouldValidate: true });
    form.setValue('financialCode', '', { shouldValidate: true });
    setIsFinancialCodeValidated(false);
    resetDocumentStep();
  }

  function handleDocumentTypeChange(type: 'cpf' | 'cnpj') {
    form.setValue('documentType', type, { shouldValidate: true });
    resetDocumentStep();
  }

  function handleDocumentChange(value: string) {
    setHasTriedDocumentValidation(false);
    form.setValue('document', applyDocumentMask(value), { shouldValidate: true });
  }

  function handleFinancialCodeChange(value: string) {
    setIsFinancialCodeValidated(false);
    resetDocumentStep();
    form.setValue('financialCode', value, { shouldValidate: true });
  }

  function handleValidateFinancialCode() {
    const financialCode = form.getValues('financialCode')?.trim();

    if (!financialCode) {
      form.setError('financialCode', { message: 'Informe o código financeiro' });
      return;
    }

    validateFinancialCode.mutate(financialCode, {
      onSuccess: () => {
        setIsFinancialCodeValidated(true);
        form.clearErrors('financialCode');
        toast.success('Código financeiro validado.');
      },
      onError: () => {
        setIsFinancialCodeValidated(false);
        form.setError('financialCode', { message: 'Entrar em contato com o administrador local!' });
        toast.error('Entrar em contato com o administrador local!');
      },
    });
  }

  function handleFetchDocument() {
    const document = form.getValues('document');
    const documentDigits = document.replace(/\D/g, '');
    const expectedLength = documentType === 'cpf' ? 11 : 14;

    if (documentDigits.length !== expectedLength) {
      setHasTriedDocumentValidation(false);
      form.setError('document', { message: `${documentType.toUpperCase()} inválido` });
      return;
    }

    fetchRegistrationByDocument.mutate(
      { documentType, document },
      {
        onSuccess: (registration) => {
          form.clearErrors('document');
          form.setValue('documentType', registration.document_type, { shouldValidate: true });
          form.setValue('document', applyDocumentMask(registration.document, registration.document_type), { shouldValidate: true });
          form.setValue('name', registration.name, { shouldValidate: true });
          form.setValue('birthDate', formatISOToDateInput(registration.birthday), { shouldValidate: true });
          form.setValue('email', registration.email ?? '', { shouldValidate: true });
          form.setValue('primaryPhone', formatPhone(registration.telephones?.[0]), { shouldValidate: true });
          form.setValue('secondaryPhone', formatPhone(registration.telephones?.[1]), { shouldValidate: true });
          form.setValue('url_image', registration.url_image ?? [], { shouldValidate: true });
          setHasTriedDocumentValidation(true);
          toast.success('Cadastro encontrado e preenchido.');
        },
        onError: (error) => {
          setHasTriedDocumentValidation(true);
          form.setError('document', { message: error.message });
          toast.error(error.message);
        },
      },
    );
  }

  const sections: FormSection[] = [
    {
      title: 'Tipo de usuário',
      layout: 'horizontal',
      fields: [
        <FormField
          key="user_type"
          control={form.control}
          name="user_type"
          render={({ field }) => (
            <FormItem>
              <Select value={field.value} onValueChange={(value) => handleUserTypeChange(value as RegisterMoradorFormData['user_type'])}>
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    ...(isMorador
      ? [
          {
            title: 'Código Financeiro',
            description: 'Informe o código para validar os dados financeiros.',
            fields: [
              <FormField
                key="financialCode"
                control={form.control}
                name="financialCode"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-3">
                      <FormControl>
                        <Input {...field} placeholder="Digite o código financeiro" onChange={(event) => handleFinancialCodeChange(event.target.value)} />
                      </FormControl>
                      <Button type="button" variant="primary" onClick={handleValidateFinancialCode} disabled={isValidatingFinancialCode || !field.value?.trim()}>
                        {isValidatingFinancialCode ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                        Validar
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />,
            ],
          },
        ]
      : []),
    {
      title: 'Documento (CPF ou CNPJ)',
      description: 'Selecione o tipo e informe o número do documento.',
      fields: [
        <FormField
          key="documentType"
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                {(['cpf', 'cnpj'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={field.value === type ? 'default' : 'outline'}
                    className={cn('min-w-24 justify-start', field.value === type && 'shadow-sm')}
                    onClick={() => handleDocumentTypeChange(type)}
                    disabled={!canUseDocument}
                  >
                    {type.toUpperCase()}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="document"
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-3">
                <FormControl>
                  <Input
                    {...field}
                    placeholder={documentType === 'cpf' ? 'Digite o CPF' : 'Digite o CNPJ'}
                    onChange={(event) => handleDocumentChange(event.target.value)}
                    maxLength={documentType === 'cpf' ? 14 : 18}
                    disabled={!canUseDocument}
                  />
                </FormControl>
                <Button type="button" variant="primary" onClick={handleFetchDocument} disabled={!canUseDocument || isFetchingDocument}>
                  {isFetchingDocument ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  Validar
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Identificação',
      fields: [
        <FormField
          key="name"
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: João da Silva" disabled={!canFillRegistrationFields} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="birthDate"
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="DD/MM/AAAA"
                  onChange={(event) => form.setValue('birthDate', applyDateMask(event.target.value), { shouldValidate: true })}
                  maxLength={10}
                  disabled={!canFillRegistrationFields}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Telefones',
      fields: [
        <FormField
          key="primaryPhone"
          control={form.control}
          name="primaryPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Primário</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="(00) 00000-0000"
                  onChange={(event) => form.setValue('primaryPhone', applyPhoneMask(event.target.value), { shouldValidate: true })}
                  maxLength={15}
                  disabled={!canFillRegistrationFields}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="secondaryPhone"
          control={form.control}
          name="secondaryPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Telefone Secundário <span className="font-normal text-muted-foreground">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="(00) 00000-0000"
                  onChange={(event) => form.setValue('secondaryPhone', applyPhoneMask(event.target.value), { shouldValidate: true })}
                  maxLength={15}
                  disabled={!canFillRegistrationFields}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Acesso',
      description: 'Defina uma senha para acessar o aplicativo.',
      fields: [
        <FormField
          key="email"
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail *</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="email@exemplo.com" disabled={!canFillRegistrationFields} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="password"
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" disabled={!canFillRegistrationFields} />
                  <button
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground disabled:opacity-50"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    disabled={!canFillRegistrationFields}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Foto',
      description: 'Imagem de identificação.',
      layout: 'vertical',
      fields: [
        <FormField
          key="url_image"
          control={form.control}
          name="url_image"
          render={({ fieldState }) => (
            <ItemContent className={cn('gap-3', !canFillRegistrationFields && 'pointer-events-none opacity-50')}>
              <ImagePreview value={urlImages[0]} onChange={handleImageChange} height={200} />
              {fieldState.error?.message && <FormMessage>{fieldState.error.message}</FormMessage>}
            </ItemContent>
          )}
        />,
      ],
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <DefaultFormLayout sections={sections} />

        <ItemActions className="flex justify-end py-6">
          <Button type="submit" disabled={isLoading || !canFillRegistrationFields}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {!isLoading && <Save className="size-4" />}
            Salvar cadastro
          </Button>
        </ItemActions>
      </form>
    </Form>
  );
}
