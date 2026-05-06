export interface Unit {
  id: string;
  name: string;
  block: string;
  entityName: string;
  isCurrentUserLinked: boolean;
}

export interface UnitUser {
  id: string;
  unitId: string;
  name: string;
  document: string;
  email: string;
  relationship: string;
  status: 'active' | 'pending';
  birthday: string;
  isCurrentUser: boolean;
}
