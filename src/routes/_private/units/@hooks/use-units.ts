import { useMemo } from 'react';
import type { Unit, UnitUser } from '@/routes/_private/units/@interface/unit.interface';

const mockUnits: Unit[] = [
  {
    id: 'unit-101',
    name: 'Apto 101',
    block: 'Bloco A',
    entityName: 'Fazenda Boa Vista',
    isCurrentUserLinked: true,
  },
  {
    id: 'unit-204',
    name: 'Apto 204',
    block: 'Bloco B',
    entityName: 'Fazenda Boa Vista',
    isCurrentUserLinked: false,
  },
  {
    id: 'unit-305',
    name: 'Casa 305',
    block: 'Vilas',
    entityName: 'Fazenda Boa Vista',
    isCurrentUserLinked: false,
  },
];

const mockUsers: UnitUser[] = [
  {
    id: 'user-current',
    unitId: 'unit-101',
    name: 'Usuário Atual',
    cpf: '11122233344',
    email: 'usuario.atual@email.com',
    relationship: 'Morador',
    status: 'active',
    birthday: '1988-04-18',
    isCurrentUser: true,
  },
  {
    id: 'user-mariana',
    unitId: 'unit-101',
    name: 'Mariana Costa',
    cpf: '12345678900',
    email: 'mariana.costa@email.com',
    relationship: 'Dependente',
    status: 'active',
    birthday: '2010-05-10',
    isCurrentUser: false,
  },
  {
    id: 'user-pedro',
    unitId: 'unit-101',
    name: 'Pedro Silva',
    cpf: '98765432111',
    email: 'pedro.silva@email.com',
    relationship: 'Dependente',
    status: 'pending',
    birthday: '2012-08-15',
    isCurrentUser: false,
  },
  {
    id: 'user-renata',
    unitId: 'unit-204',
    name: 'Renata Almeida',
    cpf: '22233344455',
    email: 'renata.almeida@email.com',
    relationship: 'Moradora',
    status: 'active',
    birthday: '1991-11-02',
    isCurrentUser: false,
  },
  {
    id: 'user-carlos',
    unitId: 'unit-305',
    name: 'Carlos Mendes',
    cpf: '33344455566',
    email: 'carlos.mendes@email.com',
    relationship: 'Proprietário',
    status: 'active',
    birthday: '1979-01-23',
    isCurrentUser: false,
  },
];

export function useUnits() {
  return useMemo(() => {
    const currentUnit = mockUnits.find((unit) => unit.isCurrentUserLinked) ?? mockUnits[0];

    return {
      units: mockUnits,
      users: mockUsers,
      currentUnit,
      isLoading: false,
    };
  }, []);
}
