import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Building2, Home, Users } from 'lucide-react';
import { useMemo } from 'react';
import DefaultEmptyData from '@/components/default-empty-data';
import DefaultLoading from '@/components/default-loading';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataSelect, type DataSelectOption } from '@/components/ui/data-select';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUnits } from '@/routes/_private/units/@hooks/use-units';
import type { Unit } from '@/routes/_private/units/@interface/unit.interface';

export const Route = createFileRoute('/_private/units/')({
  component: UnitsPage,
  staticData: { title: 'Unidades' },
});

function UnitsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { units, currentUnit, isLoading } = useUnits();

  const unitOptions = useMemo<DataSelectOption<Unit>[]>(
    () =>
      units.map((unit) => ({
        value: unit.id,
        label: formatUnitTitle(unit),
        data: unit,
      })),
    [units],
  );

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
            {units.length === 0 ? (
              <DefaultEmptyData />
            ) : (
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
            )}

            <Item variant="default" className="items-start opacity-60">
              <ItemContent className="gap-3">
                <ItemHeader>
                  <ItemContent>
                    <ItemTitle>Selecionar unidade</ItemTitle>
                    <ItemDescription>Processo desabilitado temporariamente.</ItemDescription>
                  </ItemContent>
                </ItemHeader>

                <ItemContent className="gap-2">
                  <Label htmlFor="unit-select">Unidade</Label>
                  <DataSelect
                    id="unit-select"
                    value={currentUnit?.id}
                    onChange={() => undefined}
                    options={unitOptions}
                    placeholder="Processo desabilitado"
                    searchPlaceholder="Buscar unidade..."
                    noOptionsMessage="Nenhuma unidade disponível."
                    noResultsMessage="Nenhuma unidade encontrada."
                    disabled
                  />
                </ItemContent>
              </ItemContent>
            </Item>

            <ItemGroup className="gap-4 opacity-60">
              <ItemHeader>
                <ItemContent>
                  <ItemTitle className="text-lg">Usuários vinculados</ItemTitle>
                  <ItemDescription>Processo desabilitado temporariamente.</ItemDescription>
                </ItemContent>
                <Badge variant="secondary">
                  <Users className="size-3" />0 usuários
                </Badge>
              </ItemHeader>
            </ItemGroup>
          </ItemGroup>
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
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
