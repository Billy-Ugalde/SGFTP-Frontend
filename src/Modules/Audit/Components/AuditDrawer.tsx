import React from 'react';
import type { AuditLog } from '../Types/audit.types';
import { ACTION_LABEL, ENTITY_LABEL, getUserDisplay, getUserInitials, formatDatetime, formatAuditData } from '../Types/audit.types';
import { getActionClass } from './AuditTable';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import { downloadAuditRecordPdf } from '../Services/AuditService';
import '../Styles/AuditDrawer.css';

interface Props {
  row: AuditLog | null;
  onClose: () => void;
}

const AuditDrawer: React.FC<Props> = ({ row, onClose }) => {
  const [pdfLoading, setPdfLoading] = React.useState(false);

  const handleDownloadPdf = async () => {
    if (!row?.id) return;
    setPdfLoading(true);
    try { await downloadAuditRecordPdf(row.id); }
    catch (e) { console.error('Error descargando PDF:', e); }
    finally { setPdfLoading(false); }
  };

  const getAvatarIndex = (log: AuditLog): number => (log.user_id ?? 0) % 5;

  const DataBlock = ({ label, data, compareWith }: {
    label: string;
    data: Record<string, unknown> | null;
    compareWith?: Record<string, unknown> | null;
  }) => {
    const items = formatAuditData(data);
    const rawKeys = data ? Object.keys(data) : [];

    const isChanged = (index: number): boolean => {
      if (compareWith === undefined) return false;
      if (compareWith === null) return true; // INSERT: todo es nuevo
      const key = rawKeys[index];
      return String(compareWith[key] ?? '') !== String(data![key] ?? '');
    };

    return (
      <div className="audit-drawer__value-block">
        <p className="audit-drawer__value-label">{label}</p>
        {items.length === 0 ? (
          <div className="audit-data-box audit-data-box--empty">Sin datos</div>
        ) : (
          <div className={`audit-data-box${compareWith !== undefined ? ' audit-data-box--new' : ''}`}>
            {items.map(({ label: itemLabel, value }, index) => (
              <div key={itemLabel} className={`audit-data-box__row${isChanged(index) ? ' audit-data-box__row--changed' : ''}`}>
                <span className="audit-data-box__key">{itemLabel}</span>
                <span className="audit-data-box__val">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const noRealChanges = (log: AuditLog): boolean => {
    if (log.action !== 'UPDATE') return false;
    if (!log.old_value || !log.new_value) return false;
    const oldKeys = Object.keys(log.old_value);
    return oldKeys.every(k => String(log.old_value![k] ?? '') === String(log.new_value![k] ?? ''));
  };

  return (
    <GenericModal show={row !== null} onClose={onClose} title="Detalle del registro" size="xl" maxHeight>
      {row && (
        <div className="audit-modal">
          <div className="audit-modal__header">
            <div className={`audit-modal__avatar audit-avatar audit-avatar--${getAvatarIndex(row)}`}>
              {getUserInitials(row)}
            </div>
            <div className="audit-modal__user-info">
              <h3 className="audit-modal__user-name">{getUserDisplay(row)}</h3>
              <div className="audit-modal__badges">
                <span className="audit-module-badge">{ENTITY_LABEL[row.entity] ?? row.entity}</span>
                <span className={`audit-action-badge ${getActionClass(row.action)}`}>
                  {ACTION_LABEL[row.action] ?? row.action}
                </span>
              </div>
            </div>
            <button
              className={`audit-record-pdf-btn${pdfLoading ? ' loading' : ''}`}
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              title="Descargar PDF de este registro"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{pdfLoading ? 'Generando...' : 'PDF'}</span>
            </button>
          </div>

          <div className="audit-modal__info-grid">
            <div className="audit-modal__info-item">
              <span className="audit-modal__label">Fecha y hora</span>
              <span className="audit-modal__value">{formatDatetime(row.timestamp)}</span>
            </div>
            {row.entity_id && (
              <div className="audit-modal__info-item">
                <span className="audit-modal__label">ID del registro</span>
                <span className="audit-modal__value">{row.entity_id}</span>
              </div>
            )}
          </div>

          {row.old_value === null && row.new_value === null ? (
            <div className="audit-drawer__no-data">Sin información de cambios registrada</div>
          ) : noRealChanges(row) ? (
            <div className="audit-modal__no-changes">
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <div>
                <p className="audit-modal__no-changes-title">Guardado sin modificaciones</p>
                <p className="audit-modal__no-changes-desc">El formulario fue enviado sin cambiar ningún campo rastreado.</p>
              </div>
            </div>
          ) : (
            <div className="audit-modal__changes">
              <DataBlock label="Valor anterior" data={row.old_value} />
              <DataBlock label="Valor nuevo" data={row.new_value} compareWith={row.old_value} />
            </div>
          )}
        </div>
      )}
    </GenericModal>
  );
};

export default AuditDrawer;
