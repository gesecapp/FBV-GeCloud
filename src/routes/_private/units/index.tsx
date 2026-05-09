import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Building2, Home, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppAuth } from '@/hooks/use-app-auth';
import { getUserPermissions } from '@/lib/permissions';
import { useSearchUnits } from '@/routes/_private/units/@hooks/use-search-units';
import { useAssignUnits, useUnits } from '@/routes/_private/units/@hooks/use-units';
import type { Unit } from '@/routes/_private/units/@interface/unit.interface';

export const Route = createFileRoute('/_private/units/')({
  beforeLoad: () => {
    const { isAuthenticated, userType } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({ to: '/app-auth' });
    }

    if (!getUserPermissions(userType).canViewUnits) {
      throw redirect({ to: '/' });
    }
  },
  component: UnitsPage,
  staticData: { title: 'Unidades' },
});

function UnitsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { units, currentUnit, isLoading } = useUnits();

  const hasUnits = units.length > 0;

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Unidades</CardTitle>
        <CardAction>
          <Button size={'sm'} onClick={() => navigate({ to: '/' })}>
            <Home className="size-4" />
          </Button>
          <UserAvatarMenu />
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <DefaultLoading />
        ) : (
          <ItemGroup className="gap-6">
            {hasUnits ? (
              <>
                <Item variant="default" className="items-start">
                  <ItemMedia variant="icon" className="size-12 rounded-md bg-muted">
                    <Building2 className="size-5 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="font-medium text-lg">Sua unidade vinculada</ItemTitle>
                    <ItemDescription>{formatUnitTitle(currentUnit)}</ItemDescription>
                    {currentUnit?.type && <Badge variant="info">{getUnitTypeLabel(currentUnit.type)}</Badge>}
                  </ItemContent>
                </Item>

                <ItemGroup className="gap-4">
                  <ItemHeader>
                    <ItemContent>
                      <ItemTitle className="text-lg">Unidades vinculadas</ItemTitle>
                      <ItemDescription>Listagem das unidades associadas ao seu usuário.</ItemDescription>
                    </ItemContent>
                  </ItemHeader>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Bloco</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {units.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.identifier}</TableCell>
                          <TableCell>{unit.block || '-'}</TableCell>
                          <TableCell>{getUnitTypeLabel(unit.type)}</TableCell>
                          <TableCell>{unit.description || unit.address || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ItemGroup>
              </>
            ) : (
              <UnitAssignment />
            )}
          </ItemGroup>
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}

function UnitAssignment() {
  const [term, setTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const { results, isLoading } = useSearchUnits(submittedTerm);
  const assign = useAssignUnits();

  function handleSearch() {
    setSubmittedTerm(term.trim());
  }

  function handleAssign(unitId: string) {
    assign.mutate([unitId], {
      onSuccess: () => {
        toast.success('Unidade vinculada com sucesso!');
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao vincular unidade.';
        toast.error(message);
      },
    });
  }

  return (
    <Item variant="default" className="items-start">
      <ItemContent className="gap-3">
        <ItemHeader>
          <ItemContent>
            <ItemTitle>Selecionar unidade</ItemTitle>
            <ItemDescription>Você ainda não possui unidade vinculada. Busque pelo identificador e selecione a sua.</ItemDescription>
          </ItemContent>
        </ItemHeader>

        <ItemContent className="gap-2">
          <Label htmlFor="unit-search">Identificador da unidade</Label>
          <ItemContent className="flex-row gap-2">
            <Input
              id="unit-search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Ex.: 101"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSearch();
                }
              }}
            />
            <Button type="button" onClick={handleSearch} disabled={!term.trim() || isLoading}>
              <Search className="size-4" />
              Buscar
            </Button>
          </ItemContent>
        </ItemContent>

        {submittedTerm && (
          <ItemGroup className="gap-2">
            {isLoading ? (
              <DefaultLoading />
            ) : results.length === 0 ? (
              <Item variant="default">
                <ItemContent>
                  <ItemDescription>Nenhuma unidade encontrada para "{submittedTerm}".</ItemDescription>
                </ItemContent>
              </Item>
            ) : (
              results.map((unit) => (
                <Item key={unit.id} variant="default">
                  <ItemContent>
                    <ItemTitle>{unit.identifier}</ItemTitle>
                    {unit.block && <ItemDescription>Bloco {unit.block}</ItemDescription>}
                  </ItemContent>
                  <Button size="sm" onClick={() => handleAssign(unit.id)} disabled={assign.isPending}>
                    Vincular
                  </Button>
                </Item>
              ))
            )}
          </ItemGroup>
        )}
      </ItemContent>
    </Item>
  );
}

function formatUnitTitle(unit?: Unit) {
  if (!unit) return 'Nenhuma unidade vinculada';
  return [unit.identifier, unit.block].filter(Boolean).join(' - ');
}

function getUnitTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    commercial: 'Comercial',
  };

  return type ? (labels[type] ?? type) : '-';
}
