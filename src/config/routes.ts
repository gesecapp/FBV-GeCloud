import type { LucideIcon } from 'lucide-react';
import type { FileRoutesByTo } from '@/routeTree.gen';

export interface SidebarRoute {
  id: string;
  path: string;
  labelKey: string;
  icon?: LucideIcon;
  children?: SidebarRoute[];
}

// Mapeamento de icones por segmento de rota
export const ROUTE_ICONS: Record<string, LucideIcon> = {};

// Icones para sub-rotas especificas
export const SUB_ROUTE_ICONS: Record<string, LucideIcon> = {};

// Labels de exibição para cada segmento de rota
export const ROUTE_LABELS: Record<string, string> = {
  'access-user': 'Meu Cadastro',
  'sync-status': 'Status de Sincronização',
  visitors: 'Meus Visitantes',
  dependents: 'Meus Dependentes',
  add: 'Adicionar',
};

// Rotas privadas de navegação, validadas contra o routeTree.gen.ts
const NAV_PATHS = ['/access-user', '/sync-status', '/visitors', '/visitors/add', '/dependents', '/dependents/add'] satisfies Array<keyof FileRoutesByTo>;

function groupBySection(paths: typeof NAV_PATHS): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const path of paths) {
    const section = path.split('/').filter(Boolean)[0];
    if (!groups[section]) groups[section] = [];
    groups[section].push(path);
  }
  return groups;
}

export function buildNavRoutes(): SidebarRoute[] {
  const grouped = groupBySection(NAV_PATHS);
  const routes: SidebarRoute[] = [];

  for (const [section, paths] of Object.entries(grouped)) {
    if (paths.length === 1 && paths[0] === `/${section}`) {
      routes.push({
        id: section,
        path: paths[0],
        labelKey: ROUTE_LABELS[section] ?? section,
        icon: ROUTE_ICONS[section],
      });
      continue;
    }

    const children: SidebarRoute[] = paths.map((path) => {
      const segments = path.split('/').filter(Boolean);
      const childName = segments[1] ?? section;
      return {
        id: `${section}-${childName}`,
        path,
        labelKey: ROUTE_LABELS[childName] ?? childName,
        icon: SUB_ROUTE_ICONS[childName],
      };
    });

    routes.push({
      id: section,
      path: `/${section}`,
      labelKey: ROUTE_LABELS[section] ?? section,
      icon: ROUTE_ICONS[section],
      children,
    });
  }

  return routes;
}
