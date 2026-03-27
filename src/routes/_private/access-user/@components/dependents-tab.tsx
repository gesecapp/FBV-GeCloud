import { useNavigate } from '@tanstack/react-router';
import DefaultLoading from '@/components/default-loading';
import { useGetAllSyncStatuses, useGetGuestsByParent } from '@/hooks/use-access-user-api';
import { DependentList } from './dependent-list';

export function DependentsTab() {
  const navigate = useNavigate();
  const { data: dependents, isLoading } = useGetGuestsByParent('dependente');
  const { data: syncStatuses } = useGetAllSyncStatuses();

  if (isLoading) return <DefaultLoading />;

  return (
    <DependentList
      guests={dependents || []}
      syncStatuses={syncStatuses}
      onAdd={() => navigate({ to: '/add-dependent' })}
      onEdit={(id) => {
        navigate({
          to: '/add-dependent',
          search: { guestId: id },
        });
      }}
    />
  );
}
