import { useMemo } from 'react';
import { useAppAuth } from '@/hooks/use-app-auth';
import { type AppUserType, getUserPermissions, isAppUserType, type UserPermissions } from '@/lib/permissions';

export interface UseUserPermissionsResult {
  userType: AppUserType | null;
  permissions: UserPermissions;
}

export function useUserPermissions(): UseUserPermissionsResult {
  const userType = useAppAuth((state) => state.userType);

  return useMemo(
    () => ({
      userType: isAppUserType(userType) ? userType : null,
      permissions: getUserPermissions(userType),
    }),
    [userType],
  );
}
