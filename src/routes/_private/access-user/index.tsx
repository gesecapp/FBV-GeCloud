import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Home, LogOut, User, UserPlus, Users } from 'lucide-react';
import { z } from 'zod';
import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ItemActions, ItemContent, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppAuth } from '@/hooks/use-app-auth';
import { DependentsTab } from './@components/dependents-tab';
import { EditProfileTab } from './@components/edit-profile-tab';
import { VisitorsTab } from './@components/visitors-tab';

const accessUserSearchSchema = z.object({
  tab: z.enum(['edit', 'dependents', 'visitors']).optional().catch('edit'),
});

export const Route = createFileRoute('/_private/access-user/')({
  validateSearch: accessUserSearchSchema,
  beforeLoad: () => {
    const { isAuthenticated } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/app-auth',
      });
    }
  },
  component: AccessUserPage,
  staticData: { title: 'Meus Dados' },
});

function AccessUserPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { clearAuth } = useAppAuth();

  function handleLogout() {
    clearAuth();
    navigate({ to: '/app-auth' });
  }
  const { tab = 'edit' } = Route.useSearch();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E3A5F] p-2 md:p-4">
      <div className="w-full max-w-4xl">
        <Card>
          <CardContent className="flex flex-col gap-6 py-8 md:p-8">
            <ItemContent className="items-center gap-4">
              <img src="/images/logo.svg" alt="Logo" className="h-16 w-auto" />
              <ItemHeader className="w-full">
                <ItemTitle className="text-2xl">Meus Dados</ItemTitle>
                <ItemActions>
                  <ThemeSwitcher />
                  <Button variant="ghost" asChild title="Início">
                    <Link to="/">
                      <Home className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="size-4" />
                  </Button>
                  <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft className="size-4" />
                    Voltar
                  </Button>
                </ItemActions>
              </ItemHeader>
            </ItemContent>

            <Tabs
              value={tab}
              onValueChange={(value) =>
                navigate({
                  search: (prev) => ({ ...prev, tab: value as 'edit' | 'dependents' | 'visitors' }),
                  replace: true,
                })
              }
            >
              <TabsList className="mb-4 justify-between">
                <TabsTrigger value="edit" className="gap-2">
                  <User className="size-4" />
                  Editar Dados
                </TabsTrigger>
                <TabsTrigger value="dependents" className="gap-2">
                  <Users className="size-4" />
                  Dependentes
                </TabsTrigger>
                <TabsTrigger value="visitors" className="gap-2">
                  <UserPlus className="size-4" />
                  Visitantes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <EditProfileTab />
              </TabsContent>
              <TabsContent value="dependents">
                <DependentsTab />
              </TabsContent>
              <TabsContent value="visitors">
                <VisitorsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
