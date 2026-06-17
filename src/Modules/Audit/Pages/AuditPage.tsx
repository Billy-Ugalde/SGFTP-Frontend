import { useState, useMemo } from 'react';
import {
  Scale, Filter, Users, Briefcase, ShoppingBag, FolderOpen,
  CalendarDays, Heart, Newspaper, FileText, Mail, Gift, Send,
  Plus, Pencil, RefreshCw, UserCheck, UserX, Trash2,
  Crown, Shield, ShieldCheck, PenLine,
} from 'lucide-react';
import AuditKpiCards from '../Components/AuditKpiCards';
import AuditTable from '../Components/AuditTable';
import AuditDropdown, { type AuditDropdownOption } from '../Components/AuditDropdown';
import { useAuditLogs, useAuditStats, downloadAuditPdf } from '../Services/AuditService';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import { EmptyState } from '../../Shared/components';
import type { AuditFilters } from '../Types/audit.types';
import '../Styles/AuditPage.css';

const DEFAULT_FILTERS: Partial<AuditFilters> = { page: 1, limit: 10 };

const AuditPage = () => {
  const [filters, setFilters] = useState<Partial<AuditFilters>>(DEFAULT_FILTERS);

  const MODULE_OPTIONS = useMemo<AuditDropdownOption[]>(() => [
    { value: '',                   label: 'Todos los módulos',  icon: <Filter size={14} /> },
    { value: 'users',              label: 'Usuarios',           icon: <Users size={14} /> },
    { value: 'entrepreneurs',      label: 'Emprendedores',      icon: <Briefcase size={14} /> },
    { value: 'fair',               label: 'Ferias',             icon: <ShoppingBag size={14} /> },
    { value: 'project',            label: 'Proyectos',          icon: <FolderOpen size={14} /> },
    { value: 'activity',           label: 'Actividades',        icon: <CalendarDays size={14} /> },
    { value: 'volunteers',         label: 'Voluntarios',        icon: <Heart size={14} /> },
    { value: 'news',               label: 'Noticias',           icon: <Newspaper size={14} /> },
    { value: 'content_blocks',     label: 'Contenido',          icon: <FileText size={14} /> },
    { value: 'subscriber',         label: 'Suscriptores',       icon: <Mail size={14} /> },
    { value: 'donation',           label: 'Donaciones',         icon: <Gift size={14} /> },
    { value: 'newsletter_campaigns', label: 'Newsletters',      icon: <Send size={14} /> },
  ], []);

  const ACTION_OPTIONS = useMemo<AuditDropdownOption[]>(() => [
    { value: '',              label: 'Todas las acciones',  icon: <Filter size={14} /> },
    { value: 'INSERT',        label: 'Creación',            icon: <Plus size={14} /> },
    { value: 'UPDATE',        label: 'Edición',             icon: <Pencil size={14} /> },
    { value: 'STATUS_CHANGE', label: 'Cambio de estado',   icon: <RefreshCw size={14} /> },
    { value: 'ROLE_ASSIGNED', label: 'Asignación de rol',  icon: <UserCheck size={14} /> },
    { value: 'ROLE_REMOVED',  label: 'Remoción de rol',    icon: <UserX size={14} /> },
    { value: 'DELETE',        label: 'Eliminación',         icon: <Trash2 size={14} /> },
  ], []);

  const ROLE_OPTIONS = useMemo<AuditDropdownOption[]>(() => [
    { value: '',               label: 'Todos los roles',             icon: <Filter size={14} /> },
    { value: 'super_admin',    label: 'Super administrador',         icon: <Crown size={14} /> },
    { value: 'general_admin',  label: 'Administrador general',       icon: <ShieldCheck size={14} /> },
    { value: 'fair_admin',     label: 'Administrador de ferias',     icon: <Shield size={14} /> },
    { value: 'content_admin',  label: 'Administrador de contenido',  icon: <PenLine size={14} /> },
    { value: 'entrepreneur',   label: 'Emprendedor',                 icon: <Briefcase size={14} /> },
    { value: 'volunteer',      label: 'Voluntario',                  icon: <Heart size={14} /> },
  ], []);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: logsData, isLoading, isError: logsError, refetch } = useAuditLogs(filters);
  const { data: stats } = useAuditStats();

  const setFilter = (key: keyof AuditFilters, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));

  const clearFilters = () => setFilters({ page: 1, limit: filters.limit ?? 10 });

  const handlePageChange = (page: number) => setFilters(prev => ({ ...prev, page }));

  const handleExport = async () => {
    setExportError(null);
    try {
      await downloadAuditPdf(filters);
    } catch {
      setExportError('No se pudo generar el reporte PDF. Intenta de nuevo.');
    }
  };

  return (
    <div className="audit-dashboard">
      {/* Header */}
      <div className="audit-dashboard__header">
        <div className="audit-dashboard__header-inner">
          <div className="audit-dashboard__header-left">
            <div className="audit-dashboard__header-icon">
              <Scale size={18} strokeWidth={2} />
            </div>
            <h1 className="audit-dashboard__title">Auditoría del Sistema</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {/* Main */}
      <div className="audit-dashboard__main">

        {/* Error banner */}
        {exportError && (
          <div className="audit-page__error-banner">
            <span>{exportError}</span>
            <button onClick={() => setExportError(null)}>
              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Action Bar — filtros */}
        <div className="audit-dashboard__action-bar">
          <AuditDropdown
            value={filters.entity ?? ''}
            onChange={(v) => setFilter('entity', v)}
            options={MODULE_OPTIONS}
          />

          <AuditDropdown
            value={filters.action ?? ''}
            onChange={(v) => setFilter('action', v)}
            options={ACTION_OPTIONS}
          />

          <AuditDropdown
            value={filters.user_role ?? ''}
            onChange={(v) => setFilter('user_role', v)}
            options={ROLE_OPTIONS}
          />

          <span className="audit-filter-label">Fecha:</span>
          <input
            type="date"
            className="audit-date-input"
            value={filters.date_from ?? ''}
            max={filters.date_to ?? undefined}
            onChange={(e) => setFilter('date_from', e.target.value)}
          />
          <span className="audit-filter-date-sep">—</span>
          <input
            type="date"
            className="audit-date-input"
            value={filters.date_to ?? ''}
            min={filters.date_from ?? undefined}
            onChange={(e) => setFilter('date_to', e.target.value)}
          />

          <button className="audit-filter-clear" onClick={clearFilters}>Limpiar filtros</button>

          <button className="audit-btn-export" onClick={handleExport}>
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar PDF
          </button>
        </div>

        {/* KPI cards — contenedor con altura fija para evitar CLS */}
        <div className="audit-dashboard__kpi-placeholder">
          {stats && <AuditKpiCards stats={stats} />}
        </div>

        {!isLoading && !logsError && (logsData?.data ?? []).length === 0 ? (
          <EmptyState recurso="eventos" />
        ) : (
          <div className="audit-dashboard__table-card">
            <AuditTable
              rows={logsData?.data ?? []}
              total={logsData?.total ?? 0}
              page={filters.page ?? 1}
              limit={filters.limit ?? 10}
              isLoading={isLoading}
              isError={logsError}
              onRetry={refetch}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Paginación — fuera del card */}
        {(() => {
          const total = logsData?.total ?? 0;
          const page = filters.page ?? 1;
          const limit = filters.limit ?? 10;
          const totalPages = Math.max(1, Math.ceil(total / limit));
          const start = total === 0 ? 0 : (page - 1) * limit + 1;
          const end = Math.min(page * limit, total);
          const buildPages = (cur: number, tot: number): (number | '...')[] => {
            if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1);
            const pages: (number | '...')[] = [1];
            if (cur <= 4) { for (let i = 2; i <= 5; i++) pages.push(i); pages.push('...'); }
            else if (cur >= tot - 3) { pages.push('...'); for (let i = tot - 4; i <= tot - 1; i++) pages.push(i); }
            else { pages.push('...', cur - 1, cur, cur + 1, '...'); }
            pages.push(tot);
            return pages;
          };
          if (total === 0) return null;
          return (
            <div className="audit-pagination">
              <div className="audit-pagination__btns">
                <button className="audit-pagination__btn audit-pagination__btn--nav" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Anterior
                </button>
                {buildPages(page, totalPages).map((item, i) =>
                  item === '...' ? <span key={`d${i}`} className="audit-pagination__dots">…</span> :
                  <button key={item} className={`audit-pagination__btn${item === page ? ' audit-pagination__btn--active' : ''}`} onClick={() => handlePageChange(item as number)}>{item}</button>
                )}
                <button className="audit-pagination__btn audit-pagination__btn--nav" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                  Siguiente
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <span className="audit-pagination__info">{total === 0 ? 'Sin resultados' : `${start}–${end} de ${total}`}</span>
            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default AuditPage;
