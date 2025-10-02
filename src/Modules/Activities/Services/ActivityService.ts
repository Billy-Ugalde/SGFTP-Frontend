import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export interface DateActivity {
  Id_dateActivity?: number;
  Start_date: string;
  End_date?: string;
}

export interface Project {
  Id_project: number;
  Name: string;
  Description?: string;
}

export interface Activity {
  Id_activity: number;
  Name: string;
  Description: string;
  Conditions: string;
  Observations: string;
  IsRecurring?: boolean;
  IsFavorite?: 'school' | 'condominium';
  OpenForRegistration: boolean;
  Registration_date: Date;
  UpdatedAt: Date;
  Type_activity: 'conference' | 'workshop' | 'reforestation' | 'garbage_collection' | 'special_event' | 'cleanup' | 'cultutal_event';
  Status_activity: 'pending' | 'planning' | 'execution' | 'suspended' | 'finished';
  Approach: 'social' | 'cultural' | 'environmental';
  Spaces?: number;
  Location: string;
  Aim: string;
  Metric_activity: 'attendance' | 'trees_planted' | 'waste_collected';
  Metric_value: number;
  Active: boolean;
  url?: string;
  project: Project;
  dateActivities: DateActivity[];
}

export interface CreateActivityDto {
  Name: string;
  Description: string;
  Conditions: string;
  Observations: string;
  IsRecurring?: boolean;
  IsFavorite?: 'school' | 'condominium';
  OpenForRegistration: boolean;
  Type_activity: string;
  Status_activity: string;
  Approach: string;
  Spaces?: number;
  Location: string;
  Aim: string;
  Metric_activity: string;
  Metric_value?: number;
  Active: boolean;
  Id_project: number;
  dates: DateActivity[];
}

export interface UpdateActivityDto {
  Name?: string;
  Description?: string;
  Conditions?: string;
  Observations?: string;
  IsRecurring?: boolean;
  IsFavorite?: 'school' | 'condominium';
  OpenForRegistration?: boolean;
  Type_activity?: string;
  Status_activity?: string;
  Approach?: string;
  Spaces?: number;
  Location?: string;
  Aim?: string;
  Metric_activity?: string;
  Metric_value?: number;
  Active?: boolean;
  dateActivities?: DateActivity[];
}

export const useActivities = () => {
  return useQuery<Activity[], Error>({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await client.get('/activities');
      return res.data;
    },
  });
};

export const useActivityById = (id: number) => {
  return useQuery<Activity, Error>({
    queryKey: ['activity', id],
    queryFn: async () => {
      const res = await client.get(`/activities/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, image }: { data: CreateActivityDto; image?: File }) => {
      const formData = new FormData();
      
      console.log('Datos a enviar:', data);
      
      formData.append('Name', data.Name);
      formData.append('Description', data.Description);
      formData.append('Conditions', data.Conditions);
      formData.append('Observations', data.Observations);
      formData.append('Type_activity', data.Type_activity);
      formData.append('Status_activity', data.Status_activity);
      formData.append('Approach', data.Approach);
      formData.append('Location', data.Location);
      formData.append('Aim', data.Aim);
      formData.append('Metric_activity', data.Metric_activity);
      
      formData.append('Active', String(data.Active));
      formData.append('OpenForRegistration', String(data.OpenForRegistration));
      
      if (data.IsRecurring !== undefined) {
        formData.append('IsRecurring', String(data.IsRecurring));
      }
      
      formData.append('Id_project', String(data.Id_project));
      
      if (data.Spaces !== undefined && data.Spaces !== null) {
        formData.append('Spaces', String(data.Spaces));
      }
      
      if (data.Metric_value !== undefined && data.Metric_value !== null) {
        formData.append('Metric_value', String(data.Metric_value));
      }
      
      if (data.IsFavorite) {
        formData.append('IsFavorite', data.IsFavorite);
      }
      
      const datesJson = JSON.stringify(data.dates);
      console.log('Fechas JSON:', datesJson);
      formData.append('dates', datesJson);

      if (image) {
        console.log('Imagen:', image.name);
        formData.append('image', image);
      }

      console.log('FormData completo:');
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      try {
        const res = await client.post('/activities', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      } catch (error: any) {
        console.error('Error completo:', error);
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, image }: { id: number; data: UpdateActivityDto; image?: File }) => {
      const formData = new FormData();
      
      if (data.Name !== undefined) formData.append('Name', data.Name);
      if (data.Description !== undefined) formData.append('Description', data.Description);
      if (data.Conditions !== undefined) formData.append('Conditions', data.Conditions);
      if (data.Observations !== undefined) formData.append('Observations', data.Observations);
      if (data.Type_activity !== undefined) formData.append('Type_activity', data.Type_activity);
      if (data.Status_activity !== undefined) formData.append('Status_activity', data.Status_activity);
      if (data.Approach !== undefined) formData.append('Approach', data.Approach);
      if (data.Location !== undefined) formData.append('Location', data.Location);
      if (data.Aim !== undefined) formData.append('Aim', data.Aim);
      if (data.Metric_activity !== undefined) formData.append('Metric_activity', data.Metric_activity);
      
      if (data.Active !== undefined) formData.append('Active', String(data.Active));
      if (data.OpenForRegistration !== undefined) formData.append('OpenForRegistration', String(data.OpenForRegistration));
      if (data.IsRecurring !== undefined) formData.append('IsRecurring', String(data.IsRecurring));
      
      if (data.Spaces !== undefined) formData.append('Spaces', String(data.Spaces));
      if (data.Metric_value !== undefined) formData.append('Metric_value', String(data.Metric_value));
      
      if (data.IsFavorite !== undefined) formData.append('IsFavorite', data.IsFavorite);
      
      if (data.dateActivities !== undefined) {
        formData.append('dateActivities', JSON.stringify(data.dateActivities));
      }

      if (image) {
        formData.append('image', image);
      }

      const res = await client.put(`/activities/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useUpdateActivityStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await client.patch(`/activities/${id}/status`, {
        Status_activity: status
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const getActivityLabels = {
  type: {
    conference: 'Conferencia',
    workshop: 'Taller',
    reforestation: 'Reforestación',
    garbage_collection: 'Recolección de Basura',
    special_event: 'Evento Especial',
    cleanup: 'Limpieza',
    cultutal_event: 'Evento Cultural'
  },
  status: {
    pending: 'Pendiente',
    planning: 'Planificación',
    execution: 'Ejecución',
    suspended: 'Suspendido',
    finished: 'Finalizado'
  },
  approach: {
    social: 'Social',
    cultural: 'Cultural',
    environmental: 'Ambiental'
  }
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    planning: 'bg-blue-100 text-blue-800',
    execution: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    finished: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};