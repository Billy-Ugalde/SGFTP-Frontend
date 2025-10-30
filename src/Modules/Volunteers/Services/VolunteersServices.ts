// src/Modules/Volunteers/Services/VolunteersServices.ts
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Volunteer,
  CreateVolunteerDto,
  VolunteerFormData,
  UpdateVolunteerDto,
  VolunteerUpdateData
} from '../Types';

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

/** Estructura completa de Phone con ID (respuesta del backend) */
export interface Phone {
  id_phone: number;
  number: string;
  type: PhoneType;
  is_primary: boolean;
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

/** Estructura completa de Person (respuesta del backend) */
export interface Person {
  id_person: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phones: Phone[];
}

/** Estructura completa de Volunteer (respuesta del backend) */
export interface Volunteer {
  id_volunteer: number;
  is_active: boolean;
  registration_date: string;
  updated_at: string;
  person: Person;
}

/** Payload para registro público de voluntario */
export interface PublicRegisterVolunteerDto {
  person: CreatePersonDto;
}

/** Payload para actualizar perfil propio (PUT /volunteers/me) */
export interface UpdateMyProfileDto {
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

/**
 * Estructura de un item del buzón administrativo
 * (respuesta de GET /mailbox para roles admin)
 */
export interface MailboxAdminItem {
  Id_mailbox: number;
  Organization: string;
  Affair: string;
  Description: string;
  Hour_volunteer?: number;
  Status: "En espera" | "Aprobado" | "Rechazado";
  Registration_date?: string;
  Created_at?: string;
  Updated_at?: string;
  volunteer?: {
    id_volunteer: number;
    first_name: string;
    second_name?: string;
    first_lastname: string;
    second_lastname?: string;
    email: string;
    phone?: string;
  };
}

const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true
});

export const VolunteersApi = {
  /**
   * Registro público de voluntarios (sin login)
   * Endpoint: POST /volunteers/public/register
   */
  async createPublic(payload: PublicRegisterVolunteerDto) {
    const { data } = await client.post("/volunteers/public/register", payload);
    return data;
  },

  /**
   * Obtener mi perfil de voluntario (autenticado)
   * Endpoint: GET /volunteers/me
   */
  async getMe(): Promise<Volunteer> {
    const { data } = await client.get("/volunteers/me");
    return data;
  },

  /**
   * Actualizar mi perfil de voluntario (autenticado)
   * Endpoint: PUT /volunteers/me
   */
  async updateMe(payload: UpdateMyProfileDto): Promise<Volunteer> {
    const { data } = await client.put("/volunteers/me", payload);
    return data;
  },

  /**
   * Obtener mis próximas actividades (autenticado)
   * Endpoint: GET /volunteers/me/activity-enrollments/upcoming
   */
  async getMyUpcomingActivities() {
    const { data } = await client.get("/volunteers/me/activity-enrollments/upcoming");
    return data;
  },

  /**
   * Obtener mi historial de actividades (autenticado)
   * Endpoint: GET /volunteers/me/activity-enrollments/past
   */
  async getMyPastActivities() {
    const { data } = await client.get("/volunteers/me/activity-enrollments/past");
    return data;
  },

  /**
   * Obtener todas mis inscripciones (autenticado)
   * Endpoint: GET /volunteers/me/activity-enrollments
   */
  async getMyEnrollments() {
    const { data } = await client.get("/volunteers/me/activity-enrollments");
    return data;
  },

  /**
   * Cancelar mi inscripción a una actividad (autenticado)
   * Endpoint: PATCH /volunteers/me/activity-enrollment/:id_enrollment/cancel
   */
  async cancelMyEnrollment(enrollmentId: number) {
    const { data } = await client.patch(`/volunteers/me/activity-enrollment/${enrollmentId}/cancel`);
    return data;
  },

  // Métodos extra por si luego conectás el admin (opcionales ahora):
  async list(params?: { page?: number; limit?: number; q?: string; status?: VolunteerStatus | "ALL" }) {
    const { data } = await client.get("/volunteers", { params });
    return data;
  },
  async get(id: number) {
    const { data } = await client.get(`/volunteers/${id}`);
    return data;
  },
  async update(id: number, payload: Partial<CreateVolunteerPayload>) {
    const { data } = await client.put(`/volunteers/${id}`, payload);
    return data;
  },
  async setStatus(id: number, status: VolunteerStatus) {
    const { data } = await client.patch(`/volunteers/${id}/status`, { status });
    return data;
  },
  async remove(id: number) {
    const { data } = await client.delete(`/volunteers/${id}`);
    return data;
  },

  async sendMailbox(input: { subject: string; message: string; volunteerId?: number; files?: File[] }) {
    const form = new FormData();
    form.append("subject", input.subject);
    form.append("message", input.message);
    if (input.volunteerId) form.append("volunteerId", String(input.volunteerId));
    input.files?.forEach((f) => form.append("files", f));
    const { data } = await client.post("/volunteers/mailbox", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { ok: boolean };
  },

  /**
   * Obtener TODAS las solicitudes del buzón (admin)
   * Endpoint: GET /mailbox
   * Requiere rol con permisos (SUPER_ADMIN / GENERAL_ADMIN / AUDITOR)
   */
  async listMailboxAdmin(): Promise<MailboxAdminItem[]> {
    const { data } = await client.get("/mailbox");
    return data;
  },
};

/* ===== UTILITY FUNCTIONS ===== */

/**
 * Transform form data to DTO format for API
 * (Added by teammate)
 */
export const transformFormDataToDto = (formData: VolunteerFormData): CreateVolunteerDto => {

  const validPhones = formData.phones
    .filter(phone => phone.number && phone.number.trim() !== '')
    .map(phone => ({
      number: phone.number.trim()
    }));

  return {
    person: {
      first_name: formData.first_name,
      second_name: formData.second_name?.trim() || undefined,
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname,
      email: formData.email,
      phones: validPhones,
    },
    is_active: formData.is_active
  };
};

export const transformUpdateFormDataToDto = (formData: VolunteerUpdateData): UpdateVolunteerDto => {
  const phones = formData.phones && formData.phones.trim() !== '' 
    ? [{ number: formData.phones.trim() }]
    : [];

  return {
    person: {
      first_name: formData.first_name,
      second_name: formData.second_name?.trim() || undefined,
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname,
      email: formData.email,
      phones: phones
    },
    is_active: formData.is_active
  };
};

/* ===== HOOKS CON REACT QUERY ===== */

/**
 * Hook para obtener mi perfil de voluntario
 * @param enabled - Si es false, no ejecuta la query. Por defecto true.
 */
export const useMyVolunteerProfile = (enabled: boolean = true) => {
  return useQuery<Volunteer, Error>({
    queryKey: ["volunteers", "me"],
    queryFn: () => VolunteersApi.getMe(),
    enabled: enabled, // Solo ejecutar si está habilitado
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar si falla (por ejemplo, si el usuario no es voluntario)
  });
};

/**
 * Hook para actualizar mi perfil de voluntario
 */
export const useUpdateMyVolunteerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMyProfileDto) => VolunteersApi.updateMe(payload),
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["volunteers", "me"] });
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });
};

