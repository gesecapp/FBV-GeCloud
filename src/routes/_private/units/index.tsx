import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Building2, Home, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { applyCpfMask } from '@/lib/masks';
import { useUnits } from '@/routes/_private/units/@hooks/use-units';
import type { Unit } from '@/routes/_private/units/@interface/unit.interface';

export const Route = createFileRoute('/_private/units/')({
  component: UnitsPage,
  staticData: { title: 'Unidades' },
});

function UnitsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { units, users, currentUnit, isLoading } = useUnits();
  const [selectedUnitId, setSelectedUnitId] = useState(currentUnit.id);

  const unitOptions = useMemo<DataSelectOption<Unit>[]>(
    () =>
      units.map((unit) => ({
        value: unit.id,
        label: `${unit.name} - ${unit.block}`,
        data: unit,
      })),
    [units],
  );

  const selectedUnit = useMemo(() => units.find((unit) => unit.id === selectedUnitId) ?? currentUnit, [units, selectedUnitId, currentUnit]);

  const linkedUsers = useMemo(() => users.filter((user) => user.unitId === selectedUnit.id && !user.isCurrentUser), [users, selectedUnit.id]);

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
            <Item variant="default" className="items-start">
              <ItemMedia variant="icon" className="size-12 rounded-md bg-muted">
                <Building2 className="size-5 text-muted-foreground" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="font-medium text-lg">Sua unidade vinculada</ItemTitle>
                <ItemDescription>
                  {currentUnit.name} - {currentUnit.block}
                </ItemDescription>
                <Badge variant="info">{currentUnit.entityName}</Badge>
              </ItemContent>
            </Item>

            <Item variant="default" className="items-start">
              <ItemContent className="gap-3">
                <ItemHeader>
                  <ItemContent>
                    <ItemTitle>Selecionar unidade</ItemTitle>
                    <ItemDescription>Escolha uma unidade para visualizar os usuários vinculados.</ItemDescription>
                  </ItemContent>
                </ItemHeader>

                <ItemContent className="gap-2">
                  <Label htmlFor="unit-select">Unidade</Label>
                  <DataSelect
                    id="unit-select"
                    value={selectedUnitId}
                    onChange={(value) => {
                      if (typeof value === 'string') {
                        setSelectedUnitId(value);
                      }
                    }}
                    options={unitOptions}
                    placeholder="Selecione uma unidade"
                    searchPlaceholder="Buscar unidade..."
                    noOptionsMessage="Nenhuma unidade disponível."
                    noResultsMessage="Nenhuma unidade encontrada."
                  />
                </ItemContent>
              </ItemContent>
            </Item>

            <ItemGroup className="gap-4">
              <ItemHeader>
                <ItemContent>
                  <ItemTitle className="text-lg">Usuários vinculados</ItemTitle>
                  <ItemDescription>
                    {selectedUnit.name} - {selectedUnit.block}
                  </ItemDescription>
                </ItemContent>
                <Badge variant="secondary">
                  <Users className="size-3" />
                  {linkedUsers.length} usuários
                </Badge>
              </ItemHeader>

              {linkedUsers.length === 0 ? (
                <DefaultEmptyData />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Nascimento</TableHead>
                      <TableHead>Vínculo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linkedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{applyCpfMask(user.cpf)}</TableCell>
                        <TableCell>{new Date(user.birthday).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{user.relationship}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'success' : 'pending'}>{user.status === 'active' ? 'Ativo' : 'Pendente'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
