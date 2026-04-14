import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import DefaultLoading from '@/components/default-loading';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
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
          <Link to="/">
            <Button size={'sm'}>
              <Home className="size-4" />
            </Button>
          </Link>
          <UserAvatarMenu />
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <DefaultLoading />
        ) : (
          <VisitorList
            guests={visitors || []}
            syncStatuses={syncStatuses}
            onAdd={() => navigate({ to: '/visitors/add' })}
            onEdit={(id) => navigate({ to: '/visitors/add', search: { guestId: id } })}
          />
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
