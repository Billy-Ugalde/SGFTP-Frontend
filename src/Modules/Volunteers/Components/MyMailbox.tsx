import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMyVolunteerProfile } from "../Services/VolunteersServices";
import axios from "axios";
import "../Styles/VolunteerActivities.css";
import "../../Auth/styles/profile-page.css";

interface MailboxFormValues {
  Organization: string;
  Affair: string;
  Description: string;
  Hour_volunteer?: number;
  documents?: FileList;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true,
});

export default function MyMailbox() {
  const [showForm, setShowForm] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { data: volunteer } = useMyVolunteerProfile();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
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

      const response = await api.post("/mailbox", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailbox"] });
      // Mostrar mensaje de éxito por 3 segundos antes de resetear
      setTimeout(() => {
        reset();
        setSelectedFiles([]);
        setIsButtonDisabled(false);
        createMailbox.reset(); // Limpiar estado de la mutación
      }, 3000);
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
    // Deshabilitar botón inmediatamente al hacer clic
    setIsButtonDisabled(true);
    createMailbox.mutate(data);
  };

  return (
    <div className="volunteer-activities">
      <div className="volunteer-activities__header">
        <h3 className="volunteer-activities__title">Solicitudes de Voluntariado</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn--primary"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
            }}
          >
            + Nueva Solicitud
          </button>
        )}
      </div>

      {showForm ? (
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
                  Documentos (opcional, máximo 3)
                </label>
                <input
                  type="file"
                  className="volunteer-apply-form__input"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ padding: "0.5rem", display: selectedFiles.length >= 3 ? 'none' : 'block' }}
                  disabled={selectedFiles.length >= 3}
                />
                {selectedFiles.length >= 3 && (
                  <p style={{ fontSize: "0.875rem", color: "#059669", marginTop: "0.5rem", fontWeight: 500 }}>
                    ✓ Has alcanzado el límite de 3 archivos
                  </p>
                )}
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                  Formatos aceptados: PDF, DOC, DOCX, JPG, PNG (máximo 3 archivos)
                </p>

                {/* Previsualización de archivos */}
                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "1.5rem" }}>
                            {file.type.includes("pdf") ? "📄" : file.type.includes("image") ? "🖼️" : "📎"}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "#111827",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}>
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
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
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
      ) : (
        <div className="volunteer-activities__empty">
          <div className="volunteer-activities__empty-icon">📬</div>
          <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
            Envía solicitudes de voluntariado
          </p>
          <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
            Aquí puedes enviar solicitudes para actividades de voluntariado que no están
            catalogadas en el sistema. Haz clic en "Nueva Solicitud" para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}
