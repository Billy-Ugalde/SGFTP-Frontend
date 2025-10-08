import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Activity } from '../../Activities/Services/ActivityService';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});

export const ProjectStatus = {
  PENDING: 'pending',
  PLANNING: 'planning',
  EXECUTION: 'execution',
  SUSPENDED: 'suspended',
  FINISHED: 'finished'
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export interface Project {
  Id_project: number;
  Name: string;
  Description: string;
  Observations: string;
  Aim: string;
  Start_date: string;
  End_date?: string;
  Registration_date: Date;
  UpdatedAt: Date;
  Status: ProjectStatus;
  Target_population: string;
  Location: string;
  METRIC_TOTAL_BENEFICIATED: number;
  METRIC_TOTAL_WASTE_COLLECTED: number;
  METRIC_TOTAL_TREES_PLANTED: number;
  Active: boolean;
  url_1?: string;
  url_2?: string;
  url_3?: string;
  url_4?: string;
  url_5?: string;
  url_6?: string;
  activity?: Activity[];
}

export interface CreateProjectDto {
  Name: string;
  Description: string;
  Observations: string;
  Aim: string;
  Start_date: string;
  End_date?: string;
  Target_population: string;
  Location: string;
}

export interface UpdateProjectDto {
  Name?: string;
  Description?: string;
  Observations?: string;
  Aim?: string;
  Start_date?: string;
  End_date?: string;
  Target_population?: string;
  Location?: string;
  Active?: boolean;
  METRIC_TOTAL_BENEFICIATED?: number;
  METRIC_TOTAL_WASTE_COLLECTED?: number;
  METRIC_TOTAL_TREES_PLANTED?: number;
}

export interface ProjectFormData {
  Name: string;
  Description: string;
  Observations: string;
  Aim: string;
  Start_date: string;
  End_date?: string;
  Target_population: string;
  Location: string;
  url_1?: File | undefined;
  url_2?: File | undefined;
  url_3?: File | undefined;
  url_4?: File | undefined;
  url_5?: File | undefined;
  url_6?: File | undefined;
}

export interface ProjectUpdateData {
  Id_project?: number;
  Name?: string;
  Description?: string;
  Observations?: string;
  Aim?: string;
  Start_date?: string;
  End_date?: string;
  Target_population?: string;
  Location?: string;
  Active?: boolean;
  url_1?: File | string;
  url_2?: File | string;
  url_3?: File | string;
  url_4?: File | string;
  url_5?: File | string;
  url_6?: File | string;
}

//Hook para obtener actividades por proyecto
export const useActivitiesByProject = (projectId?: number) => {
  return useQuery<Activity[], Error>({
    queryKey: ['projects', 'activities', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      try {
        const res = await client.get(`/projects/${projectId}/activities`);
        return res.data;
      } catch (error: any) {
        console.error('Error fetching project activities:', error);
        // Si el endpoint no existe aún, retornar array vacío
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // Cache de 2 minutos
  });
};

// FUNCIÓN  Convierte fecha YYYY-MM-DD a formato MySQL datetime
const formatDateToMySQL = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return '';

  // Si ya viene en formato datetime de MySQL (YYYY-MM-DD HH:MM:SS), retornarlo
  if (dateString.includes(' ') && dateString.length === 19) {
    return dateString;
  }

  // Si viene en formato ISO completo, extraer la parte de fecha y hora
  if (dateString.includes('T')) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00`;
  }

  // Si viene en formato YYYY-MM-DD, agregar hora
  return `${dateString} 00:00:00`;
};

// FUNCIÓN: Transformar form data a DTO
export const transformFormDataToDto = (formData: ProjectFormData): CreateProjectDto => {
  console.log('📥 Form Data recibido:', formData);

  // Validar que Start_date existe
  if (!formData.Start_date || formData.Start_date.trim() === '') {
    throw new Error('La fecha de inicio es obligatoria');
  }

  // Convertir fechas a formato MySQL datetime
  const startDate = formatDateToMySQL(formData.Start_date);

  const dto: CreateProjectDto = {
    Name: formData.Name?.trim() || '',
    Description: formData.Description?.trim() || '',
    Observations: formData.Observations?.trim() || '',
    Aim: formData.Aim?.trim() || '',
    Start_date: startDate,
    Target_population: formData.Target_population?.trim() || '',
    Location: formData.Location?.trim() || '',
  };

  // Manejar End_date opcional
  if (formData.End_date && formData.End_date.trim() !== '') {
    dto.End_date = formatDateToMySQL(formData.End_date);
  }

  console.log('✅ DTO final:', dto);
  console.log('✅ Start_date (MySQL datetime):', dto.Start_date);
  console.log('✅ End_date (MySQL datetime):', dto.End_date || 'No especificada');

  return dto;
};

// FUNCIÓN: Convertir DTO a FormData
export const transformProjectToFormData = (
  data: CreateProjectDto,
  files?: File[]
): FormData => {
  const fd = new FormData();

  console.log('📦 Creando FormData con:', data);

  // Append cada campo - las fechas ya vienen en formato MySQL
  fd.append("Name", data.Name);
  fd.append("Description", data.Description);
  fd.append("Observations", data.Observations);
  fd.append("Aim", data.Aim);
  fd.append("Start_date", data.Start_date);
  fd.append("Target_population", data.Target_population);
  fd.append("Location", data.Location);

  if (data.End_date) {
    fd.append("End_date", data.End_date);
  }

  // Append imágenes
  if (files && files.length > 0) {
    console.log(`📸 Agregando ${files.length} imágenes`);
    files.forEach((file) => {
      fd.append("images", file);
    });
  }

  return fd;
};

// FUNCIÓN: Transformar form data a DTO de actualización
export const transformUpdateFormDataToDto = (formData: Omit<ProjectUpdateData, 'Id_project' | 'Active'>): UpdateProjectDto => {
  console.log('📥 Form Data recibido para actualización:', formData);

  const dto: UpdateProjectDto = {};

  // Solo campos básicos que van en el JSON
  if (formData.Name !== undefined) dto.Name = formData.Name.trim();
  if (formData.Description !== undefined) dto.Description = formData.Description.trim();
  if (formData.Observations !== undefined) dto.Observations = formData.Observations.trim();
  if (formData.Aim !== undefined) dto.Aim = formData.Aim.trim();
  if (formData.Target_population !== undefined) dto.Target_population = formData.Target_population.trim();
  if (formData.Location !== undefined) dto.Location = formData.Location.trim();

  // Fechas - convertir a formato MySQL datetime
  if (formData.Start_date && formData.Start_date.trim() !== '') {
    dto.Start_date = formatDateToMySQL(formData.Start_date);
  }

  if (formData.End_date && formData.End_date.trim() !== '') {
    dto.End_date = formatDateToMySQL(formData.End_date);
  } else if (formData.End_date === '') {
    dto.End_date = undefined;
  }

  console.log('✅ DTO final para actualización:', dto);
  return dto;
};

// Hook para obtener todos los proyectos
export const useProjects = () => {
  return useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await client.get('/projects');
      return res.data;
    },
  });
};

// Hook para obtener proyecto por ID
export const useProjectById = (id?: number) => {
  return useQuery<Project, Error>({
    queryKey: ['projects', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const res = await client.get(`/projects/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para agregar proyecto
export const useAddProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectData, files }: { projectData: CreateProjectDto; files?: File[] }) => {
      const url = "/projects";
      const formData = transformProjectToFormData(projectData, files);

      console.log('🚀 Enviando request a:', url);

      // Log del FormData para debug
      console.log('📋 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      try {
        const res = await client.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Respuesta del backend:', res.data);
        return res.data;
      } catch (error: any) {
        console.error('❌ Error completo:', error);
        console.error('❌ Response data:', error.response?.data);
        console.error('❌ Mensajes de validación:', error.response?.data?.message);
        console.error('❌ Response status:', error.response?.status);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// Hook para actualizar proyecto
export const useUpdateProject = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectData, files }: { projectData: UpdateProjectDto; files?: File[] }) => {
      const formData = new FormData();

      console.log('🔄 Iniciando actualización de proyecto:', projectId);
      console.log('📦 Datos a actualizar:', projectData);
      console.log('📸 Archivos a actualizar:', files?.length || 0);

      Object.keys(projectData).forEach(key => {
        const value = projectData[key as keyof UpdateProjectDto];
        if (value !== undefined && value !== null) {
          // Convertir boolean a string si es necesario
          const formValue = typeof value === 'boolean' ? value.toString() : value;
          formData.append(key, formValue as string);
        }
      });

      // Agregar archivos si existen
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          formData.append('images', file);
          console.log(`📁 Agregando archivo ${index + 1}:`, file.name);
        });
      }

      // Log del FormData para debug
      console.log('📋 Contenido del FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      try {
        const response = await client.put(`/projects/${projectId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('✅ Proyecto actualizado exitosamente:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ Error en actualización:', error);
        console.error('❌ Response data:', error.response?.data);
        console.error('❌ Response status:', error.response?.status);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'detail', projectId] });
    },
  });
};

export const useToggleProjectActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id_project,
      active,
    }: {
      id_project: number;
      active: boolean;
    }) => {
      const res = await client.patch(
        `/projects/active/${id_project}`,
        { active },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Hook para actualizar status del proyecto
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id_project,
      status,
    }: {
      id_project: number;
      status: ProjectStatus;
    }) => {
      const res = await client.patch(
        `/projects/${id_project}`,
        { Status: status },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Hook para obtener métricas de un proyecto
export const useProjectMetrics = (projectId?: number) => {
  return useQuery<{
    METRIC_TOTAL_BENEFICIATED: number;
    TOTAL_WASTE_COLLECTED: number;
    TOTAL_TREES_PLANTED: number;
  }, Error>({
    queryKey: ['projects', 'metrics', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const res = await client.get(`/projects/metric/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // Cache de 2 minutos
  });
};