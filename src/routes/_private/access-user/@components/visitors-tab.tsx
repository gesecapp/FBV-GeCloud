import { useNavigate } from '@tanstack/react-router';
import DefaultLoading from '@/components/default-loading';
import { useGetAllSyncStatuses, useGetGuestsByParent } from '../@hooks/use-access-user-api';
import { VisitorList } from './visitor-list';

export function VisitorsTab() {
  const navigate = useNavigate();
  const { data: visitors, isLoading } = useGetGuestsByParent('visitante');
  const { data: syncStatuses } = useGetAllSyncStatuses();

  if (isLoading) return <DefaultLoading />;

  return (
    <VisitorList
      guests={visitors || []}
      syncStatuses={syncStatuses}
      onAdd={() => navigate({ to: '/add-visitor' })}
      onEdit={(id) => {
        navigate({
          to: '/add-visitor',
          search: { guestId: id },
        });
      }}
    />
  );
}
