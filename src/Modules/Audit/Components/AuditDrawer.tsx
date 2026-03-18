import React from 'react';
import type { AuditLog } from '../Types/audit.types';
import { ACTION_LABEL, ENTITY_LABEL, getUserDisplay, getUserInitials, formatDatetime, formatAuditData } from '../Types/audit.types';
import { getActionClass } from './AuditTable';
import '../Styles/AuditDrawer.css';

interface Props {
  row: AuditLog | null;
  onClose: () => void;
}

const AuditDrawer: React.FC<Props> = ({ row, onClose }) => {
  const isOpen = row !== null;
  const getAvatarIndex = (log: AuditLog): number => (log.user_id ?? 0) % 5;

  const DataBlock = ({ label, data, variant }: {
    label: string;
    data: Record<string, unknown> | null;
    variant?: 'old' | 'new';
  }) => {
    const items = formatAuditData(data);
    return (
      <div className="audit-drawer__value-block">
        <p className="audit-drawer__value-label">{label}</p>
        {items.length === 0 ? (
          <div className={`audit-data-box audit-data-box--empty`}>Sin datos</div>
        ) : (
          <div className={`audit-data-box${variant === 'new' ? ' audit-data-box--new' : ''}`}>
            {items.map(({ label: itemLabel, value }) => (
              <div key={itemLabel} className="audit-data-box__row">
                <span className="audit-data-box__key">{itemLabel}</span>
                <span className="audit-data-box__val">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={`audit-overlay${isOpen ? ' audit-overlay--open' : ''}`}
        onClick={onClose}
      />
      <div className={`audit-drawer${isOpen ? ' audit-drawer--open' : ''}`}>
        <div className="audit-drawer__head">
          <h3 className="audit-drawer__title">Detalle del registro</h3>
          <button className="audit-drawer__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {row && (
          <div className="audit-drawer__body">
            {/* ── Usuario ── */}
            <div className="audit-drawer__user">
              <div className={`audit-drawer__user-avatar audit-avatar audit-avatar--${getAvatarIndex(row)}`}>
                {getUserInitials(row)}
              </div>
              <div>
                <p className="audit-drawer__user-name">{getUserDisplay(row)}</p>
              </div>
            </div>

            {/* ── Campos ── */}
            <div className="audit-drawer__row">
              <span className="audit-drawer__key">Módulo</span>
              <span className="audit-drawer__val">
                <span className="audit-module-badge">{ENTITY_LABEL[row.entity] ?? row.entity}</span>
              </span>
            </div>
            <div className="audit-drawer__row">
              <span className="audit-drawer__key">Acción</span>
              <span className="audit-drawer__val">
                <span className={`audit-action-badge ${getActionClass(row.action)}`}>
                  {ACTION_LABEL[row.action] ?? row.action}
                </span>
              </span>
            </div>
            <div className="audit-drawer__row">
              <span className="audit-drawer__key">Fecha y hora</span>
              <span className="audit-drawer__val">{formatDatetime(row.timestamp)}</span>
            </div>

            {/* ── Valores legibles ── */}
            <DataBlock label="Valor anterior" data={row.old_value} />
            <DataBlock label="Valor nuevo"    data={row.new_value} variant="new" />
          </div>
        )}
      </div>
    </>
  );
};

export default AuditDrawer;
