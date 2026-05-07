import type { AuditStats } from '../Types/audit.types';
import '../Styles/AuditKpiCards.css';

interface Props {
  stats: AuditStats;
}

const AuditKpiCards = ({ stats }: Props) => {
  return (
    <div className="audit-kpi-stats">
      {/* Total de eventos */}
      <div className="audit-kpi-stat-card audit-kpi-stat-card--total">
        <div className="audit-kpi-stat-content">
          <div className="audit-kpi-stat-icon audit-kpi-stat-icon--total">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="audit-kpi-stat-label">Total de eventos</p>
            <p className="audit-kpi-stat-value audit-kpi-stat-value--total">{stats.total_events.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Eventos hoy */}
      <div className="audit-kpi-stat-card audit-kpi-stat-card--active">
        <div className="audit-kpi-stat-content">
          <div className="audit-kpi-stat-icon audit-kpi-stat-icon--active">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="audit-kpi-stat-label">Eventos hoy</p>
            <p className="audit-kpi-stat-value audit-kpi-stat-value--active">{stats.events_today}</p>
          </div>
        </div>
      </div>

      {/* Cambios de rol */}
      <div className="audit-kpi-stat-card audit-kpi-stat-card--inactive">
        <div className="audit-kpi-stat-content">
          <div className="audit-kpi-stat-icon audit-kpi-stat-icon--inactive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <p className="audit-kpi-stat-label">Cambios de rol</p>
            <p className="audit-kpi-stat-value audit-kpi-stat-value--inactive">{stats.role_changes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditKpiCards;
