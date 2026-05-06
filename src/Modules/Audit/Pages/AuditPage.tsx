import { useState } from 'react';
import { Scale } from 'lucide-react';
import AuditKpiCards from '../Components/AuditKpiCards';
import AuditTable from '../Components/AuditTable';
import {
  useAuditLogs,
  useAuditStats,
  downloadAuditPdf,
  AUDIT_ACTIONS,
  AUDIT_ACTIONS_LABELS,
  AUDIT_USER_ROLES,
  AUDIT_USER_ROLES_LABELS,
} from '../Services/AuditService';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import type { AuditFilters } from '../Types/audit.types';
import { ENTITY_LABEL } from '../Types/audit.types';
import '../Styles/AuditPage.css';

const DEFAULT_FILTERS: Partial<AuditFilters> = { page: 1, limit: 10 };

const seenLabels = new Set<string>();
const ENTITY_OPTIONS = Object.entries(ENTITY_LABEL).filter(([, label]) => {
  if (seenLabels.has(label)) return false;
  seenLabels.add(label);
  return true;
});

const AuditPage = () => {
  const [filters, setFilters] = useState<Partial<AuditFilters>>(DEFAULT_FILTERS);
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
          <span className="audit-filter-label">Filtrar por:</span>

          <select
            className="audit-select"
            value={filters.entity ?? ''}
            onChange={(e) => setFilter('entity', e.target.value)}
          >
            <option value="">Todos los módulos</option>
            {ENTITY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            className="audit-select"
            value={filters.action ?? ''}
            onChange={(e) => setFilter('action', e.target.value)}
          >
            <option value="">Todas las acciones</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>{AUDIT_ACTIONS_LABELS[a] ?? a}</option>
            ))}
          </select>

          <select
            className="audit-select"
            value={filters.user_role ?? ''}
            onChange={(e) => setFilter('user_role', e.target.value)}
          >
            <option value="">Todos los roles</option>
            {AUDIT_USER_ROLES.map((r) => (
              <option key={r} value={r}>{AUDIT_USER_ROLES_LABELS[r] ?? r}</option>
            ))}
          </select>

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

        {/* KPI cards */}
        {stats && <AuditKpiCards stats={stats} />}

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
          if (totalPages <= 1) return null;
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
