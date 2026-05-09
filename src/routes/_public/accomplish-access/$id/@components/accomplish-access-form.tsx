import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImagePreview from '@/components/ui/image-preview';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent } from '@/components/ui/item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applyCnpjMask, applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import { cn } from '@/lib/utils';
import type { AccomplishAccessGuestData, AccomplishAccessPayload } from '../@hooks/use-accomplish-access-api';
import { type AccomplishAccessFormData, accomplishAccessSchema, userTypeOptions } from '../@interface/accomplish-access.schema';

interface AccomplishAccessFormProps {
  guest: AccomplishAccessGuestData;
  onSubmit: (payload: AccomplishAccessPayload) => void;
  isLoading?: boolean;
}

function formatDateInputFromIso(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateToIso(value?: string): string | undefined {
  if (!value || value.length < 10) return undefined;
  const [day, month, year] = value.split('/');
  const iso = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(iso.getTime())) return undefined;
  return iso.toISOString();
}

export function AccomplishAccessForm({ guest, onSubmit, isLoading }: AccomplishAccessFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<AccomplishAccessFormData>({
    resolver: zodResolver(accomplishAccessSchema),
    defaultValues: {
      name: guest.name ?? '',
      birthDate: formatDateInputFromIso(guest.birthday),
      primaryPhone: guest.telephones?.[0] ? applyPhoneMask(guest.telephones[0]) : '',
      secondaryPhone: guest.telephones?.[1] ? applyPhoneMask(guest.telephones[1]) : '',
      password: '',
      confirmPassword: '',
      url_image: guest.url_image ?? [],
    },
  });

  const urlImages = form.watch('url_image');
  const maskedDocument = guest.is_legal_person ? applyCnpjMask(guest.document ?? '') : applyCpfMask(guest.document ?? '');

  function handleFormSubmit(data: AccomplishAccessFormData) {
    const phones: string[] = [];
    if (data.primaryPhone?.trim()) phones.push(data.primaryPhone.replace(/\D/g, ''));
    if (data.secondaryPhone?.trim()) phones.push(data.secondaryPhone.replace(/\D/g, ''));

    const payload: AccomplishAccessPayload = {
      name: data.name,
      password: data.password,
      is_legal_person: !!guest.is_legal_person,
      user_type: data.userType,
    };

    const iso = formatDateToIso(data.birthDate);
    if (iso) payload.birthday = iso;
    if (phones.length > 0) payload.telephones = phones;
    if (data.url_image && data.url_image.length > 0) payload.url_image = data.url_image;

    onSubmit(payload);
  }

  function handleImageChange(image: string | undefined) {
    form.setValue('url_image', image ? [image] : [], { shouldValidate: true });
  }

  const sections: FormSection[] = [
    {
      title: 'Identificação',
      description: 'Dados do cadastro.',
      fields: [
        <FormItem key="document">
          <FormLabel>{guest.is_legal_person ? 'CNPJ' : 'CPF'}</FormLabel>
          <FormControl>
            <Input value={maskedDocument} disabled />
          </FormControl>
        </FormItem>,
        <FormItem key="email">
          <FormLabel>E-mail</FormLabel>
          <FormControl>
            <Input value={guest.email ?? ''} disabled />
          </FormControl>
        </FormItem>,
        <FormField
          key="userType"
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Usuário *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />,
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
                  maxLength={10}
                  onChange={(event) => form.setValue('birthDate', applyDateMask(event.target.value), { shouldValidate: true })}
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
                  maxLength={15}
                  onChange={(event) => form.setValue('primaryPhone', applyPhoneMask(event.target.value), { shouldValidate: true })}
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
                  maxLength={15}
                  onChange={(event) => form.setValue('secondaryPhone', applyPhoneMask(event.target.value), { shouldValidate: true })}
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
          key="password"
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" />
                  <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} type="button">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="confirmPassword"
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirme a senha" />
                  <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
            <ItemContent className={cn('gap-3')}>
              <ImagePreview value={urlImages?.[0]} onChange={handleImageChange} height={200} />
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Concluir cadastro
          </Button>
        </ItemActions>
      </form>
    </Form>
  );
}
