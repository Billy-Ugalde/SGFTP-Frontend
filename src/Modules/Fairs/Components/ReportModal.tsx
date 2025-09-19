import React from 'react';
import '../Styles/ReportModal.css';
import { useReportFair } from '../Services/FairsServices';  

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const { mutateAsync: downloadReport, isPending } = useReportFair();

  if (!isOpen) return null;

  const quarters = [
    { value: 1 as const, label: 'Q1 (Enero - Marzo)' },
    { value: 2 as const, label: 'Q2 (Abril - Junio)' },
    { value: 3 as const, label: 'Q3 (Julio - Septiembre)' },
    { value: 4 as const, label: 'Q4 (Octubre - Diciembre)' },
  ];

  const onPick = async (q: 1 | 2 | 3 | 4) => {
    onClose();                 
    try {
      await downloadReport({ quarter: q });  
    } catch (e: any) {
     
      alert(e?.message ?? 'Error al generar el reporte');
    }
  };

  return (
    <div className="fairs-page__report-dropdown">
      <div className="fairs-page__report-header">
        <h3>Generar Reporte {new Date().getFullYear()}</h3>
        <button
          type="button"
          className="fairs-page__report-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <div className="fairs-page__report-options">
        {quarters.map(q => (
          <button
            key={q.value}
            className="fairs-page__report-option"
            disabled={isPending}
            onClick={() => onPick(q.value)}
          >
            <span className="fairs-page__report-label">{q.label}</span>
            {isPending && <span className="fairs-page__loading">⏳</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
