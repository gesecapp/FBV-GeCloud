import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAppAuth } from '@/hooks/use-app-auth';

/**
 * Layout route para rotas privadas (com autenticação)
 * Redireciona para /app-auth se não estiver autenticado
 */

function PrivateLayout() {
  return (
    <main className="bg-card">
      <Outlet />
    </main>
  );
}

export const Route = createFileRoute('/_private')({
  beforeLoad: async () => {
    const authStore = useAppAuth.getState();

    if (!authStore.isAuthenticated || !authStore.checkTokenValidity()) {
      throw redirect({
        to: '/app-auth',
      });
    }
  },
  component: PrivateLayout,
});
