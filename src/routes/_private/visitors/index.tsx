import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
import DefaultLoading from '@/components/default-loading';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllSyncStatuses, useGetGuestsByParent } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { VisitorList } from './@components/visitor-list';

export const Route = createFileRoute('/_private/visitors/')({
  beforeLoad: () => {
    const { isAuthenticated } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/app-auth',
      });
    }
  },
  component: VisitorsPage,
  staticData: { title: 'Meus Visitantes' },
});

function VisitorsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: visitors, isLoading } = useGetGuestsByParent('visitante');
  const { data: syncStatuses } = useGetAllSyncStatuses();

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Meus Visitantes</CardTitle>
        <CardAction>
          <Button onClick={() => navigate({ to: '/add-visitor' })}>
            <UserPlus className="size-4" />
            Incluir Visitante
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <DefaultLoading />
        ) : (
          <VisitorList
            guests={visitors || []}
            syncStatuses={syncStatuses}
            onAdd={() => navigate({ to: '/add-visitor' })}
            onEdit={(id) => navigate({ to: '/add-visitor', search: { guestId: id } })}
          />
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
