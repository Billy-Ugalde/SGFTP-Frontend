import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config/env';
import type { AuditPaginatedResponse, AuditStats, AuditFilters } from '../Types/audit.types';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ── Llamadas al API ───────────────────────────────────────────────────────────

const fetchAuditLogs = async (filters: Partial<AuditFilters>): Promise<AuditPaginatedResponse> => {
  const params: Record<string, unknown> = {};
  if (filters.entity)    params.entity    = filters.entity;
  if (filters.action)    params.action    = filters.action;
  if (filters.search)    params.search    = filters.search;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to)   params.date_to   = filters.date_to;
  params.page  = filters.page  ?? 1;
  params.limit = filters.limit ?? 9;

  const { data } = await client.get('/audit', { params });
  return data;
};

const fetchAuditStats = async (): Promise<AuditStats> => {
  const { data } = await client.get('/audit/stats');
  return data;
};

// ── Descarga directa del PDF (no es un hook, abre el archivo) ─────────────────

export const downloadAuditPdf = async (filters: Partial<AuditFilters>): Promise<void> => {
  const params: Record<string, unknown> = {};
  if (filters.entity)    params.entity    = filters.entity;
  if (filters.action)    params.action    = filters.action;
  if (filters.search)    params.search    = filters.search;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to)   params.date_to   = filters.date_to;

  const response = await client.get('/audit/pdf', { params, responseType: 'blob' });

  const url  = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href  = url;
  link.download = `Auditoria_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// ── Hooks React Query ─────────────────────────────────────────────────────────

export const AUDIT_MODULES = [
  'Usuarios', 'Emprendedores', 'Ferias', 'Proyectos',
  'Actividades', 'Voluntarios', 'Noticias', 'Contenido',
  'Suscriptores', 'Donaciones', 'Newsletters',
];

export const AUDIT_ACTIONS = [
  'INSERT', 'UPDATE', 'STATUS_CHANGE',
  'ROLE_ASSIGNED', 'ROLE_REMOVED',
  'DELETE',
];

export const AUDIT_ACTIONS_LABELS: Record<string, string> = {
  INSERT:           'Creación',
  UPDATE:           'Edición',
  STATUS_CHANGE:    'Cambio de estado',
  ROLE_ASSIGNED:    'Asignación de rol',
  ROLE_REMOVED:     'Remoción de rol',
  DELETE:           'Eliminación',
};

export const ENTITY_TO_MODULE: Record<string, string> = {
  users:                'Usuarios',
  entrepreneurs:        'Emprendedores',
  entrepreneurships:    'Emprendedores',
  fair:                 'Ferias',
  fair_enrollment:      'Ferias',
  project:              'Proyectos',
  activity:             'Actividades',
  activity_enrollment:  'Actividades',
  volunteers:           'Voluntarios',
  news:                 'Noticias',
  content_blocks:       'Contenido',
  subscriber:           'Suscriptores',
  donation:             'Donaciones',
  newsletter_campaigns: 'Newsletters',
};

export const useAuditLogs = (filters: Partial<AuditFilters>) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn:  () => fetchAuditLogs(filters),
  });
};

export const useAuditStats = () => {
  return useQuery({
    queryKey: ['audit-stats'],
    queryFn:  fetchAuditStats,
    staleTime: 30_000,
  });
};
