import React from 'react';
import type { AuditStats } from '../Types/audit.types';
import '../Styles/AuditKpiCards.css';

interface Props {
  stats: AuditStats;
}

const AuditKpiCards: React.FC<Props> = ({ stats }) => {
  return (
    <>
      {/* Total de eventos */}
      <div className="audit-kpi-card audit-kpi-card--green">
        <div className="audit-kpi-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0c5b63" strokeWidth={2} width={28} height={28}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="audit-kpi-card__content">
          <p className="audit-kpi-card__label">Total de eventos</p>
          <p className="audit-kpi-card__value">{stats.total_events.toLocaleString()}</p>
          <p className="audit-kpi-card__delta audit-kpi-card__delta--green">
            {stats.events_today} evento{stats.events_today !== 1 ? 's' : ''} hoy
          </p>
        </div>
      </div>

      {/* Cambios de rol */}
      <div className="audit-kpi-card audit-kpi-card--blue">
        <div className="audit-kpi-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth={2} width={28} height={28}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div className="audit-kpi-card__content">
          <p className="audit-kpi-card__label">Cambios de rol</p>
          <p className="audit-kpi-card__value">{stats.role_changes}</p>
          <p className="audit-kpi-card__delta audit-kpi-card__delta--blue">
            Asignaciones y remociones de roles
          </p>
        </div>
      </div>
    </>
  );
};

export default AuditKpiCards;
