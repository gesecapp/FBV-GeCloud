import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowUpRight, LogOut, UserPlus, Users } from 'lucide-react';
import { ThemeSwitcher } from '@/components/nav-actions/switch-theme';
import { TreeNavigation } from '@/components/tree-navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusIndicator } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { getSyncState, getSyncStateInfo, RegistrationStatusAlert } from '@/components/user-sync-alert';
import { useGetAppUser, useGetUserSyncStatus } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';

export const Route = createFileRoute('/_private/')({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { clearAuth, userId, userType } = useAppAuth();
  const isMorador = userType === 'morador';
  const { data: user } = useGetAppUser();
  const { data: syncStatus, isLoading: isLoadingSync } = useGetUserSyncStatus(userId);

  const firstName = user?.name?.split(' ')[0] || '';

  const syncState = getSyncState(syncStatus, isLoadingSync);
  const syncInfo = getSyncStateInfo(syncState);
  const showStatusIndicator = syncState && syncState !== 'synchronized';

  function handleLogout() {
    clearAuth();
    navigate({ to: '/app-auth' });
  }

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle className="font-normal text-xl tracking-wide">GECLOUD</CardTitle>
        <CardAction>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="size-4" />
              </Button>
              <ThemeSwitcher />
            </div>
            <div className="relative">
              <Avatar className="size-10 border-2 border-primary/20">
                <AvatarImage src={user?.url_image?.[0]} alt={user?.name} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {showStatusIndicator && syncInfo && <StatusIndicator status={syncInfo.statusIndicator} className="absolute top-1 right-1" />}
            </div>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <ItemGroup className="mb-10 items-center">
          <ItemMedia variant="default" className="mb-4 px-20">
            <img src="/images/logo.svg" alt="Gesec Logo" className="h-full w-auto" />
          </ItemMedia>
          <ItemContent className="items-center">
            <ItemTitle className="font-semibold text-4xl">Bem vindo, {firstName}</ItemTitle>
            <div className="mt-1 flex items-baseline gap-2">
              <StatusIndicator status="info" />
              <div className="flex items-baseline gap-1">
                <ItemTitle>Entidade:</ItemTitle>
                <ItemDescription className="text-lg">Fazenda Boa Vista</ItemDescription>
              </div>
            </div>
            {syncState !== null && ['loading', 'queued', 'pending', 'rejected'].includes(syncState) && (
              <RegistrationStatusAlert syncStatus={syncStatus} isLoading={isLoadingSync} linkTo="/access-user" />
            )}
          </ItemContent>
        </ItemGroup>

        <div className="grid grid-cols-2 gap-4">
          <Item variant="outline" className="group h-full items-start hover:bg-secondary">
            <Link to="/access-user" className="flex w-full flex-col no-underline">
              <ItemContent>
                <div className="flex justify-between">
                  <ItemTitle className="font-medium text-base">Editar meu cadastro</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </div>
                <ItemDescription>Atualize seus dados pessoais e de contato.</ItemDescription>
              </ItemContent>
              <ItemGroup aria-hidden className="flex h-16 flex-col justify-center gap-4">
                <div className="h-px w-full bg-sky-500/40"></div>
                <div className="h-px w-full bg-border transition-colors group-hover:bg-sky-500"></div>
              </ItemGroup>
            </Link>
          </Item>

          <Item variant="outline" className="group h-full items-start hover:bg-secondary">
            <Link to="/visitors/add" className="flex w-full flex-col no-underline">
              <ItemContent>
                <div className="flex justify-between">
                  <ItemTitle className="font-medium text-base">Incluir Visitante</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </div>
                <ItemDescription>Registre visitantes para acesso ao condomínio.</ItemDescription>
              </ItemContent>
              <ItemGroup aria-hidden className="pointer-events-none relative flex h-16 items-center justify-center overflow-hidden">
                <div className="absolute size-24 rounded-full border border-border opacity-60"></div>
                <div className="absolute size-16 rounded-full border border-sky-500 opacity-60"></div>
                <div className="absolute size-10 rounded-full border group-hover:border-sky-500"></div>
                <div className="flex size-7 items-center justify-center rounded-full">
                  <Users className="size-4 text-sky-500 group-hover:text-sky-500" />
                </div>
              </ItemGroup>
            </Link>
          </Item>

          {isMorador && (
            <Item variant="outline" className="group h-full items-start hover:bg-secondary">
              <Link to="/dependents/add" className="flex w-full flex-col no-underline">
                <ItemContent>
                  <div className="flex justify-between">
                    <ItemTitle className="font-medium text-base">Incluir Dependente</ItemTitle>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                  </div>
                  <ItemDescription>Cadastre dependentes vinculados ao seu perfil.</ItemDescription>
                </ItemContent>
                <ItemGroup aria-hidden className="pointer-events-none relative flex h-16 items-center justify-center overflow-hidden">
                  <div className="absolute size-24 rounded-full border border-border opacity-40"></div>
                  <div className="absolute size-16 rounded-full border border-border opacity-80 group-hover:border-sky-500"></div>
                  <div className="absolute size-10 rounded-full border border-sky-500"></div>
                  <div className="flex size-7 items-center justify-center rounded-full">
                    <UserPlus className="size-4 text-sky-500" />
                  </div>
                </ItemGroup>
              </Link>
            </Item>
          )}

          <Item variant="outline" className="group h-full items-start hover:bg-secondary">
            <Link to="/visitors" className="flex w-full flex-col no-underline">
              <ItemContent>
                <div className="flex justify-between">
                  <ItemTitle className="font-medium text-base">Meus Visitantes</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </div>
                <ItemDescription>Visualize e gerencie seus visitantes cadastrados.</ItemDescription>
              </ItemContent>
              <div aria-hidden className="flex h-16 items-end justify-between overflow-hidden pb-2 *:w-px *:bg-foreground/15">
                <div style={{ height: '55%' }} className="bg-sky-500!"></div>
                <div style={{ height: '35%' }}></div>
                <div style={{ height: '70%' }} className="bg-sky-500!"></div>
                <div style={{ height: '40%' }}></div>
                <div style={{ height: '60%' }}></div>
                <div style={{ height: '25%' }} className="group-hover:bg-sky-500"></div>
                <div style={{ height: '80%' }} className="group-hover:bg-sky-500"></div>
                <div style={{ height: '45%' }}></div>
                <div style={{ height: '30%' }} className="bg-sky-500!"></div>
                <div style={{ height: '65%' }}></div>
                <div style={{ height: '50%' }} className="group-hover:bg-sky-500"></div>
                <div style={{ height: '40%' }}></div>
                <div style={{ height: '70%' }}></div>
                <div style={{ height: '30%' }}></div>
                <div style={{ height: '90%' }} className="bg-sky-500!"></div>
                <div style={{ height: '55%' }}></div>
                <div style={{ height: '45%' }}></div>
                <div style={{ height: '65%' }} className="group-hover:bg-sky-500"></div>
              </div>
            </Link>
          </Item>

          {isMorador && (
            <Item variant="outline" className="group h-full items-start hover:bg-secondary">
              <Link to="/dependents" className="flex w-full flex-col no-underline">
                <ItemContent>
                  <div className="flex justify-between">
                    <ItemTitle className="font-medium text-base">Meus Dependentes</ItemTitle>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                  </div>
                  <ItemDescription>Visualize e gerencie seus dependentes cadastrados.</ItemDescription>
                </ItemContent>
                <ItemGroup aria-hidden className="pointer-events-none relative flex h-16 items-center justify-center overflow-hidden">
                  <div className="absolute size-24 rounded-full border border-border opacity-40"></div>
                  <div className="absolute size-16 rounded-full border border-border opacity-80 group-hover:border-sky-500"></div>
                  <div className="absolute size-10 rounded-full border border-sky-500"></div>
                  <div className="flex size-7 items-center justify-center rounded-full">
                    <Users className="size-4 text-sky-500" />
                  </div>
                </ItemGroup>
              </Link>
            </Item>
          )}

          <Item variant="outline" className="group h-full items-start hover:bg-secondary">
            <Link to="/sync-status" className="flex w-full flex-col no-underline">
              <ItemContent>
                <div className="flex justify-between">
                  <ItemTitle className="font-medium text-base">Status de Sincronização</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </div>
                <ItemDescription>Acompanhe o estado de sincronização dos seus dados.</ItemDescription>
              </ItemContent>
              <ItemGroup aria-hidden className="relative flex h-16 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 mx-auto w-0.5 bg-foreground/15"></div>
                <div className="absolute -inset-x-8 top-2 aspect-square rounded-full border group-hover:border-sky-500"></div>
                <div className="mask-l-from-50% mask-l-to-90% mask-r-from-50% mask-r-to-50% absolute -inset-x-8 top-2 aspect-square rounded-full border border-sky-500"></div>
                <div className="absolute -inset-x-4 top-8 aspect-square rounded-full border"></div>
                <div className="mask-r-from-50% mask-r-to-90% mask-l-from-50% mask-l-to-50% absolute -inset-x-4 top-8 aspect-square rounded-full border border-sky-500"></div>
              </ItemGroup>
            </Link>
          </Item>
        </div>
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
