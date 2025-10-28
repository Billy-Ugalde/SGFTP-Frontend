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
  const { data: volunteer } = useMyVolunteerProfile();
  const queryClient = useQueryClient();

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

      // Agregar archivos (hasta 3)
      if (data.documents && data.documents.length > 0) {
        const files = Array.from(data.documents).slice(0, 3);
        files.forEach((file) => {
          formData.append("documents", file);
        });
      }

      const response = await api.post("/mailbox", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Mostrar mensaje de éxito por 2 segundos antes de cerrar
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["mailbox"] });
        reset();
        setIsButtonDisabled(false);
        setShowForm(false);
      }, 2000);
    },
    onError: () => {
      // Si hay error, rehabilitar el botón
      setIsButtonDisabled(false);
    },
  });

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
                    min: { value: 0, message: "Debe ser un número positivo" },
                  })}
                />
                {errors.Hour_volunteer && (
                  <span className="volunteer-apply-form__error-text">{errors.Hour_volunteer.message}</span>
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
                  {...register("documents")}
                  style={{ padding: "0.5rem" }}
                />
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                  Formatos aceptados: PDF, DOC, DOCX, JPG, PNG (máximo 3 archivos)
                </p>
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
