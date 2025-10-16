import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
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
  url1?: string;
  url2?: string;
  url3?: string;
  project: Project;
  dateActivities: DateActivity[];
}

export interface CreateActivityDto {
  Name: string;
  Description: string;
  Conditions: string;
  Observations: string;
  IsRecurring?: boolean;
  IsFavorite?: 'school' | 'condominium' | undefined;
  OpenForRegistration: boolean;
  Type_activity: string;
  Status_activity: string;
  Approach: string;
  Spaces?: number;
  Location: string;
  Aim: string;
  Metric_activity: string;
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
  IsFavorite?: 'school' | 'condominium' | undefined | null;
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

export interface ActivityFormData {
  Name: string;
  Description: string;
  Conditions: string;
  Observations: string;
  IsRecurring?: boolean;
  IsFavorite?: 'school' | 'condominium' | undefined;
  OpenForRegistration: boolean;
  Type_activity: string;
  Status_activity: string;
  Approach: string;
  Spaces?: number;
  Location: string;
  Aim: string;
  Metric_activity: string;
  Active: boolean;
  Id_project: number;
  dates: DateActivity[];
}

const formatDateToISO = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return '';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toISOString();
  } catch (error) {
    return '';
  }
};

export const transformFormDataToDto = (formData: ActivityFormData): CreateActivityDto => {
  if (!formData.Name || formData.Name.trim() === '') {
    throw new Error('El nombre es obligatorio');
  }
  
  if (!formData.dates || formData.dates.length === 0) {
    throw new Error('Debe haber al menos una fecha');
  }

  const cleanedDates = formData.dates.map(date => ({
    Start_date: formatDateToISO(date.Start_date),
    End_date: date.End_date ? formatDateToISO(date.End_date) : undefined
  }));

  const spaces = formData.Spaces !== undefined && formData.Spaces !== null 
    ? Math.max(0, Math.floor(Number(formData.Spaces))) 
    : 0;

  const dto: CreateActivityDto = {
    Name: formData.Name.trim(),
    Description: formData.Description.trim(),
    Conditions: formData.Conditions.trim(),
    Observations: formData.Observations.trim(),
    IsRecurring: Boolean(formData.IsRecurring),
    IsFavorite: formData.IsFavorite || undefined,
    OpenForRegistration: Boolean(formData.OpenForRegistration),
    Type_activity: formData.Type_activity,
    Status_activity: formData.Status_activity,
    Approach: formData.Approach,
    Spaces: spaces,
    Location: formData.Location.trim(),
    Aim: formData.Aim.trim(),
    Metric_activity: formData.Metric_activity,
    Active: Boolean(formData.Active),
    Id_project: Number(formData.Id_project),
    dates: cleanedDates
  };
  
  return dto;
};

export const transformActivityToFormData = (
  data: CreateActivityDto,
  images?: File[]
): FormData => {
  const fd = new FormData();
  
  fd.append("Name", data.Name);
  fd.append("Description", data.Description);
  fd.append("Conditions", data.Conditions);
  fd.append("Observations", data.Observations);
  fd.append("Type_activity", data.Type_activity);
  fd.append("Status_activity", data.Status_activity);
  fd.append("Approach", data.Approach);
  fd.append("Location", data.Location);
  fd.append("Aim", data.Aim);
  fd.append("Metric_activity", data.Metric_activity);
  
  fd.append("Active", data.Active ? "true" : "false");
  fd.append("OpenForRegistration", data.OpenForRegistration ? "true" : "false");
  fd.append("IsRecurring", data.IsRecurring ? "true" : "false");
  
  fd.append("Id_project", String(data.Id_project));
  
  if (data.Spaces !== undefined && data.Spaces !== null) {
    fd.append("Spaces", String(data.Spaces));
  } else {
    fd.append("Spaces", "0");
  }
  
  if (data.IsFavorite) {
    fd.append("IsFavorite", data.IsFavorite);
  }
  
  fd.append("dates", JSON.stringify(data.dates));
  
  if (images && images.length > 0) {
    console.log(`📤 Agregando ${images.length} imágenes al FormData`);
    images.forEach((image, index) => {
      fd.append("images", image);
      console.log(`  - Imagen ${index + 1}: ${image.name} (${image.size} bytes)`);
    });
  }
  
  return fd;
};

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
    mutationFn: async ({ activityData, images }: { activityData: CreateActivityDto; images?: File[] }) => {
      console.log('🚀 ========== useCreateActivity ==========');
      console.log('📋 DTO recibido:', activityData);
      console.log('📸 Imágenes recibidas:', images?.length || 0);
      
      const url = "/activities";
      const formData = transformActivityToFormData(activityData, images);
      
      console.log('📤 Enviando FormData al backend...');
      
      try {
        const res = await client.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Respuesta del backend:', res.data);
        return res.data;
      } catch (error: any) {
        console.error('❌ Error creating activity:', error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, images }: { id: number; data: UpdateActivityDto; images?: File[] }) => {
      console.log('🔄 ========== useUpdateActivity ==========');
      console.log('🆔 ID:', id);
      console.log('📋 Datos a actualizar:', data);
      console.log('📸 Imágenes recibidas:', images?.length || 0);
      
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
      
      if (data.Metric_value !== undefined) {
        formData.append('Metric_value', String(data.Metric_value));
      }
      
      if (data.IsFavorite !== undefined && data.IsFavorite !== null) {
        if (data.IsFavorite) {
          formData.append('IsFavorite', data.IsFavorite);
        }
      }
      
      if (data.dateActivities !== undefined) {
        const datesFormatted = data.dateActivities.map(date => ({
          Id_dateActivity: date.Id_dateActivity,
          Start_date: date.Start_date,
          End_date: date.End_date || undefined
        }));
        formData.append('dateActivities', JSON.stringify(datesFormatted));
      }

      if (images && images.length > 0) {
        console.log(`📤 Agregando ${images.length} imágenes al FormData`);
        images.forEach((image, index) => {
          formData.append('images', image);
          console.log(`  - Imagen ${index + 1}: ${image.name} (${image.size} bytes)`);
        });
      }

      console.log('📤 Enviando actualización al backend...');
      const res = await client.put(`/activities/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Actividad actualizada:', res.data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useToggleActivityActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id_activity,
      active,
    }: {
      id_activity: number;
      active: boolean;
    }) => {
      const res = await client.patch(
        `/activities/active/${id_activity}`, 
        { active }
      );
      
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
    mutationFn: async ({ 
      id_activity, 
      status 
    }: { 
      id_activity: number;
      status: string 
    }) => {
      const res = await client.patch(`/activities/${id_activity}/status`, {
        Status_activity: status
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/activities/${id}`);
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
  },
  favorite: {
    school: 'Escuela',
    condominium: 'Condominio'
  },
  metric: {
    attendance: 'Asistencia',
    trees_planted: 'Árboles Plantados',
    waste_collected: 'Residuos Recolectados (kg)'
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
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  const timeStr = d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${dateStr} ${timeStr}`;
};