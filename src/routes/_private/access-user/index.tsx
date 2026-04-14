import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
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
  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardAction>
          <Link to="/">
            <Home className="size-4" />
          </Link>
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
