import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Home, LogOut, RefreshCw, ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react';
import EmptyData from '@/components/default-empty-data';
import DefaultLoading from '@/components/default-loading';
import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { TreeNavigation } from '@/components/tree-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useGetUserSyncStatusManual } from '@/routes/_private/sync-status/@hooks/use-sync-status-manual';

export const Route = createFileRoute('/_private/sync-status/')({
  component: SyncStatusPage,
});

function SyncStatusPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { clearAuth, userId } = useAppAuth();
  const { data: syncStatus, isLoading, isFetching, refetch } = useGetUserSyncStatusManual(userId);

  const sensors = syncStatus?.sync_status?.sensors ?? [];

  function handleLogout() {
    clearAuth();
    navigate({ to: '/app-auth' });
  }

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Status de Sincronização</CardTitle>
        <CardAction>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <ThemeSwitcher />
          <Button variant="ghost" asChild title="Início">
            <Link to="/">
              <Home className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
            <LogOut className="size-4" />
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <DefaultLoading />
        ) : sensors.length === 0 ? (
          <EmptyData />
        ) : (
          <ItemGroup className="w-full gap-4">
            {sensors.map((sensor) => {
              const isRegistered = sensor.registered;
              const isImageAccepted = sensor.image_accepted === true;
              const lastSync = sensor.last_sync_at ? format(new Date(sensor.last_sync_at), 'dd MM yyyy HH:mm', { locale: ptBR }) : null;

              return (
                <Item key={sensor.sensorId} className="items-center rounded-lg bg-secondary p-4 transition-colors hover:bg-muted">
                  <ItemMedia variant="icon" className="size-12 rounded-md bg-muted">
                    {isRegistered ? <UserCheck className="size-5 text-emerald-400" /> : <UserX className="size-5 text-red-400" />}
                  </ItemMedia>

                  <ItemContent className="flex-1 justify-center">
                    <div>
                      <ItemTitle className="font-semibold text-lg">{sensor.sensorName}</ItemTitle>
                      {lastSync && (
                        <div className="flex gap-2">
                          <ItemDescription className="text-sm">Última sincronização:</ItemDescription>
                          <ItemTitle className="text-xs">{lastSync}</ItemTitle>
                        </div>
                      )}
                    </div>

                    <ItemGroup>
                      <Badge variant={isRegistered ? 'success' : 'error'} className="p-2">
                        {isRegistered ? <UserCheck className="size-3" /> : <UserX className="size-3" />}
                        {isRegistered ? 'Cadastrado' : 'Não cadastrado'}
                      </Badge>

                      <Badge variant={isImageAccepted ? 'success' : sensor.image_accepted === false ? 'error' : 'neutral'} className="p-2">
                        {isImageAccepted ? <ShieldCheck className="size-3" /> : <ShieldOff className="size-3" />}
                        {isImageAccepted ? 'Imagem aceita' : sensor.image_accepted === false ? 'Imagem rejeitada' : 'Imagem pendente'}
                      </Badge>
                    </ItemGroup>
                  </ItemContent>
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
