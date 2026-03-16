import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuditKpiCards from '../Components/AuditKpiCards';
import AuditTable from '../Components/AuditTable';
import { useAuditLogs, useAuditStats, downloadAuditPdf } from '../Services/AuditService';
import type { AuditFilters } from '../Types/audit.types';
import '../Styles/AuditPage.css';

const DEFAULT_FILTERS: Partial<AuditFilters> = { page: 1, limit: 9 };

const AuditPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Partial<AuditFilters>>(DEFAULT_FILTERS);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: logsData, isLoading, isError: logsError } = useAuditLogs(filters);
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

      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <div className="audit-page__header">
        <div className="audit-page__header-container">
          <div className="audit-page__title-row">

            {/* Ícono + título */}
            <div className="audit-page__title-center">
              <div className="audit-page__title-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="audit-page__title">Auditoría del Sistema</h1>
                <p className="audit-page__subtitle">
                  Trazabilidad completa de acciones · <em>Fundación Tamarindo Park</em>
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="audit-page__header-actions">
              <button className="audit-page__btn audit-page__btn--outline" onClick={() => navigate('/admin')}>
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio
              </button>
              <button className="audit-page__btn audit-page__btn--primary" onClick={handleExport}>
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar reporte PDF
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ══════════════════════════════════════════ */}
      <div className="audit-page__main">

        {/* ── Error banner exportación ── */}
        {exportError && (
          <div className="audit-page__error-banner">
            <span>⚠️ {exportError}</span>
            <button onClick={() => setExportError(null)}>✕</button>
          </div>
        )}

        {/* ── KPI cards ── */}
        {stats && (
          <div className="audit-page__stats">
            <AuditKpiCards stats={stats} />
          </div>
        )}

        {/* ── Tabla de registros ── */}
        <div className="audit-page__table-section">
          <AuditTable
            rows={logsData?.data ?? []}
            total={logsData?.total ?? 0}
            page={logsData?.page ?? 1}
            limit={filters.limit ?? 9}
            filters={filters}
            isLoading={isLoading}
            isError={logsError}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onExport={handleExport}
          />
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="audit-page__footer">
        Fundación Tamarindo Park · Sistema de Gestión SGTPF
      </div>

    </div>
  );
};

export default AuditPage;
