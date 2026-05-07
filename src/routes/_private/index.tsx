import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Building2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { StatusIndicator } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { getSyncState, getSyncStateInfo, RegistrationStatusAlert } from '@/components/user-sync-alert';
import { useGetAppUser, useGetUserSyncStatus } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useUserPermissions } from '@/hooks/use-user-permissions';

export const Route = createFileRoute('/_private/')({
  component: DashboardPage,
});

function DashboardCardIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <ItemGroup aria-hidden className="pointer-events-none flex h-16 items-center justify-center overflow-hidden">
      <div className="dashboard-card-illustration" role="img" aria-label={alt} style={{ '--dashboard-card-icon': `url("${src}")` } as CSSProperties} />
    </ItemGroup>
  );
}

function DashboardPage() {
  const { userId } = useAppAuth();
  const { permissions } = useUserPermissions();
  const { data: user } = useGetAppUser();
  const { data: syncStatus, isLoading: isLoadingSync } = useGetUserSyncStatus(userId);

  const firstName = user?.name?.split(' ')[0] || '';

  const syncState = getSyncState(syncStatus, isLoadingSync);
  const syncInfo = getSyncStateInfo(syncState);
  const badgeStatus = syncState && syncState !== 'synchronized' && syncInfo ? syncInfo.statusIndicator : undefined;

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>
          <img src="/images/logo.svg" alt="Gesec Logo" className="h-11 w-auto" />
        </CardTitle>
        <CardAction>
          <UserAvatarMenu badgeStatus={badgeStatus} />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ItemGroup className="items-center">
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
          {permissions.canEditOwnProfile && (
            <Item variant="default" className="group h-full items-stretch hover:bg-secondary">
              <Link to="/access-user" className="flex h-full w-full flex-col justify-between no-underline">
                <ItemContent className="flex-row items-start justify-between">
                  <ItemTitle className="font-medium text-base">Meu cadastro</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </ItemContent>
                <DashboardCardIcon src="/images/clipboard-pencil-svgrepo-com.svg" alt="Editar cadastro" />
              </Link>
            </Item>
          )}

          {permissions.canManageVisitors && (
            <Item variant="default" className="group h-full items-stretch hover:bg-secondary">
              <Link to="/visitors/add" className="flex h-full w-full flex-col justify-between no-underline">
                <ItemContent>
                  <ItemContent className="flex-row justify-between">
                    <ItemTitle className="font-medium text-base">Incluir Visitante</ItemTitle>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                  </ItemContent>
                </ItemContent>
                <DashboardCardIcon src="/images/person-silhouette-plus-svgrepo-com.svg" alt="Incluir visitante" />
              </Link>
            </Item>
          )}

          {permissions.canManageDependents && (
            <Item variant="default" className="group h-full items-stretch hover:bg-secondary">
              <Link to="/dependents/add" className="flex h-full w-full flex-col justify-between no-underline">
                <ItemContent className="flex-row justify-between">
                  <ItemTitle className="font-medium text-base">Incluir Dependente</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </ItemContent>
                <DashboardCardIcon src="/images/person-connections-svgrepo-com.svg" alt="Incluir dependente" />
              </Link>
            </Item>
          )}

          {permissions.canManageVisitors && (
            <Item variant="default" className="group h-full items-stretch hover:bg-secondary">
              <Link to="/visitors" className="flex h-full w-full flex-col justify-between no-underline">
                <ItemContent className="flex-row justify-between">
                  <ItemTitle className="font-medium text-base">Meus Visitantes</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </ItemContent>
                <DashboardCardIcon src="/images/people-group-svgrepo-com.svg" alt="Meus visitantes" />
              </Link>
            </Item>
          )}

          {permissions.canViewUnits && (
            <Item variant="default" className="group h-full items-stretch hover:bg-secondary">
              <Link to="/units" className="flex h-full w-full flex-col justify-between no-underline">
                <ItemContent className="flex-row justify-between">
                  <ItemTitle className="font-medium text-base">Unidades</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </ItemContent>
                <ItemGroup aria-hidden className="pointer-events-none flex h-16 items-center justify-center overflow-hidden">
                  <Building2 className="size-12 text-muted-foreground transition-all group-hover:text-sky-500" />
                </ItemGroup>
              </Link>
            </Item>
          )}

          {permissions.canManageDependents && (
            <Item variant="default" className="group h-full items-stretch hover:bg-secondary">
              <Link to="/dependents" className="flex h-full w-full flex-col justify-between no-underline">
                <ItemContent className="flex-row justify-between">
                  <ItemTitle className="font-medium text-base">Meus Dependentes</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </ItemContent>
                <DashboardCardIcon src="/images/couple-alt-svgrepo-com.svg" alt="Meus dependentes" />
              </Link>
            </Item>
          )}

          {permissions.canViewSyncStatus && (
            <Item variant="default" className="group h-full items-stretch hover:bg-secondary">
              <Link to="/sync-status" className="flex h-full w-full flex-col justify-between no-underline">
                <ItemContent className="flex-row justify-between">
                  <ItemTitle className="font-medium text-base">Sincronizações</ItemTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:stroke-sky-500" />
                </ItemContent>
                <DashboardCardIcon src="/images/sync-circle-sharp-svgrepo-com.svg" alt="Status de sincronização" />
              </Link>
            </Item>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <TreeNavigation hideMenu showLogout />
      </CardFooter>
    </Card>
  );
}
