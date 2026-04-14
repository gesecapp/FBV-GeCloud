import type { LucideIcon } from 'lucide-react';

// Mapeamento de icones por segmento de rota
export const ROUTE_ICONS: Record<string, LucideIcon> = {};

// Icones para sub-rotas especificas
export const SUB_ROUTE_ICONS: Record<string, LucideIcon> = {};

// Labels de exibição para cada segmento de rota
export const ROUTE_LABELS: Record<string, string> = {
  'access-user': 'Meu Cadastro',
  'add-dependent': 'Incluir Dependente',
  'add-visitor': 'Incluir Visitante',
  'sync-status': 'Status de Sincronização',
};

/**
 * Lista de rotas principais da aplicacao.
 */
export const MAIN_ROUTES = ['/access-user', '/add-dependent', '/add-visitor', '/sync-status'] as const;

export type MainRoute = (typeof MAIN_ROUTES)[number];
