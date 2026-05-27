import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Inbox,
  FileText,
  Image as ImageIcon,
  Paperclip,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useMyVolunteerProfile } from "../Services/VolunteersServices";
import axios from "axios";
import { API_BASE_URL } from "../../../config/env";
import "../Styles/VolunteerActivities.css";
import "../Styles/MailboxForm.css";
import "../Styles/MailboxTable.css";
import "../../Auth/styles/profile-page.css";

interface MailboxFormValues {
  Organization: string;
  Affair: string;
  Description: string;
  Hour_volunteer?: number;
  documents?: FileList;
}

interface MailboxRequest {
  Id_mailbox: number;
  Organization: string;
  Affair: string;
  Description: string;
  Hour_volunteer: number;
  Registration_date: string;
  Update_date: string;
  Document1?: string;
  Document2?: string;
  Document3?: string;
  volunteer: {
    id_volunteer: number;
    person: {
      Name: string;
      Last_name_1: string;
      Last_name_2?: string;
    };
  };
}

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Función helper para formatear fechas
function formatFecha(dateString: string) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Ícono de archivo según tipo MIME
function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.includes("image")) return <ImageIcon size={20} />;
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("document"))
    return <FileText size={20} />;
  return <Paperclip size={20} />;
}

export default function MyMailbox() {
  const [, setActiveView] = useState<'list' | 'form'>('list');
  const [showForm, setShowForm] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MailboxRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: volunteer } = useMyVolunteerProfile();
  const queryClient = useQueryClient();

  // Ref para evitar window.scrollTo en el mount inicial
  const wasModalOpen = useRef(false);

  // Query para obtener TODAS las solicitudes y filtrar por el voluntario logueado
  const { data: allRequests = [], isLoading } = useQuery<MailboxRequest[]>({
    queryKey: ["mailbox"],
    queryFn: async () => {
      const response = await client.get(`/mailbox`);
      return response.data;
    },
    enabled: !!volunteer?.id_volunteer,
  });

  // Filtrar solo las solicitudes del voluntario logueado
  const requests = allRequests.filter(
    (request) => request.volunteer?.id_volunteer === volunteer?.id_volunteer
  );

  // Calcular paginación
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  const [formSubmitted, setFormSubmitted] = useState(false);

  // Resetear página cuando se agregan/eliminan solicitudes
  useEffect(() => {
    setCurrentPage(1);
  }, [requests.length]);

  // Prevenir scroll del body cuando el modal está abierto
  // Se usa wasModalOpen para NO llamar window.scrollTo en el primer render
  useEffect(() => {
    if (selectedRequest) {
      wasModalOpen.current = true;
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else if (wasModalOpen.current) {
      // Solo restaurar scroll si el modal estuvo abierto antes
      wasModalOpen.current = false;
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [selectedRequest]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRequest) {
        setSelectedRequest(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedRequest]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MailboxFormValues>();

  // Observar valores para contadores
  const organizationValue = watch("Organization", "");
  const affairValue = watch("Affair", "");
  const descriptionValue = watch("Description", "");

  const createMailbox = useMutation({
    mutationFn: async (data: MailboxFormValues) => {
      if (!volunteer?.id_volunteer) {
        throw new Error("No se encontró el ID del voluntario");
      }

      const formData = new FormData();
      formData.append("Organization", data.Organization);
      formData.append("Affair", data.Affair);
      formData.append("Description", data.Description);
      formData.append("Id_volunteer", volunteer.id_volunteer.toString());

      if (data.Hour_volunteer) {
        formData.append("Hour_volunteer", data.Hour_volunteer.toString());
      }

      // Agregar archivos desde el estado (máximo 3)
      selectedFiles.forEach((file) => {
        formData.append("documents", file);
      });

      const response = await client.post("/mailbox", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailbox"] });
      setTimeout(() => {
        reset();
        setSelectedFiles([]);
        setIsButtonDisabled(false);
        setShowForm(false);
        setActiveView('list');
        createMailbox.reset();
      }, 2000);
    },
    onError: () => {
      setIsButtonDisabled(false);
      setTimeout(() => {
        createMailbox.reset();
      }, 5000);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const limitedFiles = fileArray.slice(0, 3);
    const combined = [...selectedFiles, ...limitedFiles].slice(0, 3);
    setSelectedFiles(combined);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: MailboxFormValues) => {
    setFormSubmitted(true);

    if (selectedFiles.length < 1) {
      setIsButtonDisabled(false);
      return;
    }

    if (selectedFiles.length > 3) {
      setIsButtonDisabled(false);
      return;
    }

    setIsButtonDisabled(true);
    createMailbox.mutate(data);
  };


  return (
    <div className="volunteer-activities">
      <div className="volunteer-activities__header">
        <h3 className="volunteer-activities__title">Propuestas de Voluntariado</h3>
        {!showForm ? (
          <button
            onClick={() => {
              setShowForm(true);
              setActiveView('form');
            }}
            className="btn btn--primary"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <Mail size={15} />
            Nueva Propuesta
          </button>
        ) : (
          <button
            onClick={() => {
              reset();
              setShowForm(false);
              setActiveView('list');
              setSelectedFiles([]);
            }}
            disabled={isButtonDisabled}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: isButtonDisabled ? '#9ca3af' : '#52AC83',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              transition: 'background-color 0.2s',
              opacity: isButtonDisabled ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isButtonDisabled) {
                e.currentTarget.style.backgroundColor = '#3d9068';
              }
            }}
            onMouseLeave={(e) => {
              if (!isButtonDisabled) {
                e.currentTarget.style.backgroundColor = '#52AC83';
              }
            }}
          >
            <ArrowLeft size={15} />
            Volver a mis propuestas
          </button>
        )}
      </div>

      {/* Título de sección solo cuando no está mostrando el formulario */}
      {!showForm && (
        <div style={{
          borderBottom: '2px solid #e5e7eb',
          marginTop: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827'
          }}>
            Mis Propuestas ({requests.length})
          </h4>
        </div>
      )}

      {/* Vista de lista de propuestas */}
      {!showForm && !selectedRequest && (
        <div>
          {isLoading ? (
            <div className="volunteer-activities__empty">
              <p>Cargando propuestas...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="volunteer-activities__empty">
              <div className="volunteer-activities__empty-icon">
                <Inbox size={48} strokeWidth={1.5} />
              </div>
              <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
                No tienes propuestas aún
              </p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                Haz clic en "Nueva Propuesta" para enviar tu primera propuesta de voluntariado.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {paginatedRequests.map((request) => {
                  return (
                    <div
                      key={request.Id_mailbox}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                      onClick={() => setSelectedRequest(request)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
                          Propuesta #{request.Id_mailbox}
                        </h4>
                        {/* Badge "Enviada" — verde fundación */}
                        <span
                          style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          Enviada
                        </span>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Organización:</strong> {request.Organization}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Asunto:</strong> {request.Affair}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Descripción:</strong> {request.Description.substring(0, 100)}{request.Description.length > 100 ? '...' : ''}
                        </p>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        Creada: {new Date(request.Registration_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="volunteer-activities__pagination">
                  <button
                    className="volunteer-activities__page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={16} />
                    <span>Anterior</span>
                  </button>
                  <span className="volunteer-activities__page-info">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    className="volunteer-activities__page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                  >
                    <span>Siguiente</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Vista de formulario */}
      {showForm && (
        <div className="volunteer-apply-form" style={{ width: "100%", marginTop: "1rem" }}>
          <form onSubmit={handleSubmit(onSubmit)} className="volunteer-apply-form__form">
            <div className="volunteer-apply-form__step-header">
              {/* Ícono de buzón con lucide-react */}
              <div className="volunteer-apply-form__step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={32} strokeWidth={1.5} color="#52AC83" />
              </div>
              <div>
                <h3 className="volunteer-apply-form__step-title">Nueva Propuesta de Voluntariado</h3>
                <p className="volunteer-apply-form__step-description">
                  Envía una propuesta para realizar actividades de voluntariado que no están en el sistema.
                </p>
              </div>
            </div>

            <div className="volunteer-apply-form__fields">
              <div>
                <label className="volunteer-apply-form__label">
                  Organización / Comunidad{' '}
                  {!organizationValue?.trim() && <span className="volunteer-apply-form__required">*</span>}
                </label>
                <input
                  className="volunteer-apply-form__input"
                  maxLength={255}
                  placeholder="Nombre de la organización"
                  disabled={isButtonDisabled}
                  {...register("Organization", {
                    required: "La organización es requerida",
                    minLength: { value: 3, message: "Mínimo 3 caracteres" },
                    maxLength: { value: 255, message: "Máximo 255 caracteres" },
                  })}
                />
                <div className="volunteer-apply-form__field-info">
                  {errors.Organization ? (
                    <span className="volunteer-apply-form__error-text">{errors.Organization.message}</span>
                  ) : (
                    <span className="volunteer-apply-form__min-length">Mínimo: 3 caracteres</span>
                  )}
                  <span className={`volunteer-apply-form__character-count ${
                    organizationValue.length > 240 ? 'volunteer-apply-form__character-count--warning' : ''
                  } ${organizationValue.length >= 255 ? 'volunteer-apply-form__character-count--error' : ''}`}>
                    {organizationValue.length}/255
                  </span>
                </div>
              </div>

              <div>
                <label className="volunteer-apply-form__label">
                  Asunto{' '}
                  {!affairValue?.trim() && <span className="volunteer-apply-form__required">*</span>}
                </label>
                <textarea
                  className="volunteer-apply-form__input"
                  maxLength={255}
                  placeholder="Asunto de la propuesta"
                  disabled={isButtonDisabled}
                  {...register("Affair", {
                    required: "El asunto es requerido",
                    minLength: { value: 5, message: "Mínimo 5 caracteres" },
                    maxLength: { value: 255, message: "Máximo 255 caracteres" },
                  })}
                  style={{
                    resize: "none",
                    minHeight: "45px",
                    maxHeight: "90px",
                    overflowY: "auto"
                  }}
                  rows={2}
                />
                <div className="volunteer-apply-form__field-info">
                  {errors.Affair ? (
                    <span className="volunteer-apply-form__error-text">{errors.Affair.message}</span>
                  ) : (
                    <span className="volunteer-apply-form__min-length">Mínimo: 5 caracteres</span>
                  )}
                  <span className={`volunteer-apply-form__character-count ${
                    affairValue.length > 240 ? 'volunteer-apply-form__character-count--warning' : ''
                  } ${affairValue.length >= 255 ? 'volunteer-apply-form__character-count--error' : ''}`}>
                    {affairValue.length}/255
                  </span>
                </div>
              </div>

              <div>
                <label className="volunteer-apply-form__label">
                  Descripción{' '}
                  {!descriptionValue?.trim() && <span className="volunteer-apply-form__required">*</span>}
                </label>
                <textarea
                  className="volunteer-apply-form__input"
                  maxLength={255}
                  placeholder="Describe tu propuesta de voluntariado"
                  disabled={isButtonDisabled}
                  {...register("Description", {
                    required: "La descripción es requerida",
                    minLength: { value: 10, message: "Mínimo 10 caracteres" },
                    maxLength: { value: 255, message: "Máximo 255 caracteres" },
                  })}
                  style={{
                    resize: "none",
                    height: "120px",
                    overflowY: "auto"
                  }}
                />
                <div className="volunteer-apply-form__field-info">
                  {errors.Description ? (
                    <span className="volunteer-apply-form__error-text">{errors.Description.message}</span>
                  ) : (
                    <span className="volunteer-apply-form__min-length">Mínimo: 10 caracteres</span>
                  )}
                  <span className={`volunteer-apply-form__character-count ${
                    descriptionValue.length > 240 ? 'volunteer-apply-form__character-count--warning' : ''
                  } ${descriptionValue.length >= 255 ? 'volunteer-apply-form__character-count--error' : ''}`}>
                    {descriptionValue.length}/255
                  </span>
                </div>
              </div>

              <div>
                <label className="volunteer-apply-form__label">
                  Horas de Voluntariado{' '}
                  <span className="volunteer-apply-form__optional">(opcional)</span>
                </label>
                <input
                  type="number"
                  className="volunteer-apply-form__input"
                  min={0}
                  placeholder="Ej: 4"
                  disabled={isButtonDisabled}
                  {...register("Hour_volunteer", {
                    min: { value: 0, message: "Las horas deben ser 0 o más" },
                    validate: (value) => {
                      if (value === undefined || value === null) return true;
                      if (value < 0) return "Las horas deben ser 0 o más";
                      return true;
                    }
                  })}
                />
                {errors.Hour_volunteer && (
                  <span className="volunteer-apply-form__error-text" style={{ display: 'block', marginTop: '0.25rem' }}>
                    {errors.Hour_volunteer.message}
                  </span>
                )}
              </div>

              <div>
                <label className="volunteer-apply-form__label">
                  Documentos <span className="volunteer-apply-form__required">obligatorio, mínimo 1 y máximo 3</span>
                </label>

                {/* Input oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={selectedFiles.length >= 3 || isButtonDisabled}
                />

                {/* Botón personalizado */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length >= 3 || isButtonDisabled}
                  style={{
                    width: '100%',
                    backgroundColor: selectedFiles.length >= 3 || isButtonDisabled ? '#f3f4f6' : '#ffffff',
                    color: selectedFiles.length >= 3 || isButtonDisabled ? '#9ca3af' : '#1f2937',
                    border: selectedFiles.length >= 3 || isButtonDisabled ? '2px dashed #d1d5db' : '2px dashed #94a3b8',
                    padding: '1.25rem 1.5rem',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: selectedFiles.length >= 3 || isButtonDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    borderRadius: '0.5rem',
                    boxShadow: selectedFiles.length >= 3 || isButtonDisabled ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    opacity: selectedFiles.length >= 3 || isButtonDisabled ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFiles.length < 3 && !isButtonDisabled) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#52AC83';
                      e.currentTarget.style.color = '#52AC83';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(82, 172, 131, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFiles.length < 3 && !isButtonDisabled) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#94a3b8';
                      e.currentTarget.style.color = '#1f2937';
                      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                    }
                  }}
                >
                  <Paperclip size={20} />
                  Seleccionar documentos
                </button>

                {/* Mensaje de error si intenta enviar sin archivos */}
                {formSubmitted && selectedFiles.length < 1 && (
                  <span className="volunteer-apply-form__validation-error">
                    Debes subir al menos 1 documento (CV personal).
                  </span>
                )}

                {/* Mensaje de error si supera el límite */}
                {formSubmitted && selectedFiles.length > 3 && (
                  <span className="volunteer-apply-form__validation-error">
                    Solo se permiten máximo 3 archivos.
                  </span>
                )}

                {/* Mensaje informativo si ya llegó a 3 */}
                {selectedFiles.length === 3 && (
                  <span className="volunteer-apply-form__validation-success">
                    Has alcanzado el límite de 3 archivos
                  </span>
                )}

                <p className="volunteer-apply-form__min-length" style={{ marginTop: '0.25rem' }}>
                  Formatos aceptados: PDF, DOC, DOCX, JPG, PNG
                </p>

                {/* Previsualización de archivos */}
                {selectedFiles.length > 0 && (
                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.75rem",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <span style={{ color: "#6b7280", flexShrink: 0 }}>
                            <FileIcon mimeType={file.type} />
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                color: "#111827",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                margin: 0,
                              }}
                            >
                              {file.name}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0 }}>
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={isButtonDisabled}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: isButtonDisabled ? "#9ca3af" : "#ef4444",
                            cursor: isButtonDisabled ? "not-allowed" : "pointer",
                            padding: "0.25rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "0.25rem",
                            transition: "background-color 0.2s",
                            opacity: isButtonDisabled ? 0.5 : 1,
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            if (!isButtonDisabled) {
                              e.currentTarget.style.backgroundColor = "#fee2e2";
                            }
                          }}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                          title={isButtonDisabled ? "No disponible durante el envío" : "Eliminar archivo"}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {createMailbox.isError && (
                <div className="volunteer-apply-form__error">
                  <svg className="volunteer-apply-form__error-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 7h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                  <p className="volunteer-apply-form__error-text">
                    {(createMailbox.error as any)?.response?.data?.message ||
                      (createMailbox.error as any)?.message ||
                      "Error al enviar la propuesta"}
                  </p>
                </div>
              )}

              {createMailbox.isSuccess && (
                <div className="volunteer-apply-form__success">
                  <svg className="volunteer-apply-form__success-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <p className="volunteer-apply-form__success-text">
                    Propuesta enviada correctamente
                  </p>
                </div>
              )}
            </div>

            {/* Leyenda "* Campo obligatorio" justo antes del botón */}
            <p className="volunteer-apply-form__required-legend" style={{ textAlign: 'left', marginBottom: 0 }}>
              <span className="volunteer-apply-form__required">*</span> Campo obligatorio
            </p>

            <div className="volunteer-apply-form__actions">
              <button
                type="button"
                className="volunteer-apply-form__btn volunteer-apply-form__btn--cancel"
                onClick={() => {
                  reset();
                  setShowForm(false);
                  setFormSubmitted(false);
                  setActiveView('list');
                  setSelectedFiles([]);
                }}
                disabled={isButtonDisabled}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="volunteer-apply-form__btn volunteer-apply-form__btn--submit"
                disabled={isButtonDisabled}
              >
                {createMailbox.isPending ? "Enviando..." : createMailbox.isSuccess ? "Enviado ✓" : "Enviar Propuesta"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de detalle de propuesta - Renderizado con Portal */}
      {selectedRequest && createPortal(
        <div
          className="mailbox-modal__overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <div className="mailbox-modal__card">
            {/* Header del modal */}
            <div className="mailbox-modal__header">
              <div className="mailbox-modal__icon">
                <Mail size={20} />
              </div>
              <div className="mailbox-modal__header-main">
                <div className="mailbox-modal__title">
                  Propuesta #{selectedRequest.Id_mailbox}
                </div>
                <div className="mailbox-modal__subtitle">
                  {formatFecha(selectedRequest.Registration_date)}
                </div>
              </div>
            </div>

            {/* Body del modal — dos columnas en desktop */}
            <div className="mailbox-modal__body">
              <div className="mailbox-modal__body-grid">
                {/* Columna izquierda: Organización + Asunto */}
                <div>
                  <div className="mailbox-modal__section">
                    <div className="mailbox-modal__label">Organización</div>
                    <div className="mailbox-modal__value-normal">
                      {selectedRequest.Organization || "—"}
                    </div>
                  </div>
                  <div className="mailbox-modal__section">
                    <div className="mailbox-modal__label">Asunto</div>
                    <div className="mailbox-modal__value-normal">
                      {selectedRequest.Affair || "—"}
                    </div>
                  </div>
                </div>

                {/* Columna derecha: Descripción + Horas */}
                <div>
                  <div className="mailbox-modal__section">
                    <div className="mailbox-modal__label">Descripción</div>
                    <div className="mailbox-modal__desc-box">
                      {selectedRequest.Description || "—"}
                    </div>
                  </div>
                  <div className="mailbox-modal__section">
                    <div className="mailbox-modal__label">Horas de Voluntariado</div>
                    <div className="mailbox-modal__value-normal">
                      {selectedRequest.Hour_volunteer ?? 0} horas
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentos — ancho completo */}
              {(selectedRequest.Document1 ||
                selectedRequest.Document2 ||
                selectedRequest.Document3) && (
                <div className="mailbox-modal__docs-listwrap">
                  <div className="mailbox-modal__docs-label">Documentos Adjuntos</div>
                  <ul className="mailbox-modal__docs-list">
                    {selectedRequest.Document1 && (
                      <li className="mailbox-modal__docs-item">
                        <span className="mailbox-modal__docs-item-label">Documento #1: </span>
                        <a
                          href={selectedRequest.Document1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mailbox-modal__link"
                        >
                          Ver documento
                        </a>
                      </li>
                    )}
                    {selectedRequest.Document2 && (
                      <li className="mailbox-modal__docs-item">
                        <span className="mailbox-modal__docs-item-label">Documento #2: </span>
                        <a
                          href={selectedRequest.Document2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mailbox-modal__link"
                        >
                          Ver documento
                        </a>
                      </li>
                    )}
                    {selectedRequest.Document3 && (
                      <li className="mailbox-modal__docs-item">
                        <span className="mailbox-modal__docs-item-label">Documento #3: </span>
                        <a
                          href={selectedRequest.Document3}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mailbox-modal__link"
                        >
                          Ver documento
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="mailbox-modal__footer">
              <button
                onClick={() => setSelectedRequest(null)}
                className="mailbox-modal__close-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
