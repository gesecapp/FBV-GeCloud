import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
import DefaultLoading from '@/components/default-loading';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllSyncStatuses, useGetGuestsByParent } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { DependentList } from './@components/dependent-list';

export const Route = createFileRoute('/_private/dependents/')({
  beforeLoad: () => {
    const { isAuthenticated, userType } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({ to: '/app-auth' });
    }

    if (userType !== 'morador') {
      throw redirect({ to: '/' });
    }
  },
  component: DependentsPage,
  staticData: { title: 'Meus Dependentes' },
});

function DependentsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: dependents, isLoading } = useGetGuestsByParent('dependente');
  const { data: syncStatuses } = useGetAllSyncStatuses();

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Meus Dependentes</CardTitle>
        <CardAction>
          <Button onClick={() => navigate({ to: '/dependents/add' })}>
            <UserPlus className="size-4" />
            Incluir Dependente
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <DefaultLoading />
        ) : (
          <DependentList
            guests={dependents || []}
            syncStatuses={syncStatuses}
            onAdd={() => navigate({ to: '/dependents/add' })}
            onEdit={(id) => navigate({ to: '/dependents/add', search: { guestId: id } })}
          />
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
