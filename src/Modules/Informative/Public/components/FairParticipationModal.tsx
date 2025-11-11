import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Auth/context/AuthContext';
import { useEntrepreneurByUserEmail } from '../../../Entrepreneurs/Services/EntrepreneursServices';
import { useStandsByFair, useCreateFairEnrollment, useFairEnrollmentsByFair, type PublicFair, type EnrollmentRequest } from '../../../Fairs/Services/FairsServices';
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

  const userEmail = (user as any)?.email;
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
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    content: {
      background: 'white',
      borderRadius: '16px',
      maxWidth: '1000px',
      width: '95%',
      maxHeight: '95vh',
      overflowY: 'auto' as const,
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      position: 'relative' as const
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '2rem 2rem 1rem 2rem',
      borderBottom: '1px solid #e5e7eb'
    },
    title: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#1f2937'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0.5rem',
      borderRadius: '50%',
      transition: 'background-color 0.2s'
    },
    body: {
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem'
    },
    section: {
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    } as React.CSSProperties,
    fairInfo: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderLeft: '4px solid #3b82f6'
    },
    entrepreneurInfo: {
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderLeft: '4px solid #10b981'
    },
    warning: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '1px solid #f59e0b',
      textAlign: 'center' as const
    },
    error: {
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      border: '1px solid #ef4444',
      textAlign: 'center' as const
    },
    existingEnrollment: {
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '2px solid #f59e0b',
      textAlign: 'center' as const
    },
    sectionTitle: {
      margin: '0 0 1rem 0',
      color: '#1f2937',
      fontSize: '1.1rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#6b7280',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    },
    value: {
      fontSize: '1rem',
      color: '#1f2937',
      fontWeight: 500,
      wordBreak: 'break-word'
    } as React.CSSProperties,
    standsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
      gap: '0.75rem',
      marginTop: '1rem'
    },
    standOption: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      cursor: 'pointer',
      background: 'white',
      transition: 'all 0.2s ease',
      position: 'relative' as const
    },
    standSelected: {
      borderColor: '#10b981',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
    },
    standOccupied: {
      borderColor: '#ef4444',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    alert: {
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: 500,
      textAlign: 'center' as const
    },
    alertError: {
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      color: '#dc2626',
      border: '1px solid #fecaca'
    },
    alertSuccess: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      color: '#16a34a',
      border: '2px solid #16a34a',
      fontSize: '1.1rem',
      fontWeight: 600,
      padding: '1.5rem 2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(16, 163, 74, 0.15)'
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      border: '1px solid transparent',
      transition: 'all 0.2s ease'
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      borderColor: '#059669'
    },
    buttonSecondary: {
      background: 'white',
      color: '#374151',
      borderColor: '#d1d5db'
    },
    buttonDisabled: {
      background: '#f3f4f6',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    confirmationOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001
    },
    confirmationModal: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      textAlign: 'center' as const,
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
    },
    confirmationTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#1f2937',
      marginBottom: '1rem'
    },
    confirmationMessage: {
      fontSize: '1rem',
      color: '#4b5563',
      lineHeight: 1.6,
      marginBottom: '2rem'
    },
    confirmationActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    }, mapContainer: {
      width: '100%',
      marginBottom: '2rem',
      textAlign: 'center' as const
    },
    mapTitle: {
      margin: '0 0 1rem 0',
      color: '#374151',
      fontSize: '1.1rem',
      fontWeight: 600
    },
    mapImageWrapper: {
      width: '100%',
      background: 'white',
      padding: '1rem',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    mapImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '500px',
      borderRadius: '6px',
      objectFit: 'contain' as const,
      display: 'block',
      margin: '0 auto'
    },
    mapCaption: {
      fontSize: '0.9rem',
      color: '#6b7280',
      margin: '0.75rem 0 0 0',
      fontStyle: 'italic',
      textAlign: 'center' as const
    }

  };

  return (
    <div style={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Participar en Feria</h2>
          <button
            style={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div style={styles.body}>
          {/* Información de la Feria */}
          <div style={{ ...styles.section, ...styles.fairInfo }}>
            <h3 style={styles.sectionTitle}>
              <MapPin size={20} /> Información de la Feria
            </h3>

            {/* Agrega esta condición para mostrar la imagen solo en ferias internas */}
            {isInternalFair && (
              <div style={styles.mapContainer}>
                <h4 style={styles.mapTitle}>
                  <Map size={20} style={{ display: 'inline', marginRight: '0.5rem' }} /> Mapa de Distribución de Stands
                </h4>
                <div style={styles.mapImageWrapper}>
                  <img
                    src={parkMap}
                    alt="Mapa de distribución de stands"
                    style={styles.mapImage}
                  />
                </div>
                <p style={styles.mapCaption}>
                  Visualiza la distribución de los stands disponibles para elegir tu ubicación preferida
                </p>
              </div>
            )}

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
              <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
                <span style={styles.label}>Descripción</span>
                <span style={styles.value}>{fair.description}</span>
              </div>
              <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
                <span style={styles.label}>Condiciones de Participación</span>
                <span style={{ ...styles.value, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {fair.conditions}
                </span>
              </div>
            </div>
          </div>

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
                <div style={{ ...styles.alert, ...styles.alertError }}>
                  {error}
                </div>
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
      </div>

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
    </div>
  );
};

export default FairParticipationModal;