import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMyVolunteerProfile } from "../Services/VolunteersServices";
import axios from "axios";
import { API_BASE_URL } from "../../../config/env";
import "../Styles/VolunteerActivities.css";
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
  Id_volunteer: number;
  Organization: string;
  Affair: string;
  Description: string;
  Hour_volunteer?: number;
  Status: 'En espera' | 'Aprobado' | 'Rechazado';
  Created_at: string;
  Updated_at: string;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export default function MyMailbox() {
  const [, setActiveView] = useState<'list' | 'form'>('list');
  const [showForm, setShowForm] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MailboxRequest | null>(null);
  const { data: volunteer } = useMyVolunteerProfile();
  const queryClient = useQueryClient();

  // Query para obtener las solicitudes del voluntario
  const { data: requests = [], isLoading } = useQuery<MailboxRequest[]>({
    queryKey: ["mailbox", volunteer?.id_volunteer],
    queryFn: async () => {
      if (!volunteer?.id_volunteer) return [];
      const response = await client.get(`/mailbox/volunteer/${volunteer.id_volunteer}`);
      return response.data;
    },
    enabled: !!volunteer?.id_volunteer,
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ["mailbox", volunteer?.id_volunteer] });
      // Mostrar mensaje de éxito por 2 segundos antes de volver a la lista
      setTimeout(() => {
        reset();
        setSelectedFiles([]);
        setIsButtonDisabled(false);
        setShowForm(false);
        setActiveView('list');
        createMailbox.reset(); // Limpiar estado de la mutación
      }, 2000);
    },
    onError: () => {
      // Si hay error, rehabilitar el botón y ocultar error después de 5 segundos
      setIsButtonDisabled(false);
      setTimeout(() => {
        createMailbox.reset(); // Limpiar estado de error
      }, 5000);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // Limitar a 3 archivos
    const limitedFiles = fileArray.slice(0, 3);

    // Combinar con archivos existentes, sin exceder 3 en total
    const combined = [...selectedFiles, ...limitedFiles].slice(0, 3);

    setSelectedFiles(combined);

    // Limpiar el input para permitir volver a seleccionar el mismo archivo
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: MailboxFormValues) => {
    setFormSubmitted(true);

    // Última validación: documentos
    // (en este punto Organization, Affair, Description, Hour_volunteer ya pasaron react-hook-form)
    if (selectedFiles.length < 1) {
      // No hay archivos -> bloqueo
      setIsButtonDisabled(false);
      return;
    }

    if (selectedFiles.length > 3) {
      // Más de 3 archivos -> bloqueo (seguridad extra)
      setIsButtonDisabled(false);
      return;
    }

    // Todo bien -> enviar
    setIsButtonDisabled(true);
    createMailbox.mutate(data);
  };


  return (
    <div className="volunteer-activities">
      <div className="volunteer-activities__header">
        <h3 className="volunteer-activities__title">Solicitudes de Voluntariado</h3>
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
            }}
          >
            + Nueva Solicitud
          </button>
        ) : (
          <button
            onClick={() => {
              reset();
              setShowForm(false);
              setActiveView('list');
              setSelectedFiles([]);
            }}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            ← Volver a mis solicitudes
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
            Mis Solicitudes ({requests.length})
          </h4>
        </div>
      )}

      {/* Vista de lista de solicitudes */}
      {!showForm && !selectedRequest && (
        <div>
          {isLoading ? (
            <div className="volunteer-activities__empty">
              <p>Cargando solicitudes...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="volunteer-activities__empty">
              <div className="volunteer-activities__empty-icon">📬</div>
              <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
                No tienes solicitudes aún
              </p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                Haz clic en "Nueva Solicitud" para enviar tu primera solicitud de voluntariado.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((request) => {
                const statusColors = {
                  'En espera': { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
                  'Aprobado': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
                  'Rechazado': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
                };
                const colors = statusColors[request.Status];

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
                        Solicitud #{request.Id_mailbox}
                      </h4>
                      <span
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        {request.Status}
                      </span>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        <strong>Organización:</strong> {request.Organization}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        <strong>Asunto:</strong> {request.Affair}
                      </p>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      Creada: {new Date(request.Created_at).toLocaleDateString('es-ES', {
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
          )}
        </div>
      )}

      {/* Vista de detalle de solicitud */}
      {!showForm && selectedRequest && (
        <div>
          <button
            onClick={() => setSelectedRequest(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem',
              fontWeight: 500
            }}
          >
            ← Volver a la lista
          </button>

          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            backgroundColor: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                Solicitud #{selectedRequest.Id_mailbox}
              </h3>
              {(() => {
                const statusColors = {
                  'En espera': { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
                  'Aprobado': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
                  'Rechazado': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
                };
                const colors = statusColors[selectedRequest.Status];
                return (
                  <span style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: `1px solid ${colors.border}`
                  }}>
                    {selectedRequest.Status}
                  </span>
                );
              })()}
            </div>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                  Organización
                </label>
                <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#111827' }}>
                  {selectedRequest.Organization}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                  Asunto
                </label>
                <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#111827' }}>
                  {selectedRequest.Affair}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                  Descripción
                </label>
                <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#111827', whiteSpace: 'pre-wrap' }}>
                  {selectedRequest.Description}
                </p>
              </div>

              {selectedRequest.Hour_volunteer && (
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                    Horas de Voluntariado
                  </label>
                  <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#111827' }}>
                    {selectedRequest.Hour_volunteer} horas
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>
                    Fecha de Creación
                  </label>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#111827' }}>
                    {new Date(selectedRequest.Created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>
                    Última Actualización
                  </label>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#111827' }}>
                    {new Date(selectedRequest.Updated_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de formulario */}
      {showForm && (
        <div className="volunteer-apply-form" style={{ width: "100%", marginTop: "1rem" }}>
          <form onSubmit={handleSubmit(onSubmit)} className="volunteer-apply-form__form">
            <div className="volunteer-apply-form__step-header">
              <div className="volunteer-apply-form__step-icon">📬</div>
              <div>
                <h3 className="volunteer-apply-form__step-title">Nueva Solicitud de Voluntariado</h3>
                <p className="volunteer-apply-form__step-description">
                  Envía una solicitud para actividades de voluntariado que no están catalogadas en el sistema.
                </p>
              </div>
            </div>

            <div className="volunteer-apply-form__fields">
              <div>
                <label className="volunteer-apply-form__label">
                  Organización <span className="volunteer-apply-form__required">*</span>
                </label>
                <input
                  className="volunteer-apply-form__input"
                  maxLength={100}
                  placeholder="Nombre de la organización"
                  {...register("Organization", {
                    required: "La organización es requerida",
                    minLength: { value: 3, message: "Mínimo 3 caracteres" },
                    maxLength: { value: 100, message: "Máximo 100 caracteres" },
                  })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {errors.Organization && (
                    <span className="volunteer-apply-form__error-text">{errors.Organization.message}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto', marginTop: '0.25rem' }}>
                    {organizationValue.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label className="volunteer-apply-form__label">
                  Asunto <span className="volunteer-apply-form__required">*</span>
                </label>
                <input
                  className="volunteer-apply-form__input"
                  maxLength={150}
                  placeholder="Asunto de la solicitud"
                  {...register("Affair", {
                    required: "El asunto es requerido",
                    minLength: { value: 5, message: "Mínimo 5 caracteres" },
                    maxLength: { value: 150, message: "Máximo 150 caracteres" },
                  })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {errors.Affair && (
                    <span className="volunteer-apply-form__error-text">{errors.Affair.message}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto', marginTop: '0.25rem' }}>
                    {affairValue.length}/150
                  </span>
                </div>
              </div>

              <div>
                <label className="volunteer-apply-form__label">
                  Descripción <span className="volunteer-apply-form__required">*</span>
                </label>
                <textarea
                  className="volunteer-apply-form__input"
                  maxLength={500}
                  placeholder="Describe tu solicitud de voluntariado"
                  {...register("Description", {
                    required: "La descripción es requerida",
                    minLength: { value: 10, message: "Mínimo 10 caracteres" },
                    maxLength: { value: 500, message: "Máximo 500 caracteres" },
                  })}
                  style={{
                    resize: "none",
                    height: "120px",
                    overflowY: "auto"
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {errors.Description && (
                    <span className="volunteer-apply-form__error-text">{errors.Description.message}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto', marginTop: '0.25rem' }}>
                    {descriptionValue.length}/500
                  </span>
                </div>
              </div>

              <div>
                <label className="volunteer-apply-form__label">
                  Horas de Voluntariado (opcional)
                </label>
                <input
                  type="number"
                  className="volunteer-apply-form__input"
                  min={0}
                  placeholder="Ej: 4"
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
                  <div className="volunteer-apply-form__error" style={{ marginTop: '0.5rem' }}>
                    <svg className="volunteer-apply-form__error-icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                      <path d="M11 7h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                    <p className="volunteer-apply-form__error-text" style={{ margin: 0 }}>
                      {errors.Hour_volunteer.message}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="volunteer-apply-form__label">
                  Documentos (obligatorio, máximo 3)
                </label>
                <input
                  type="file"
                  className="volunteer-apply-form__input"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ padding: "0.5rem" }}
                  disabled={selectedFiles.length >= 3}
                />

                {/* Mensaje de error si intenta enviar sin archivos */}
                {formSubmitted && selectedFiles.length < 1 && (
                  <p
                    style={{
                      color: "#dc2626",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Debes subir al menos 1 documento (CV personal).
                  </p>
                )}

                {/* Mensaje de error si supera el límite (defensa extra, casi nunca pasará porque ya limitamos a 3) */}
                {formSubmitted && selectedFiles.length > 3 && (
                  <p
                    style={{
                      color: "#dc2626",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Solo se permiten máximo 3 archivos.
                  </p>
                )}

                {/* Mensaje informativo si ya llegó a 3 */}
                {selectedFiles.length === 3 && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#059669",
                      marginTop: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    ✓ Has alcanzado el límite de 3 archivos
                  </p>
                )}

                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    marginTop: "0.25rem",
                  }}
                >
                  Formatos aceptados: PDF, DOC, DOCX, JPG, PNG (mínimo 1 y máximo 3 archivos)
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
                          <span style={{ fontSize: "1.5rem" }}>
                            {file.type.includes("pdf")
                              ? "📄"
                              : file.type.includes("image")
                                ? "🖼️"
                                : "📎"}
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
                              }}
                            >
                              {file.name}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "1.25rem",
                            padding: "0.25rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "0.25rem",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fee2e2")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                          title="Eliminar archivo"
                        >
                          ✕
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
                      "Error al enviar la solicitud"}
                  </p>
                </div>
              )}

              {createMailbox.isSuccess && (
                <div className="volunteer-apply-form__success">
                  <svg className="volunteer-apply-form__success-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <p className="volunteer-apply-form__success-text">
                    Solicitud enviada correctamente
                  </p>
                </div>
              )}
            </div>

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
                {createMailbox.isPending ? "Enviando..." : createMailbox.isSuccess ? "Enviado ✓" : "Enviar Solicitud"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
