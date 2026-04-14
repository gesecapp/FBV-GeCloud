import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppAuth } from '@/hooks/use-app-auth';
import { ProfileForm } from './@components/profile-form';

export const Route = createFileRoute('/_private/access-user/')({
  beforeLoad: () => {
    const { isAuthenticated } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/app-auth',
      });
    }
  },
  component: AccessUserPage,
  staticData: { title: 'Editar Perfil' },
});

function AccessUserPage() {
  const navigate = useNavigate();

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardAction>
          <Button size={'sm'} onClick={() => navigate({ to: '/' })}>
            <Home className="size-4" />
          </Button>
          <UserAvatarMenu />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ProfileForm />
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
