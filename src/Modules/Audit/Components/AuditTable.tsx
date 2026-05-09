import React, { useState } from 'react';
import type { AuditLog } from '../Types/audit.types';
import { ACTION_LABEL, ENTITY_LABEL, getUserDisplay, getUserInitials, formatDatetime } from '../Types/audit.types';
import AuditDrawer from './AuditDrawer';
import { ListState } from '../../Shared/components';
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

// ── Componente ─────────────────────────────────────────────────────────────
interface Props {
  rows: AuditLog[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
}

const AuditTable: React.FC<Props> = ({
  rows, total, page, limit, isLoading, isError, onRetry, onPageChange,
}) => {
  const [selectedRow, setSelectedRow] = useState<AuditLog | null>(null);

  const getAvatarIndex = (log: AuditLog): number => (log.user_id ?? 0) % 5;

  return (
    <div className="audit-table-container">
      {/* ── Tabla ── */}
      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Módulo</th>
              <th>Acción</th>
              <th>Fecha y hora</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isError ? (
              <tr>
                <td colSpan={5} style={{ padding: 0 }}>
                  <ListState
                    isLoading={isLoading}
                    error={isError ? new Error('error') : undefined}
                    loadingText="Cargando registros..."
                    errorTitle="No se pudieron cargar los registros"
                    errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
                    onRetry={onRetry}
                  />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 0 }}>
                  <div className="audit-table-empty">
                    <div className="audit-table-empty__icon">
                      <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <h4 className="audit-table-empty__title">No se encontraron registros</h4>
                    <p className="audit-table-empty__desc">Intenta ajustar los filtros para ver más resultados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
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
                  <td>
                    <div className="audit-table-actions">
                      <button className="view" onClick={() => setSelectedRow(row)}>
                        <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Drawer de detalle ── */}
      <AuditDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  );
};

export default AuditTable;
