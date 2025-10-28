// src/Modules/Volunteers/Services/VolunteersServices.ts
import axios from "axios";

/** Estados admitidos por el backend */
export type VolunteerStatus = "ACTIVE" | "INACTIVE" | "PENDING";

/** Tipos de teléfono */
export type PhoneType = "personal" | "business";

/** Estructura de Phone que espera el backend */
export interface CreatePhoneDto {
  number: string;
  type?: PhoneType;
  is_primary?: boolean;
}

/** Estructura de Person que espera el backend */
export interface CreatePersonDto {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phones: CreatePhoneDto[];
}

/** Payload para registro público de voluntario */
export interface PublicRegisterVolunteerDto {
  person: CreatePersonDto;
}

/** Payload legacy para compatibilidad (DEPRECATED - usar PublicRegisterVolunteerDto) */
export interface CreateVolunteerPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills?: string;
  status?: VolunteerStatus;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true,
});

export const VolunteersApi = {
  /**
   * Registro público de voluntarios (sin login)
   * Endpoint: POST /volunteers/public/register
   */
  async createPublic(payload: PublicRegisterVolunteerDto) {
    const { data } = await api.post("/volunteers/public/register", payload);
    return data;
  },

  // Métodos extra por si luego conectás el admin (opcionales ahora):
  async list(params?: { page?: number; limit?: number; q?: string; status?: VolunteerStatus | "ALL" }) {
    const { data } = await api.get("/volunteers", { params });
    return data;
  },
  async get(id: number) {
    const { data } = await api.get(`/volunteers/${id}`);
    return data;
  },
  async update(id: number, payload: Partial<CreateVolunteerPayload>) {
    const { data } = await api.put(`/volunteers/${id}`, payload);
    return data;
  },
  async setStatus(id: number, status: VolunteerStatus) {
    const { data } = await api.patch(`/volunteers/${id}/status`, { status });
    return data;
  },
  async remove(id: number) {
    const { data } = await api.delete(`/volunteers/${id}`);
    return data;
  },
  async sendMailbox(input: { subject: string; message: string; volunteerId?: number; files?: File[] }) {
    const form = new FormData();
    form.append("subject", input.subject);
    form.append("message", input.message);
    if (input.volunteerId) form.append("volunteerId", String(input.volunteerId));
    input.files?.forEach((f) => form.append("files", f));
    const { data } = await api.post("/volunteers/mailbox", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { ok: boolean };
  },
};
