import { createFileRoute, redirect } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/nav-actions/switch-theme';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccessUserApi } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import type { CreateGuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';
import { DependentForm } from './@components/dependent-form';
import { addDependentSearchSchema } from './@interface/add-dependent.schema';

export const Route = createFileRoute('/_private/dependents/add/')({
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
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>{guestId ? 'Editar Dependente' : 'Novo Dependente'}</CardTitle>
        <CardAction>
          <ThemeSwitcher />
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <DependentForm parentId={userId || ''} guestId={guestId} onSubmit={handleSubmit} onCancel={handleBack} isLoading={createGuest.isPending || updateGuest.isPending} />
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
