// src/Modules/Volunteers/Services/VolunteersServices.ts
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

  /**
   * Obtener mi perfil de voluntario (autenticado)
   *
   * PROBLEMA: El endpoint /volunteers/me tiene conflicto con la ruta :id en el backend
   * SOLUCIÓN: Usar el ID del voluntario guardado en localStorage (del login) o buscarlo
   *
   * NOTA: Esto es un workaround. Lo ideal sería arreglar el orden de rutas en el backend
   * moviendo @Get('me') ANTES de @Get(':id')
   */
  async getMe(): Promise<Volunteer> {
    try {
      // PASO 1: Intentar obtener el id_volunteer desde localStorage (guardado en login)
      const storedVolunteerId = localStorage.getItem('volunteer_id');

      if (storedVolunteerId) {
        try {
          const { data: volunteer } = await api.get(`/volunteers/${storedVolunteerId}`);
          return volunteer;
        } catch (err) {
          // Si falla, continuar con el método alternativo
          console.warn("No se pudo obtener voluntario con ID guardado, intentando método alternativo");
        }
      }

      // PASO 2: Si no hay ID guardado, buscar por email desde el perfil de auth
      const { data: profileData } = await api.get("/auth/profile");
      const userEmail = profileData?.user?.email;

      if (!userEmail) {
        throw new Error("No se pudo obtener el email del usuario autenticado");
      }

      // PASO 3: Buscar el voluntario usando el endpoint person/:id_person
      // o intentando IDs secuenciales (último recurso)
      // Como esto no es óptimo, throw un error indicando que se necesita reordenar las rutas
      throw new Error(
        "No se pudo cargar el perfil de voluntario. " +
        "El backend necesita reordenar las rutas en volunteer.controller.ts " +
        "(mover @Get('me') ANTES de @Get(':id'))"
      );

    } catch (error: any) {
      console.error("Error obteniendo perfil de voluntario:", error);
      throw error;
    }
  },

  /**
   * Actualizar mi perfil de voluntario (autenticado)
   * SOLUCIÓN: Primero obtiene el ID del voluntario, luego actualiza usando PUT /volunteers/:id
   */
  async updateMe(payload: UpdateMyProfileDto): Promise<Volunteer> {
    // Primero obtenemos nuestro perfil para sacar el id_volunteer
    const myProfile = await this.getMe();

    if (!myProfile?.id_volunteer) {
      throw new Error("No se pudo obtener el ID del voluntario");
    }

    // Actualizamos usando el endpoint con ID
    const { data } = await api.put(`/volunteers/${myProfile.id_volunteer}`, payload);
    return data;
  },

  /**
   * Obtener mis próximas actividades (autenticado)
   * SOLUCIÓN: Usa el ID del voluntario en lugar de /me
   */
  async getMyUpcomingActivities() {
    const myProfile = await this.getMe();
    if (!myProfile?.id_volunteer) {
      throw new Error("No se pudo obtener el ID del voluntario");
    }
    const { data } = await api.get(`/volunteers/${myProfile.id_volunteer}/activity-enrollments/upcoming`);
    return data;
  },

  /**
   * Obtener mi historial de actividades (autenticado)
   * SOLUCIÓN: Usa el ID del voluntario en lugar de /me
   */
  async getMyPastActivities() {
    const myProfile = await this.getMe();
    if (!myProfile?.id_volunteer) {
      throw new Error("No se pudo obtener el ID del voluntario");
    }
    const { data } = await api.get(`/volunteers/${myProfile.id_volunteer}/activity-enrollments/past`);
    return data;
  },

  /**
   * Obtener todas mis inscripciones (autenticado)
   * SOLUCIÓN: Usa el ID del voluntario en lugar de /me
   */
  async getMyEnrollments() {
    const myProfile = await this.getMe();
    if (!myProfile?.id_volunteer) {
      throw new Error("No se pudo obtener el ID del voluntario");
    }
    const { data } = await api.get(`/volunteers/${myProfile.id_volunteer}/activity-enrollments`);
    return data;
  },

  /**
   * Cancelar mi inscripción a una actividad (autenticado)
   * Endpoint: PATCH /volunteers/activity-enrollment/:id/cancel
   */
  async cancelMyEnrollment(enrollmentId: number) {
    const { data } = await api.patch(`/volunteers/activity-enrollment/${enrollmentId}/cancel`);
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
