import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Auth/context/AuthContext';
import { useEntrepreneurByUserEmail } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import { useStandsByFair, useCreateFairEnrollment, useFairEnrollmentsByFair, type PublicFair, type EnrollmentRequest } from '../../../Fairs/Services/FairsServices';
import ConsentCheckbox from '../../../Shared/components/ConsentCheckbox';
import GenericModal from '../../../Entrepreneurs/Components/GenericModal';
import parkMap from '../../../../assets/park-map.png';
import { MapPin, Clock, CheckCircle, XCircle, User, Store, Info, AlertCircle, Loader2, Map } from 'lucide-react';

interface FairParticipationModalProps {
  fair: PublicFair;
  isOpen: boolean;
  onClose: () => void;
}

const FairParticipationModal: React.FC<FairParticipationModalProps> = ({
  fair,
  isOpen,
  onClose
}) => {
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedStand, setSelectedStand] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [consent, setConsent] = useState(false);
  const [zoomMap, setZoomMap] = useState(false);

  const userEmail = (user as any)?.person?.email;
  const { data: entrepreneur, isLoading: entrepreneurLoading, error: entrepreneurError } = useEntrepreneurByUserEmail(userEmail);
  const { data: standsData } = useStandsByFair(fair.id_fair);
  const { data: enrollments } = useFairEnrollmentsByFair(fair.id_fair);
  const enrollmentMutation = useCreateFairEnrollment();

  const isEntrepreneur = (user as any)?.roles?.includes('entrepreneur');
  const hasEntrepreneurData = entrepreneur && entrepreneur.id_entrepreneur;
  const isInternalFair = fair.typeFair === 'interna';
  const availableStands = standsData?.filter(stand => !stand.status) || [];
  const allStands = standsData || [];

  const existingEnrollment = enrollments?.find(
    enrollment => enrollment.entrepreneur?.id_entrepreneur === entrepreneur?.id_entrepreneur
  );

  const canEnroll = !existingEnrollment || existingEnrollment.status === 'rejected';

  const getEnrollmentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente de Aprobación', color: '#f59e0b', icon: Clock };
      case 'approved':
        return { text: isInternalFair ? 'Aprobada - Stand Asignado' : 'Aprobada', color: '#10b981', icon: CheckCircle };
      case 'rejected':
        return { text: 'Rechazada', color: '#ef4444', icon: XCircle };
      default:
        return { text: 'Estado Desconocido', color: '#6b7280', icon: AlertCircle };
    }
  };
  const formatFairDates = () => {
    if (!fair.datefairs || fair.datefairs.length === 0) {
      return fair.date ? new Date(fair.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : 'Fecha por definir';
    }

    if (fair.datefairs.length === 1) {
      return new Date(fair.datefairs[0].date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }

    const dates = fair.datefairs
      .map(df => new Date(df.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      }))
      .join(', ');

    return `${dates} (${fair.datefairs.length} fechas)`;
  };

  const handleSubmit = async () => {
    if (!consent) {
      setError('Debes aceptar el aviso de privacidad para continuar');
      return;
    }

    if (!hasEntrepreneurData) {
      setError('No se encontraron datos de emprendedor');
      return;
    }

    if (!entrepreneur.id_entrepreneur) {
      setError('ID de emprendedor no válido');
      return;
    }

    if (isInternalFair && !selectedStand) {
      setError('Debe seleccionar un stand');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setError(null);
    setShowConfirmation(false);

    if (!entrepreneur?.id_entrepreneur) {
      setError('Error: Datos de emprendedor no válidos');
      return;
    }

    try {
      const enrollmentData: EnrollmentRequest = {
        id_fair: fair.id_fair,
        id_entrepreneur: entrepreneur.id_entrepreneur,
        id_stand: isInternalFair ? selectedStand! : (availableStands[0]?.id_stand || 1)
      };

      await enrollmentMutation.mutateAsync(enrollmentData);
      setSuccess('¡Solicitud enviada exitosamente! Recibirás una confirmación por email.');


    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al enviar la solicitud');
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setSelectedStand(null);
    setShowConfirmation(false);
    setZoomMap(false);
    onClose();
  };

  useEffect(() => {
    if (!zoomMap) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        setZoomMap(false);
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [zoomMap]);

  if (!isOpen) return null;

  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(29, 27, 25, 0.72)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 4000,
      padding: '1.5rem'
    },
    content: {
      background: 'var(--paper)',
      borderRadius: '16px',
      maxWidth: '1000px',
      width: '100%',
      maxHeight: '92vh',
      overflowY: 'auto',
      boxShadow: '0 40px 100px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      fontFamily: 'var(--fn-d)'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.75rem 2rem 1.25rem',
      borderBottom: '1px solid var(--stone)',
      position: 'sticky',
      top: 0,
      background: 'var(--paper)',
      zIndex: 5
    },
    title: {
      margin: 0,
      fontFamily: 'var(--fn-s)',
      fontStyle: 'italic',
      fontSize: 'clamp(1.4rem, 3vw, 2rem)',
      fontWeight: 400,
      letterSpacing: '-0.02em',
      color: 'var(--dk)'
    },
    closeButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '34px',
      height: '34px',
      flexShrink: 0,
      background: 'var(--stone)',
      border: 'none',
      fontSize: '1.3rem',
      lineHeight: 1,
      cursor: 'pointer',
      color: 'var(--mid)',
      borderRadius: '8px',
      transition: 'background-color 0.2s'
    },
    body: {
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    section: {
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1.5px solid var(--stone)',
      background: 'var(--w)'
    },
    fairInfo: {
      background: 'var(--w)',
      borderLeft: '4px solid var(--g)'
    },
    entrepreneurInfo: {
      background: 'var(--gl)',
      borderLeft: '4px solid var(--g)'
    },
    warning: {
      background: 'var(--gl)',
      border: '1.5px solid rgba(82, 172, 131, 0.3)',
      textAlign: 'center'
    },
    error: {
      background: '#fdecec',
      border: '1.5px solid #e7b4b4',
      textAlign: 'center'
    },
    existingEnrollment: {
      background: 'var(--stone)',
      border: '1.5px solid var(--bone)',
      textAlign: 'center'
    },
    sectionTitle: {
      margin: '0 0 1rem 0',
      color: 'var(--dk)',
      fontFamily: 'var(--fn-d)',
      fontSize: '1.05rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.55rem'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    infoDivider: {
      height: '1px',
      background: 'var(--stone)',
      border: 'none',
      margin: '1.25rem 0'
    },
    infoBlock: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem'
    },
    label: {
      fontSize: '0.62rem',
      fontWeight: 600,
      color: 'var(--faint)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    },
    value: {
      fontSize: '0.92rem',
      color: 'var(--dk)',
      fontWeight: 500,
      wordBreak: 'break-word'
    },
    standsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
      gap: '0.75rem',
      marginTop: '1rem'
    },
    standOption: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      border: '2px solid var(--stone)',
      borderRadius: '12px',
      cursor: 'pointer',
      background: 'var(--w)',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    standSelected: {
      borderColor: 'var(--g)',
      background: 'var(--gl)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(82, 172, 131, 0.18)'
    },
    standOccupied: {
      borderColor: '#e7b4b4',
      background: '#fdecec',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    alert: {
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: 500,
      textAlign: 'center'
    },
    alertError: {
      background: '#fdecec',
      color: '#b4322c',
      border: '1px solid #e7b4b4'
    },
    alertSuccess: {
      background: 'var(--gl)',
      color: 'var(--gm)',
      border: '1.5px solid var(--g)',
      fontSize: '1.05rem',
      fontWeight: 600,
      padding: '1.5rem 2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(82, 172, 131, 0.15)'
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--stone)'
    },
    button: {
      padding: '0.8rem 1.6rem',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: 600,
      fontFamily: 'var(--fn-d)',
      letterSpacing: '0.02em',
      cursor: 'pointer',
      border: '1.5px solid transparent',
      transition: 'all 0.2s ease'
    },
    buttonPrimary: {
      background: 'var(--g)',
      color: 'var(--w)',
      borderColor: 'var(--g)'
    },
    buttonSecondary: {
      background: 'var(--w)',
      color: 'var(--dk)',
      borderColor: 'var(--bone)'
    },
    buttonDisabled: {
      background: 'var(--stone)',
      color: 'var(--faint)',
      cursor: 'not-allowed',
      borderColor: 'var(--stone)'
    },
    confirmationOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(29, 27, 25, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10002,
      padding: '1.5rem'
    },
    confirmationModal: {
      background: 'var(--paper)',
      borderRadius: '14px',
      padding: '2rem',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3)'
    },
    confirmationTitle: {
      fontFamily: 'var(--fn-s)',
      fontStyle: 'italic',
      fontSize: '1.4rem',
      fontWeight: 400,
      color: 'var(--dk)',
      marginBottom: '1rem'
    },
    confirmationMessage: {
      fontSize: '0.95rem',
      color: 'var(--mid)',
      lineHeight: 1.6,
      marginBottom: '2rem'
    },
    confirmationActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    },
    mapContainer: {
      width: '100%',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    mapTitle: {
      margin: '0 0 1rem 0',
      color: 'var(--dk)',
      fontFamily: 'var(--fn-d)',
      fontSize: '1rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    mapImageWrapper: {
      position: 'relative',
      width: '100%',
      background: 'var(--w)',
      padding: '0.75rem',
      borderRadius: '12px',
      border: '1.5px solid var(--stone)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    mapImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '500px',
      borderRadius: '6px',
      objectFit: 'contain',
      display: 'block',
      margin: '0 auto'
    },
    mapCaption: {
      fontSize: '0.82rem',
      color: 'var(--mid)',
      margin: '0.75rem 0 0 0',
      fontStyle: 'italic',
      textAlign: 'center'
    },
    mapZoomHint: {
      position: 'absolute',
      top: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.4rem 0.7rem',
      borderRadius: '999px',
      background: 'rgba(29, 27, 25, 0.78)',
      color: 'var(--paper)',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      pointerEvents: 'none'
    },
    lightboxOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 10003,
      background: 'rgba(20, 18, 16, 0.92)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem',
      cursor: 'pointer'
    },
    lightboxImg: {
      maxWidth: '92vw',
      maxHeight: '88vh',
      objectFit: 'contain',
      borderRadius: '8px',
      boxShadow: '0 24px 70px rgba(0, 0, 0, 0.5)',
      cursor: 'default'
    },
    lightboxClose: {
      position: 'absolute',
      top: '1.25rem',
      right: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      border: '1px solid rgba(246, 244, 235, 0.3)',
      background: 'rgba(246, 244, 235, 0.1)',
      color: 'var(--paper)',
      fontSize: '1.6rem',
      lineHeight: 1,
      cursor: 'pointer'
    }
  };

  return (
    <>
      <GenericModal show onClose={handleClose} title="Participar en Feria" size="xl" maxHeight>
        <div style={styles.body}>
          {/* Información de la Feria */}
          <div style={{ ...styles.section, ...styles.fairInfo }}>
            <h3 style={styles.sectionTitle}>
              <MapPin size={20} /> Información de la Feria
            </h3>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.label}>Nombre</span>
                <span style={styles.value}>{fair.name}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.label}>Tipo</span>
                <span style={styles.value}>
                  {fair.typeFair === 'interna' ? 'Feria Interna' : 'Feria Externa'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.label}>Ubicación</span>
                <span style={styles.value}>{fair.location}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.label}>Fecha</span>
                <span style={styles.value}>{formatFairDates()}</span>
              </div>
            </div>

            <hr style={styles.infoDivider} />

            <div style={styles.infoBlock}>
              <span style={styles.label}>Descripción</span>
              <span style={styles.value}>{fair.description}</span>
            </div>

            <div style={{ ...styles.infoBlock, marginTop: '1rem' }}>
              <span style={styles.label}>Condiciones de Participación</span>
              <span style={{ ...styles.value, fontSize: '0.88rem', lineHeight: 1.7 }}>
                {fair.conditions}
              </span>
            </div>
          </div>

          {isInternalFair && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Map size={20} /> Mapa de Distribución de Stands
              </h3>
              <div
                style={styles.mapImageWrapper}
                onClick={() => setZoomMap(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZoomMap(true); } }}
              >
                <img
                  src={parkMap}
                  alt="Mapa de distribución de stands"
                  style={styles.mapImage}
                />
              </div>
              <p style={styles.mapCaption}>
                Haz clic en el mapa para ampliarlo
              </p>
            </div>
          )}

          {/* Verificación de estado del usuario */}
          {!isAuthenticated ? (
            <div style={{ ...styles.section, ...styles.warning }}>
              <h3 style={styles.sectionTitle}>Debes iniciar sesión</h3>
              <p>Para participar en las ferias debes tener una cuenta y estar registrado como emprendedor.</p>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '1rem' }}
                onClick={() => window.location.href = '/login'}
              >
                Iniciar Sesión
              </button>
            </div>
          ) : !isEntrepreneur ? (
            <div style={{ ...styles.section, ...styles.warning }}>
              <h3 style={styles.sectionTitle}>Registro de Emprendedor Requerido</h3>
              <p>Para participar en las ferias debes estar registrado como emprendedor.</p>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '1rem' }}
                onClick={() => window.location.href = '/perfil?tab=emprendedor'}
              >
                Registrarse como Emprendedor
              </button>
            </div>
          ) : entrepreneurLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <Loader2 size={48} style={{ marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
              <p>Cargando datos del emprendedor...</p>
            </div>
          ) : entrepreneurError ? (
            <div style={{ ...styles.section, ...styles.error }}>
              <h3 style={styles.sectionTitle}>Error al cargar datos</h3>
              <p>Hubo un problema al cargar tus datos de emprendedor.</p>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '1rem' }}
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          ) : !hasEntrepreneurData ? (
            <div style={{ ...styles.section, ...styles.warning }}>
              <h3 style={styles.sectionTitle}>Completa tu Perfil de Emprendedor</h3>
              <p>Necesitas completar tu información de emprendedor antes de participar en ferias.</p>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '1rem' }}
                onClick={() => window.location.href = '/perfil?tab=emprendedor'}
              >
                Completar Perfil
              </button>
            </div>
          ) : existingEnrollment && !canEnroll ? (
            <div style={{ ...styles.section, ...styles.existingEnrollment }}>
              <h3 style={styles.sectionTitle}>Ya tienes una Inscripción</h3>
              <div style={{ marginBottom: '1rem' }}>
                {React.createElement(getEnrollmentStatusText(existingEnrollment.status).icon, {
                  size: 48,
                  color: getEnrollmentStatusText(existingEnrollment.status).color
                })}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{
                  fontSize: '1.1rem',
                  color: getEnrollmentStatusText(existingEnrollment.status).color
                }}>
                  Estado: {getEnrollmentStatusText(existingEnrollment.status).text}
                </strong>
              </div>

              {isInternalFair && existingEnrollment.status === 'approved' && existingEnrollment.stand && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <p style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <Store size={20} /> <strong>Stand Asignado:</strong> {existingEnrollment.stand.stand_code}
                  </p>
                </div>
              )}

              {existingEnrollment.registration_date && (
                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0.5rem 0' }}>
                  Fecha de inscripción: {new Date(existingEnrollment.registration_date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                {existingEnrollment.status === 'pending' && (
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#374151' }}>
                    Tu solicitud está siendo revisada. Te notificaremos por email cuando tengamos una respuesta.
                  </p>
                )}
                {existingEnrollment.status === 'approved' && (
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#374151' }}>
                    ¡Felicitaciones! Tu inscripción ha sido aprobada. Recibirás más detalles por email.
                  </p>
                )}
              </div>

              <button
                style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}
                onClick={handleClose}
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Mostrar inscripción previa rechazada si existe */}
              {existingEnrollment && existingEnrollment.status === 'rejected' && (
                <div style={{ ...styles.section, background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', borderLeft: '4px solid #ef4444' }}>
                  <h3 style={styles.sectionTitle}>
                    <Info size={20} /> Solicitud Anterior
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#374151', margin: '0 0 1rem 0' }}>
                    Tu solicitud anterior fue <strong style={{ color: '#ef4444' }}>rechazada</strong> el{' '}
                    {existingEnrollment.registration_date &&
                      new Date(existingEnrollment.registration_date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    }. Puedes enviar una nueva solicitud.
                  </p>
                </div>
              )}
              {/* Información del Emprendedor */}
              <div style={{ ...styles.section, ...styles.entrepreneurInfo }}>
                <h3 style={styles.sectionTitle}>
                  <User size={20} /> Tus Datos de Emprendedor
                </h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Nombre Completo</span>
                    <span style={styles.value}>
                      {entrepreneur.person?.first_name} {entrepreneur.person?.second_name ? entrepreneur.person.second_name + ' ' : ''}{entrepreneur.person?.first_lastname} {entrepreneur.person?.second_lastname}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Email</span>
                    <span style={styles.value}>{entrepreneur.person?.email}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Años de Experiencia</span>
                    <span style={styles.value}>{entrepreneur.experience} años</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Emprendimiento</span>
                    <span style={styles.value}>
                      {entrepreneur.entrepreneurship?.name || 'No especificado'}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Categoría</span>
                    <span style={styles.value}>
                      {entrepreneur.entrepreneurship?.category || 'No especificada'}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Enfoque</span>
                    <span style={styles.value}>
                      {entrepreneur.entrepreneurship?.approach ?
                        entrepreneur.entrepreneurship.approach.charAt(0).toUpperCase() + entrepreneur.entrepreneurship.approach.slice(1) :
                        'No especificado'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Selección de stand para ferias internas */}
              {isInternalFair && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    <Store size={20} /> Seleccionar Stand
                  </h3>
                  {allStands.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                      <XCircle size={48} style={{ marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 500 }}>No hay stands registrados para esta feria.</p>
                    </div>
                  ) : (
                    <>
                      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                        Selecciona el stand que prefieres para la feria:
                      </p>
                      <div style={styles.standsGrid}>
                        {allStands.map((stand) => {
                          const isOccupied = stand.status;
                          const isSelected = selectedStand === stand.id_stand;

                          return (
                            <label
                              key={stand.id_stand}
                              style={{
                                ...styles.standOption,
                                ...(isOccupied
                                  ? styles.standOccupied
                                  : isSelected
                                    ? styles.standSelected
                                    : {}
                                )
                              }}
                            >
                              <input
                                type="radio"
                                name="stand"
                                value={stand.id_stand}
                                checked={isSelected}
                                onChange={() => !isOccupied && setSelectedStand(stand.id_stand)}
                                disabled={isOccupied}
                                style={{
                                  position: 'absolute',
                                  opacity: 0,
                                  width: '100%',
                                  height: '100%',
                                  margin: 0,
                                  cursor: isOccupied ? 'not-allowed' : 'pointer'
                                }}
                              />
                              <span style={{
                                fontWeight: 700,
                                fontSize: '1rem',
                                color: isOccupied
                                  ? '#ef4444'
                                  : isSelected
                                    ? '#10b981'
                                    : '#374151'
                              }}>
                                {stand.stand_code}
                              </span>
                              {isOccupied && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#ef4444',
                                  fontWeight: 500,
                                  marginTop: '0.25rem'
                                }}>
                                  Ocupado
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mensajes de estado */}
              {error && (
                <p style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 500, margin: '0.25rem 0' }}>
                  {error}
                </p>
              )}

              {success && (
                <div style={{ ...styles.alert, ...styles.alertSuccess }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={24} />
                    <strong>¡Inscripción Enviada!</strong>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    Tu solicitud de inscripción ha sido enviada exitosamente.
                    Recibirás una confirmación por email y serás notificado sobre el estado de tu solicitud.
                  </p>
                  <button
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                    onClick={handleClose}
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {/* Checkbox de privacidad */}
              <p style={{ fontSize: '0.78rem', color: '#6b7280', textAlign: 'right', margin: '0 0 0.5rem 0' }}>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>*</span> Campo obligatorio
              </p>
              <div style={{ marginBottom: '1.5rem' }}>
                <ConsentCheckbox
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                />
              </div>

              {/* Botones de acción */}
              <div style={styles.actions}>
                <button
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                  onClick={handleClose}
                  disabled={enrollmentMutation.isPending}
                >
                  Cancelar
                </button>

                <button
                  style={{
                    ...styles.button,
                    ...(enrollmentMutation.isPending ||
                      (isInternalFair && !selectedStand) ||
                      (isInternalFair && availableStands.length === 0)
                      ? styles.buttonDisabled
                      : styles.buttonPrimary)
                  }}
                  onClick={handleSubmit}
                  disabled={
                    enrollmentMutation.isPending ||
                    (isInternalFair && !selectedStand) ||
                    (isInternalFair && availableStands.length === 0)
                  }
                >
                  {enrollmentMutation.isPending ? 'Enviando...' : 'Confirmar Inscripción'}
                </button>
              </div>
            </>
          )}
        </div>
      </GenericModal>

      {/* Modal de Confirmación */}
      {showConfirmation && (
        <div style={styles.confirmationOverlay} onClick={(e) => e.stopPropagation()}>
          <div style={styles.confirmationModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.confirmationTitle}>
              ¿Confirmar Inscripción?
            </h3>
            <p style={styles.confirmationMessage}>
              Estás a punto de inscribirte en la feria <strong>"{fair.name}"</strong>.
              {isInternalFair && selectedStand && (
                <><br />Stand seleccionado: <strong>{allStands.find(s => s.id_stand === selectedStand)?.stand_code}</strong></>
              )}
              <br /><br />
              ¿Deseas continuar con la inscripción?
            </p>
            <div style={styles.confirmationActions}>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={handleCancelConfirmation}
              >
                Cancelar
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={handleConfirmSubmit}
                disabled={enrollmentMutation.isPending}
              >
                {enrollmentMutation.isPending ? 'Enviando...' : 'Confirmar Inscripción'}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomMap && (
        <div style={styles.lightboxOverlay} onClick={() => setZoomMap(false)}>
          <button
            style={styles.lightboxClose}
            onClick={() => setZoomMap(false)}
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            src={parkMap}
            alt="Mapa de distribución de stands"
            style={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default FairParticipationModal;