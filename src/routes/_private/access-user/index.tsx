import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { Home, LogOut } from 'lucide-react';
import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppAuth } from '@/hooks/use-app-auth';
import { EditProfileTab } from './@components/edit-profile-tab';

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
  const navigate = useNavigate({ from: Route.fullPath });
  const { clearAuth } = useAppAuth();

  function handleLogout() {
    clearAuth();
    navigate({ to: '/app-auth' });
  }

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardAction>
          <ThemeSwitcher />
          <Button variant="ghost" asChild title="Início">
            <Link to="/">
              <Home className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout} title="Sair">
            <LogOut className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <EditProfileTab />
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
