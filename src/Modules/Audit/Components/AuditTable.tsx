import React, { useState } from 'react';
import type { AuditLog, AuditFilters } from '../Types/audit.types';
import { ACTION_LABEL, ENTITY_LABEL, getUserDisplay, getUserInitials, formatDatetime } from '../Types/audit.types';
import { AUDIT_ACTIONS, AUDIT_ACTIONS_LABELS } from '../Services/AuditService';
import AuditDrawer from './AuditDrawer';
import '../Styles/AuditTable.css';

// ── Helpers de clases (exportadas para usar en el Drawer) ──────────────────
export const getActionClass = (action: string): string => {
  const map: Record<string, string> = {
    INSERT:        'audit-action--crear',
    UPDATE:        'audit-action--editar',
    STATUS_CHANGE: 'audit-action--estado',
    ROLE_ASSIGNED: 'audit-action--roles',
    ROLE_REMOVED:  'audit-action--roles',
    DELETE:        'audit-action--eliminar',
    EXPORT:        'audit-action--editar',
  };
  return map[action] ?? 'audit-action--editar';
};

// Opciones únicas de entidad (sin duplicar labels como "Emprendedores")
const seenLabels = new Set<string>();
const ENTITY_OPTIONS = Object.entries(ENTITY_LABEL).filter(([, label]) => {
  if (seenLabels.has(label)) return false;
  seenLabels.add(label);
  return true;
});

// ── Paginación inteligente con ellipsis ────────────────────────────────────
// Ejemplo: [1] 2 3 4 5 … 12   |   1 … 4 [5] 6 … 12   |   1 … 8 9 10 11 [12]
const buildPages = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [];

  // Siempre mostrar la primera página
  pages.push(1);

  if (current <= 4) {
    // Cerca del inicio: 1 2 3 4 5 … last
    for (let i = 2; i <= 5; i++) pages.push(i);
    pages.push('...');
  } else if (current >= total - 3) {
    // Cerca del final: 1 … last-4 last-3 last-2 last-1 last
    pages.push('...');
    for (let i = total - 4; i <= total - 1; i++) pages.push(i);
  } else {
    // En el medio: 1 … prev current next … last
    pages.push('...');
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push('...');
  }

  // Siempre mostrar la última página
  pages.push(total);

  return pages;
};

// ── Componente ─────────────────────────────────────────────────────────────
interface Props {
  rows: AuditLog[];
  total: number;
  page: number;
  limit: number;
  filters: Partial<AuditFilters>;
  isLoading: boolean;
  isError?: boolean;
  onFilterChange: (f: Partial<AuditFilters>) => void;
  onPageChange: (page: number) => void;
  onExport: () => void;
}

const AuditTable: React.FC<Props> = ({
  rows, total, page, limit, filters, isLoading, isError, onFilterChange, onPageChange, onExport,
}) => {
  const [selectedRow, setSelectedRow] = useState<AuditLog | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  const setFilter = (key: keyof AuditFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => onFilterChange({ page: 1, limit });

  const getAvatarIndex = (log: AuditLog): number => (log.user_id ?? 0) % 5;

  return (
    <>
      {/* ── Cabecera ── */}
      <div className="audit-table-head">
        <div className="audit-table-head__info">
          <h3 className="audit-table-head__title">Registro de acciones</h3>
          <p className="audit-table-head__sub">Haz clic en una fila para ver el detalle completo</p>
        </div>
        <div className="audit-table-head__right">
          <span className="audit-count-badge">{total} registros</span>
          <button className="audit-btn-export" onClick={onExport}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="audit-filters">
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

        <span className="audit-filter-label">Fecha:</span>
        <input
          type="date"
          className="audit-date-input"
          value={filters.date_from ?? ''}
          max={filters.date_to ?? undefined}
          onChange={(e) => setFilter('date_from', e.target.value)}
          placeholder="Desde"
        />
        <span className="audit-filter-date-sep">—</span>
        <input
          type="date"
          className="audit-date-input"
          value={filters.date_to ?? ''}
          min={filters.date_from ?? undefined}
          onChange={(e) => setFilter('date_to', e.target.value)}
          placeholder="Hasta"
        />

        <button className="audit-filter-clear" onClick={clearFilters}>Limpiar filtros</button>
      </div>

      {/* ── Tabla ── */}
      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Módulo</th>
              <th>Acción</th>
              <th>Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            {isError ? (
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <div className="audit-table-empty audit-table-empty--error">
                    <div className="audit-table-empty__icon">⚠️</div>
                    <h4 className="audit-table-empty__title">Error al cargar los registros</h4>
                    <p className="audit-table-empty__desc">No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.</p>
                  </div>
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <div className="audit-table-empty">
                    <p className="audit-table-empty__desc">Cargando registros...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <div className="audit-table-empty">
                    <div className="audit-table-empty__icon">🔍</div>
                    <h4 className="audit-table-empty__title">No se encontraron registros</h4>
                    <p className="audit-table-empty__desc">Intenta ajustar los filtros para ver más resultados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} onClick={() => setSelectedRow(row)}>
                  <td>
                    <div className="audit-user-cell">
                      <div className={`audit-avatar audit-avatar--${getAvatarIndex(row)}`}>
                        {getUserInitials(row)}
                      </div>
                      <span className="audit-user-name">{getUserDisplay(row)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="audit-module-badge">{ENTITY_LABEL[row.entity] ?? row.entity}</span>
                  </td>
                  <td>
                    <span className={`audit-action-badge ${getActionClass(row.action)}`}>
                      {ACTION_LABEL[row.action] ?? row.action}
                    </span>
                  </td>
                  <td className="audit-cell--datetime">{formatDatetime(row.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ── */}
      <div className="audit-pagination">
        <span className="audit-pagination__info">
          {total === 0 ? 'Sin resultados' : `Mostrando ${start}–${end} de ${total} registros`}
        </span>
        <div className="audit-pagination__btns">
          {/* Anterior */}
          <button
            className="audit-pagination__btn audit-pagination__btn--nav"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >‹</button>

          {/* Números con ellipsis */}
          {buildPages(page, totalPages).map((item, i) =>
            item === '...' ? (
              <span key={`dots-${i}`} className="audit-pagination__dots">…</span>
            ) : (
              <button
                key={item}
                className={`audit-pagination__btn${item === page ? ' audit-pagination__btn--active' : ''}`}
                onClick={() => onPageChange(item as number)}
              >
                {item}
              </button>
            )
          )}

          {/* Siguiente */}
          <button
            className="audit-pagination__btn audit-pagination__btn--nav"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >›</button>
        </div>
      </div>

      {/* ── Drawer de detalle ── */}
      <AuditDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
    </>
  );
};

export default AuditTable;
