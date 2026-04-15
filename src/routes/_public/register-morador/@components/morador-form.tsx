import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent } from '@/components/ui/item';
import UploadImage from '@/components/upload-image';
import { compressImageToBase64 } from '@/lib/image-compression';
import { applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import type { RegisterMoradorPayload } from '../@hooks/use-register-morador-api';
import { type RegisterMoradorFormData, registerMoradorFormSchema } from '../@interface/register-morador.schema';

interface MoradorFormProps {
  onSubmit: (payload: RegisterMoradorPayload) => void;
  isLoading?: boolean;
}

export function MoradorForm({ onSubmit, isLoading }: MoradorFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [_phoneInput, _setPhoneInput] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  const form = useForm<RegisterMoradorFormData>({
    resolver: zodResolver(registerMoradorFormSchema),
    defaultValues: {
      name: '',
      cpf: '',
      birthDate: '',
      email: '',
      primaryPhone: '',
      secondaryPhone: '',
      url_image: [],
      password: '',
    },
  });

  const urlImages = form.watch('url_image');
 
  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
    } catch {
      return '';
    }
  }

  function handleFormSubmit(data: RegisterMoradorFormData) {
    const phones: string[] = [];
    if (data.primaryPhone?.trim()) phones.push(data.primaryPhone.replace(/\D/g, ''));
    if (data.secondaryPhone?.trim()) phones.push(data.secondaryPhone.replace(/\D/g, ''));

    const payload: RegisterMoradorPayload = {};

    if (data.name) payload.name = data.name;

    const cpfClean = data.cpf?.replace(/\D/g, '');
    if (cpfClean) payload.cpf = cpfClean;

    const isoDate = formatDateToISO(data.birthDate);
    if (isoDate) payload.birthday = isoDate;

    if (data.email) payload.email = data.email;
    if (phones.length > 0) payload.telephones = phones;
    if (data.url_image && data.url_image.length > 0) payload.url_image = data.url_image;
    if (data.password) payload.password = data.password;

    onSubmit(payload);
  }

  function handleAddFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const compressed = await compressImageToBase64(base64);
      form.setValue('url_image', [compressed], { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  }

  function handleCameraCapture(image: string) {
    form.setValue('url_image', [image], { shouldValidate: true });
    setCameraOpen(false);
  }

  function handleRemoveImage() {
    form.setValue('url_image', [], { shouldValidate: true });
  }

  const sections: FormSection[] = [
    {
      title: 'Identificação',
      description: 'Seus dados pessoais.',
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
          key="cpf"
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="000.000.000-00" onChange={(e) => form.setValue('cpf', applyCpfMask(e.target.value))} maxLength={14} />
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
              <FormLabel>E-mail *</FormLabel>
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
      title: 'Telefones',
      description: 'Telefones para contato.',
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
            <ItemContent className="gap-3">
              <FormLabel>Foto</FormLabel>
              <UploadImage value={urlImages[0]} onAddFile={handleAddFile} height={200} />
              <ItemActions>
                <Button type="button" variant="outline" onClick={() => setCameraOpen(true)}>
                  <Camera className="mr-2 size-4" />
                  Câmera
                </Button>
                {urlImages && urlImages.length > 0 && (
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={handleRemoveImage}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </ItemActions>
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
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Cadastrar
          </Button>
        </ItemActions>
      </form>

      <CameraCaptureDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
    </Form>
  );
}
