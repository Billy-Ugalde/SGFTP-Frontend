import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config/env';
import type { AuditPaginatedResponse, AuditStats, AuditFilters } from '../Types/audit.types';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ── Llamadas al API ───────────────────────────────────────────────────────────

const resolveDates = (filters: Partial<AuditFilters>) => {
  const from = filters.date_from || filters.date_to || undefined;
  const to   = filters.date_to   || filters.date_from || undefined;
  return { date_from: from, date_to: to };
};

const fetchAuditLogs = async (filters: Partial<AuditFilters>): Promise<AuditPaginatedResponse> => {
  const params: Record<string, unknown> = {};
  if (filters.entity)    params.entity    = filters.entity;
  if (filters.action)    params.action    = filters.action;
  if (filters.user_role) params.user_role = filters.user_role;
  if (filters.search)    params.search    = filters.search;
  params.page  = filters.page  ?? 1;
  params.limit = filters.limit ?? 9;

  const { date_from, date_to } = resolveDates(filters);
  if (date_from) params.date_from = date_from;
  if (date_to)   params.date_to   = date_to;

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
  if (filters.user_role) params.user_role = filters.user_role;
  if (filters.search)    params.search    = filters.search;

  const { date_from, date_to } = resolveDates(filters);
  if (date_from) params.date_from = date_from;
  if (date_to)   params.date_to   = date_to;

  const response = await client.get('/audit/pdf', { params, responseType: 'blob' });

  const url  = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href  = url;
  link.download = `Auditoria_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// ── Hooks React Query ─────────────────────────────────────────────────────────

export const AUDIT_USER_ROLES = [
  'super_admin',
  'general_admin',
  'fair_admin',
  'content_admin',
  'entrepreneur',
  'volunteer',
];

export const AUDIT_USER_ROLES_LABELS: Record<string, string> = {
  super_admin:    'Super administrador',
  general_admin:  'Administrador general',
  fair_admin:     'Administrador de ferias',
  content_admin:  'Administrador de contenido',
  entrepreneur:   'Emprendedor',
  volunteer:      'Voluntario',
};

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