/**
 * Hook para obtener mis próximas actividades
 */
export const useMyUpcomingActivities = () => {
  return useQuery({
    queryKey: ["volunteers", "me", "activities", "upcoming"],
    queryFn: () => VolunteersApi.getMyUpcomingActivities(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener mi historial de actividades
 */
export const useMyPastActivities = () => {
  return useQuery({
    queryKey: ["volunteers", "me", "activities", "past"],
    queryFn: () => VolunteersApi.getMyPastActivities(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener todas mis inscripciones
 */
export const useMyEnrollments = () => {
  return useQuery({
    queryKey: ["volunteers", "me", "enrollments"],
    queryFn: () => VolunteersApi.getMyEnrollments(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para cancelar mi inscripción
 */
export const useCancelMyEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: number) => VolunteersApi.cancelMyEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["volunteers", "me", "activities"] });
      queryClient.invalidateQueries({ queryKey: ["volunteers", "me", "enrollments"] });
    },
  });
};

/**
 * Hook para obtener todos los voluntarios
 * (Added by teammate)
 */
export const useVolunteers = () => {
  return useQuery<Volunteer[], Error>({
    queryKey: ['volunteers'],
    queryFn: async () => {
      const res = await client.get('/volunteers');
      return res.data;
    },
  });
};

/**
 * Hook para agregar un nuevo voluntario
 * (Added by teammate)
 */
export const useAddVolunteer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newVolunteer: CreateVolunteerDto) => {
      const res = await client.post('/volunteers', newVolunteer);
      return res.data;
    },
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
};

/**
 * Hook para obtener todas las solicitudes del buzón (admin)
 * Usa VolunteersApi.listMailboxAdmin() -> GET /mailbox
 */
export const useAllMailboxRequests = () => {
  return useQuery<MailboxAdminItem[], Error>({
    queryKey: ['mailbox-admin'],
    queryFn: () => VolunteersApi.listMailboxAdmin(),
    staleTime: 60 * 1000, // 1 minuto (ajustable)
  });
};

// Update volunteer
export const useUpdateVolunteer = (volunteerId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (volunteerData: UpdateVolunteerDto) => {
      const res = await client.put(`/volunteers/${volunteerId}`, volunteerData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
};

export const useToggleVolunteerActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_volunteer, is_active }: { id_volunteer: number; is_active: boolean }) => {
      const res = await client.patch(`/volunteers/${id_volunteer}/status`, { is_active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
};