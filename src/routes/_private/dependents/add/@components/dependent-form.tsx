import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImagePreview from '@/components/ui/image-preview';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemGroup } from '@/components/ui/item';
import { getSyncState, RegistrationStatusAlert } from '@/components/user-sync-alert';
import { useGetGuestById, useGetUserSyncStatus } from '@/hooks/use-access-user-api';
import { applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import type { CreateGuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';
import { type DependentFormData, dependentFormSchema } from '../@interface/add-dependent.schema';

export function DependentForm({ parentId, guestId, onSubmit, onCancel, isLoading }: DependentFormProps) {
  const { data: existingGuest } = useGetGuestById(guestId || null);
  const { data: syncStatus, isLoading: isLoadingSync } = useGetUserSyncStatus(guestId);
  const syncState = getSyncState(syncStatus, isLoadingSync);
  const form = useForm<DependentFormData>({
    resolver: zodResolver(dependentFormSchema),
    defaultValues: {
      name: '',
      document: '',
      birthDate: '',
      email: '',
      primaryPhone: '',
      secondaryPhone: '',
      url_image: [],
    },
  });

  const urlImages = form.watch('url_image');

  useEffect(() => {
    if (existingGuest) {
      const telephones = existingGuest.telephones || [];
      form.reset({
        name: existingGuest.name || '',
        document: applyCpfMask(existingGuest.document || ''),
        birthDate: existingGuest.birthday
          ? (() => {
              const d = new Date(existingGuest.birthday);
              return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            })()
          : '',
        email: existingGuest.email || '',
        primaryPhone: telephones[0] ? applyPhoneMask(telephones[0]) : '',
        secondaryPhone: telephones[1] ? applyPhoneMask(telephones[1]) : '',
        url_image: existingGuest.url_image || [],
      });
    }
  }, [existingGuest, form]);

  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
    } catch {
      return '';
    }
  }

  function handleFormSubmit(data: DependentFormData) {
    const telephones: string[] = [];
    if (data.primaryPhone?.trim()) telephones.push(data.primaryPhone.replace(/\D/g, ''));
    if (data.secondaryPhone?.trim()) telephones.push(data.secondaryPhone.replace(/\D/g, ''));

    const payload: CreateGuestProps & { id?: string } = {
      name: data.name,
      document: data.document?.replace(/\D/g, ''),
      parentId,
      birthday: formatDateToISO(data.birthDate),
      telephones,
      email: data.email || undefined,
      url_image: data.url_image,
      user_type: 'dependente',
    };

    if (guestId) payload.id = guestId;

    onSubmit(payload);
  }

  function handleImageChange(image: string | undefined) {
    form.setValue('url_image', image ? [image] : [], { shouldValidate: true });
  }

  const sections: FormSection[] = [
    {
      title: 'Identificação',
      description: 'Dados pessoais do dependente.',
      fields: [
        <FormField
          key="name"
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: João da Silva" />
              </FormControl>
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
              <FormLabel>CPF *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="000.000.000-00" onChange={(e) => form.setValue('document', applyCpfMask(e.target.value))} maxLength={14} disabled={!!guestId} />
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
                <Input {...field} placeholder="DD/MM/AAAA" onChange={(e) => form.setValue('birthDate', applyDateMask(e.target.value))} maxLength={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="email"
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="email@exemplo.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Contato',
      description: 'Telefones para contato do dependente.',
      fields: [
        <FormField
          key="primaryPhone"
          control={form.control}
          name="primaryPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Primário</FormLabel>
              <FormControl>
                <Input {...field} placeholder="(00) 00000-0000" onChange={(e) => form.setValue('primaryPhone', applyPhoneMask(e.target.value))} maxLength={15} />
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
              <FormLabel>Telefone Secundário</FormLabel>
              <FormControl>
                <Input {...field} placeholder="(00) 00000-0000" onChange={(e) => form.setValue('secondaryPhone', applyPhoneMask(e.target.value))} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Foto',
      description: 'Imagem de identificação do dependente.',
      layout: 'vertical',
      fields: [
        <FormField
          key="url_image"
          control={form.control}
          name="url_image"
          render={({ fieldState }) => (
            <ItemContent className="gap-3">
              <ImagePreview value={urlImages[0]} onChange={handleImageChange} height={200} />
              {fieldState.error?.message && <FormMessage>{fieldState.error.message}</FormMessage>}
            </ItemContent>
          )}
        />,
      ],
    },
  ];

  return (
    <ItemGroup className="gap-6">
      {syncState !== null && syncState !== 'synchronized' && <RegistrationStatusAlert syncStatus={syncStatus} isLoading={isLoadingSync} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <DefaultFormLayout sections={sections} />
          <ItemActions className="flex justify-end py-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {!isLoading && <Save className="size-4"></Save>}
              Salvar
            </Button>
          </ItemActions>
        </form>
      </Form>
    </ItemGroup>
  );
}

interface DependentFormProps {
  parentId: string;
  guestId?: string | null;
  onSubmit: (data: CreateGuestProps & { id?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
