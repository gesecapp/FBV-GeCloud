import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ChevronRight, FileUser, LogOut, SquarePen, UserPlus, Users } from 'lucide-react';
import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusIndicator } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <Card className="min-h-screen border-none p-8">
      <Item className="flex items-center justify-between">
        <ItemTitle className="font-normal text-xl tracking-wide">GECLOUD</ItemTitle>
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
      </Item>

      <ItemGroup className="mx-auto w-full max-w-md flex-1 items-center justify-center">
        <ItemGroup className="mb-12 items-center">
          <ItemMedia variant="default" className="px-20 md:mb-10">
            <img src="/images/logo.svg" alt="Gesec Logo" className="h-full w-auto" />
          </ItemMedia>
          <ItemContent className="items-center">
            <ItemTitle className="font-semibold text-4xl">Bem vindo, {firstName}</ItemTitle>
            <div className="flex items-baseline gap-2">
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

        <ItemGroup className="w-full gap-4">
          <Link to="/access-user" className="no-underline">
            <Item className="items-center rounded-lg bg-secondary transition-colors hover:bg-muted">
              <ItemMedia variant="icon" className="size-12 rounded-md bg-muted">
                <SquarePen className="size-5 text-sky-400" />
              </ItemMedia>
              <ItemContent className="ml-4 justify-center">
                <ItemTitle className="font-semibold text-lg">Editar meu cadastro</ItemTitle>
              </ItemContent>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Item>
          </Link>

          {isMorador && (
            <Link to="/add-dependent" className="no-underline">
              <Item className="items-center rounded-lg bg-secondary transition-colors hover:bg-muted">
                <ItemMedia variant="icon" className="size-12 rounded-md bg-muted">
                  <UserPlus className="size-5 text-sky-400" />
                </ItemMedia>
                <ItemContent className="ml-4 justify-center">
                  <ItemTitle className="font-semibold text-lg">Incluir Dependente</ItemTitle>
                </ItemContent>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Item>
            </Link>
          )}

          <Link to="/add-visitor" className="no-underline">
            <Item className="items-center rounded-lg bg-secondary transition-colors hover:bg-muted">
              <ItemMedia variant="icon" className="size-12 rounded-md bg-muted">
                <FileUser className="size-5 text-sky-400" />
              </ItemMedia>
              <ItemContent className="ml-4 justify-center">
                <ItemTitle className="font-semibold text-lg">Incluir Visitante</ItemTitle>
              </ItemContent>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Item>
          </Link>

          <Link to="/access-user" search={{ tab: 'visitors' }} className="no-underline">
            <Item className="items-center rounded-lg bg-secondary transition-colors hover:bg-muted">
              <ItemMedia variant="icon" className="size-12 rounded-md bg-muted">
                <Users className="size-5 text-sky-400" />
              </ItemMedia>
              <ItemContent className="ml-4 justify-center">
                <ItemTitle className="font-semibold text-lg">Meus Visitantes</ItemTitle>
              </ItemContent>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Item>
          </Link>
        </ItemGroup>
      </ItemGroup>
    </Card>
  );
}
