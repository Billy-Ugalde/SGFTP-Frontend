import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Activity } from '../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../config/env';

const client = axios.create({
  baseURL: API_BASE_URL,
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
  Slug: string;
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
  url_1_action?: 'keep' | 'replace' | 'delete' | 'add';
  url_2_action?: 'keep' | 'replace' | 'delete' | 'add';
  url_3_action?: 'keep' | 'replace' | 'delete' | 'add';
  url_4_action?: 'keep' | 'replace' | 'delete' | 'add';
  url_5_action?: 'keep' | 'replace' | 'delete' | 'add';
  url_6_action?: 'keep' | 'replace' | 'delete' | 'add';
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

export interface ProjectReportData {
  project: {
    Id_project: number;
    Name: string;
    Description: string;
    Aim: string;
    Start_date: string;
    End_date: string;
    Status: string;
    Target_population: string;
    Location: string;
    METRIC_TOTAL_BENEFICIATED: number;
    METRIC_TOTAL_WASTE_COLLECTED: number;
    METRIC_TOTAL_TREES_PLANTED: number;
  };
  activities: Array<{
    Id_activity: number;
    Name: string;
    Description: string;
    OpenForRegistration: boolean;
    Type_activity: string;
    Status_activity: string;
    Approach: string;
    Location: string;
    Aim: string;
    Metric_activity: string;
    Metric_value: number;
    Start_date?: string;
    End_date?: string;
  }>;
  statistics: {
    total_activities: number;
    pending_activities: number;
    planning_activities: number;
    execution_activities: number;
    suspended_activities: number;
    finished_activities: number;
  };
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
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

// FUNCIÓN: Convierte fecha YYYY-MM-DD a formato MySQL datetime
const formatDateToMySQL = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return '';

  if (dateString.includes(' ') && dateString.length === 19) {
    return dateString;
  }

  if (dateString.includes('T')) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00`;
  }

  return `${dateString} 00:00:00`;
};

// FUNCIÓN: Transformar form data a DTO
export const transformFormDataToDto = (formData: ProjectFormData): CreateProjectDto => {
  console.log('🔥 Form Data recibido:', formData);

  if (!formData.Start_date || formData.Start_date.trim() === '') {
    throw new Error('La fecha de inicio es obligatoria');
  }

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

  if (files && files.length > 0) {
    console.log(`📸 Agregando ${files.length} imágenes`);
    files.forEach((file) => {
      fd.append("images", file);
    });
  }

  return fd;
};

// FUNCIÓN: Transformar form data a DTO de actualización
export const transformUpdateFormDataToDto = (
  formData: Omit<ProjectUpdateData, 'Id_project' | 'Active'>,
  imageActions?: { [key: string]: 'keep' | 'replace' | 'delete' | 'add' }
): UpdateProjectDto => {
  console.log('🔥 Form Data recibido para actualización:', formData);
  console.log('🎬 Acciones de imágenes:', imageActions);

  const dto: UpdateProjectDto = {};

  if (formData.Name !== undefined) dto.Name = formData.Name.trim();
  if (formData.Description !== undefined) dto.Description = formData.Description.trim();
  if (formData.Observations !== undefined) dto.Observations = formData.Observations.trim();
  if (formData.Aim !== undefined) dto.Aim = formData.Aim.trim();
  if (formData.Target_population !== undefined) dto.Target_population = formData.Target_population.trim();
  if (formData.Location !== undefined) dto.Location = formData.Location.trim();

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
      const projects = res.data;
        
      return projects.sort((a: Project, b: Project) => {
        const dateA = new Date(a.Registration_date).getTime();
        const dateB = new Date(b.Registration_date).getTime();
        return dateB - dateA; 
      });
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

// Hook para obtener proyecto por slug (para vistas públicas)
export const useProjectBySlug = (slug?: string) => {
  return useQuery<Project, Error>({
    queryKey: ['projects', 'slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Project slug is required');
      const res = await publicClient.get(`/projects/slug/${slug}`);
      return res.data;
    },
    enabled: !!slug,
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
    mutationFn: async ({ 
      projectData, 
      files,
      imageActions 
    }: { 
      projectData: UpdateProjectDto; 
      files?: { file: File; fieldName: string }[];
      imageActions?: { [key: string]: 'keep' | 'replace' | 'delete' | 'add' };
    }) => {
      const formData = new FormData();

      // Append datos básicos
      Object.keys(projectData).forEach(key => {
        const value = projectData[key as keyof UpdateProjectDto];
        if (value !== undefined && value !== null) {
          const formValue = typeof value === 'boolean' ? value.toString() : value;
          formData.append(key, formValue as string);
        }
      });

      // Append acciones de imágenes
      if (imageActions) {
        Object.entries(imageActions).forEach(([field, action]) => {
          formData.append(`${field}_action`, action);
        });
      }

      // Append archivos con NOMBRES ESPECÍFICOS
      if (files && files.length > 0) {
        files.forEach(({ file, fieldName }) => {
          formData.append(`${fieldName}_file`, file);
        });
      }

      try {
        const response = await client.put(`/projects/${projectId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data;
      } catch (error: any) {
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
    staleTime: 2 * 60 * 1000,
  });
};

// Función para descargar PDF
export const downloadProjectPDF = async (projectId: number): Promise<void> => {
  try {
    const response = await client.get(`/reports/projects/${projectId}/pdf`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `reporte-proyecto-${projectId}.pdf`;
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Error descargando PDF:', error);
    throw new Error(error.response?.data?.message || 'Error al generar el reporte PDF');
  }
};

// Hook para generar reporte PDF
export const useGenerateProjectReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: number) => {
      return await downloadProjectPDF(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Función para descargar Excel
export const downloadProjectExcel = async (projectId: number): Promise<void> => {
  try {
    const response = await client.get(`/reports/projects/${projectId}/excel`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `reporte-proyecto-${projectId}.xlsx`;
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Error descargando Excel:', error);
    throw new Error(error.response?.data?.message || 'Error al generar el reporte Excel');
  }
};

// Hook para generar reporte Excel
export const useGenerateProjectExcel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: number) => {
      return await downloadProjectExcel(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Cliente público (sin autenticación) para proyectos públicos
const publicClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Hook para obtener proyectos públicos activos
export const usePublicProjects = () => {
  return useQuery<Project[], Error>({
    queryKey: ['public-projects'],
    queryFn: async () => {
      const res = await publicClient.get('/projects/public/active');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
};