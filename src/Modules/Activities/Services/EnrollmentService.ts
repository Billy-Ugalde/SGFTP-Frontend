// Services/EnrollmentService.ts
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config/env';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface Volunteer {
  id_volunteer: number;
  is_active: boolean;
  registration_date: string;
  person: {
    id_person: number;
    first_name: string;
    second_name?: string;
    first_lastname: string;
    second_lastname?: string;
    email: string;
    phone_primary: string;
  };
}

export interface ActivityEnrollment {
  id_enrollment_activity: number;
  enrollment_date: string;
  status: 'enrolled' | 'attended' | 'cancelled' | 'not_attended';
  attendance_date?: string;
  volunteer: Volunteer;
}

export interface UpdateEnrollmentDto {
  status: 'enrolled' | 'attended' | 'cancelled' | 'not_attended';
  attendance_date?: string;
}

// Servicios para inscripciones
export const useActivityEnrollments = (activityId: number) => {
  return useQuery<ActivityEnrollment[], Error>({
    queryKey: ['activityEnrollments', activityId],
    queryFn: async () => {
      const res = await client.get(`/volunteers/activity/${activityId}/activity-enrollments`);
      return res.data;
    },
    enabled: !!activityId,
  });
};

export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      status 
    }: { 
      enrollmentId: number; 
      status: UpdateEnrollmentDto 
    }) => {
      const res = await client.patch(
        `/volunteers/activity-enrollment/${enrollmentId}`,
        status
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidar las queries de inscripciones para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['activityEnrollments'] });
    },
  });
};

export const useCancelEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (enrollmentId: number) => {
      const res = await client.patch(
        `/volunteers/activity-enrollment/${enrollmentId}/cancel`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityEnrollments'] });
    },
  });
};

// Utilidades para mostrar estados
export const getEnrollmentStatusLabels = {
  enrolled: 'Inscrito',
  attended: 'Presente',
  cancelled: 'Cancelado',
  not_attended: 'Ausente'
};

export const getEnrollmentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    enrolled: 'bg-blue-100 text-blue-800',
    attended: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    not_attended: 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};