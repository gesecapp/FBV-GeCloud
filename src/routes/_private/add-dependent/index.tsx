import { createFileRoute, redirect } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ItemActions, ItemContent, ItemHeader, ItemTitle } from '@/components/ui/item';
import { useAccessUserApi } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import type { CreateGuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';
import { DependentForm } from './@components/dependent-form';
import { addDependentSearchSchema } from './@interface/add-dependent.schema';

export const Route = createFileRoute('/_private/add-dependent/')({
  validateSearch: addDependentSearchSchema,
  beforeLoad: () => {
    const { isAuthenticated } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/app-auth',
      });
    }
  },
  component: AddDependentPage,
  staticData: { title: 'Dependente' },
});

function AddDependentPage() {
  const { guestId } = Route.useSearch();
  const { userId } = useAppAuth();
  const { createGuest, updateGuest } = useAccessUserApi();

  function handleBack() {
    window.history.back();
  }

  function handleSubmit(data: CreateGuestProps & { id?: string }) {
    const payload = { ...data, user_type: 'dependente' as const };

    if (data.id) {
      const { id, parentId, user_type, ...guestData } = payload;
      updateGuest.mutate(
        { id: data.id, guestData },
        {
          onSuccess: () => {
            toast.success('Dependente atualizado! As alterações podem levar alguns instantes para refletirem no sistema.');
            handleBack();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Erro ao atualizar dependente.');
          },
        },
      );
    } else {
      createGuest.mutate(payload, {
        onSuccess: () => {
          toast.success('Dependente cadastrado! Os dados podem levar alguns instantes para refletirem no sistema.');
          handleBack();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Erro ao cadastrar dependente.');
        },
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E3A5F] p-2 md:p-4">
      <div className="w-full max-w-4xl">
        <Card>
          <CardContent className="flex flex-col gap-6 py-8 md:p-8">
            <ItemContent className="items-center gap-4">
              <img src="/images/logo.svg" alt="Logo" className="h-16 w-auto" />
              <ItemHeader className="w-full">
                <ItemTitle className="text-2xl">{guestId ? 'Editar Dependente' : 'Novo Dependente'}</ItemTitle>
                <ItemActions>
                  <ThemeSwitcher />
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="size-4" />
                    Voltar
                  </Button>
                </ItemActions>
              </ItemHeader>
            </ItemContent>

            <DependentForm parentId={userId || ''} guestId={guestId} onSubmit={handleSubmit} onCancel={handleBack} isLoading={createGuest.isPending || updateGuest.isPending} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
