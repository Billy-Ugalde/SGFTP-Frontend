import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import AuditKpiCards from '../Components/AuditKpiCards';
import AuditTable from '../Components/AuditTable';
import { useAuditLogs, useAuditStats, downloadAuditPdf } from '../Services/AuditService';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import type { AuditFilters } from '../Types/audit.types';
import '../Styles/AuditPage.css';

const DEFAULT_FILTERS: Partial<AuditFilters> = { page: 1, limit: 9 };

const AuditPage: React.FC = () => {
  const [filters, setFilters] = useState<Partial<AuditFilters>>(DEFAULT_FILTERS);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: logsData, isLoading, isError: logsError, refetch } = useAuditLogs(filters);
  const { data: stats } = useAuditStats();

  const handleFilterChange = (newFilters: Partial<AuditFilters>) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = async () => {
    setExportError(null);
    try {
      await downloadAuditPdf(filters);
    } catch {
      setExportError('No se pudo generar el reporte PDF. Intenta de nuevo.');
    }
  };

  return (
    <div className="audit-page">

      {/* Header */}
      <div className="audit-page__header">
        <div className="audit-page__header-inner">
          <div className="audit-page__header-left">
            <div className="audit-page__header-icon">
              <Scale size={18} strokeWidth={2} />
            </div>
            <h1 className="audit-page__title">Auditoría del Sistema</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {/* Main */}
      <div className="audit-page__main">

        {/* Error banner exportación */}
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

        {/* KPI cards */}
        {stats && (
          <div className="audit-page__stats">
            <AuditKpiCards stats={stats} />
          </div>
        )}

        {/* Tabla */}
        <div className="audit-page__table-section">
          <AuditTable
            rows={logsData?.data ?? []}
            total={logsData?.total ?? 0}
            page={filters.page ?? 1}
            limit={filters.limit ?? 9}
            filters={filters}
            isLoading={isLoading}
            isError={logsError}
            onRetry={refetch}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onExport={handleExport}
          />
        </div>

      </div>
    </div>
  );
};

export default AuditPage;
