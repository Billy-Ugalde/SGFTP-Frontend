import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { FairEnrollment } from '../../Fairs/Services/FairsServices';

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const statusColor: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  approved: { bg: '#d1fae5', text: '#065f46' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
};

interface FairDetailModalProps {
  enrollment: FairEnrollment | null;
  show: boolean;
  onClose: () => void;
}

const FairDetailModal: React.FC<FairDetailModalProps> = ({ enrollment, show, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) onClose();
    };
    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  if (!show || !enrollment) return null;

  const fair = enrollment.fair;

  if (!fair) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-CR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const isPast = fair?.date ? new Date(fair.date) < new Date() : false;
  const enrollmentStatus = enrollment.status;
  const statusStyle = statusColor[enrollmentStatus] ?? { bg: '#f3f4f6', text: '#374151' };

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <p style={{ marginTop: '0.25rem', color: '#111827', fontSize: '0.95rem' }}>{value}</p>
    </div>
  );

  const content = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          width: '100%', maxWidth: '48rem',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          gap: '1rem',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            {fair.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0, background: 'none', border: 'none',
              cursor: 'pointer', padding: '0.25rem', color: '#6b7280',
              display: 'flex', alignItems: 'center',
            }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>

          {/* Estado */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.8rem', fontWeight: 600,
              backgroundColor: isPast ? '#f3f4f6' : fair.status ? '#d1fae5' : '#fee2e2',
              color: isPast ? '#6b7280' : fair.status ? '#065f46' : '#991b1b',
            }}>
              {isPast ? 'Finalizada' : fair.status ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Descripción
            </span>
            <p style={{ marginTop: '0.25rem', color: '#374151', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {fair.description || 'Sin descripción'}
            </p>
          </div>

          {/* Condiciones */}
          {fair.conditions && (
            <div style={{
              marginBottom: '1.5rem', padding: '1rem',
              backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Condiciones de participación
              </span>
              <p style={{ marginTop: '0.5rem', color: '#78350f', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {fair.conditions}
              </p>
            </div>
          )}

          {/* Fecha y ubicación */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0 2rem' }}>
            {row('Fecha', fair?.date ? formatDate(fair.date) : 'Por definir')}
            {row('Ubicación', fair?.location || 'Por definir')}
          </div>

          {/* Stand y estado */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {row('Estado de la solicitud',
              <span style={{
                display: 'inline-block',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
              }}>
                {statusLabel[enrollmentStatus] ?? enrollmentStatus}
              </span>
            )}
            {fair?.typeFair === 'interna' && row('Stand elegido', enrollment.stand?.stand_code || '—')}
          </div>

        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default FairDetailModal;
