import React, { useState } from 'react';
import {
  useFairEnrollmentsByEntrepreneur,
  useCancelEnrollment,
  type FairEnrollment,
} from '../../Fairs/Services/FairsServices';
import FairDetailModal from './FairDetailModal';

interface Props {
  entrepreneurId: number;
}

const isFairPast = (dateStr: string | undefined): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const statusColor: Record<string, string> = {
  pending: '#d97706',
  approved: '#059669',
  rejected: '#dc2626',
};

const EntrepreneurFairsSection: React.FC<Props> = ({ entrepreneurId }) => {
  const { data: enrollments, isLoading } = useFairEnrollmentsByEntrepreneur(entrepreneurId);
  const cancelMutation = useCancelEnrollment();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string>('');
  const [cancelSuccess, setCancelSuccess] = useState<string>('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<FairEnrollment | null>(null);

  const handleCancel = async (enrollment: FairEnrollment) => {
    if (!enrollment.id_enrrolment_fair) return;
    setCancelError('');
    setCancelSuccess('');
    try {
      await cancelMutation.mutateAsync(enrollment.id_enrrolment_fair);
      setConfirmingId(null);
      setCancelSuccess(`Tu inscripción a "${enrollment.fair?.name}" fue cancelada exitosamente.`);
      setTimeout(() => setCancelSuccess(''), 5000);
    } catch (err: any) {
      setCancelError(
        err?.response?.data?.message ||
        err?.message ||
        'Error al cancelar la inscripción'
      );
    }
  };

  if (isLoading) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Mis Inscripciones a Ferias
        </h4>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Cargando inscripciones...</p>
      </div>
    );
  }

  const visibleEnrollments = enrollments
    ? enrollments.filter(
        (e) => (e.status === 'pending' || e.status === 'approved') && !isFairPast(e.fair?.date)
      )
    : [];

  if (!enrollments || visibleEnrollments.length === 0) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Mis Inscripciones a Ferias
        </h4>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          No tienes inscripciones activas a ferias actualmente.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Mis Inscripciones a Ferias
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {visibleEnrollments.map((enrollment) => {
          const isConfirming = confirmingId === enrollment.id_enrrolment_fair;
          const isCancelling = cancelMutation.isPending && isConfirming;

          return (
            <div
              key={enrollment.id_enrrolment_fair}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {enrollment.fair?.name || 'Feria sin nombre'}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Fecha:{' '}
                  {enrollment.fair?.date
                    ? new Date(enrollment.fair.date).toLocaleDateString('es-CR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Por definir'}
                </p>
                {enrollment.fair?.typeFair === 'interna' && enrollment.stand?.stand_code && (
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Stand: <strong>{enrollment.stand.stand_code}</strong>
                  </p>
                )}
                <p style={{ fontSize: '0.85rem' }}>
                  Estado:{' '}
                  <span
                    style={{
                      fontWeight: 600,
                      color: statusColor[enrollment.status] || '#374151',
                    }}
                  >
                    {statusLabel[enrollment.status] || enrollment.status}
                  </span>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedEnrollment(enrollment)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.85rem',
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Ver detalles
                </button>

                {!isConfirming ? (
                    <button
                      type="button"
                      onClick={() => { setConfirmingId(enrollment.id_enrrolment_fair!); setCancelError(''); }}
                      style={{
                        padding: '0.4rem 0.9rem',
                        fontSize: '0.85rem',
                        backgroundColor: '#fff',
                        color: '#dc2626',
                        border: '1px solid #dc2626',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Cancelar inscripción
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                      <p style={{ fontSize: '0.8rem', color: '#374151', textAlign: 'right' }}>
                        ¿Confirmar cancelación?
                      </p>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => { setConfirmingId(null); setCancelError(''); }}
                          disabled={isCancelling}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(enrollment)}
                          disabled={isCancelling}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            backgroundColor: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isCancelling ? 'not-allowed' : 'pointer',
                            opacity: isCancelling ? 0.7 : 1,
                          }}
                        >
                          {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cancelSuccess && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginTop: '0.75rem', padding: '0.65rem 1rem',
          backgroundColor: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: '8px', color: '#166534', fontSize: '0.875rem',
        }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {cancelSuccess}
        </div>
      )}

      {cancelError && (
        <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.75rem' }}>
          {cancelError}
        </p>
      )}

      <FairDetailModal
        enrollment={selectedEnrollment}
        show={!!selectedEnrollment}
        onClose={() => setSelectedEnrollment(null)}
      />
    </div>
  );
};

export default EntrepreneurFairsSection;
