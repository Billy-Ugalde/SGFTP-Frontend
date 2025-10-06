import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export const MetricProject = {
  TOTAL_BENEFICIATED_PERSONS: 'beneficiated_persons',
  TOTAL_WASTE_COLLECTED: 'waste_collected',
  TOTAL_TREES_PLANTED: 'trees_planted',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];
export type MetricProject = typeof MetricProject[keyof typeof MetricProject];

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
  Metrics: MetricProject;
  Metric_value: number;
  Active: boolean;
  url_1?: string;
  url_2?: string;
  url_3?: string;
  activity?: any[];
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
  Metrics: MetricProject;
  Metric_value: number;
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
  Metrics?: MetricProject;
  Metric_value?: number;
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
  Metrics: MetricProject;
  Metric_value: number;
  url_1?: File | undefined;
  url_2?: File | undefined;
  url_3?: File | undefined;
}

// ✅ FUNCIÓN CORREGIDA: Convierte fecha YYYY-MM-DD a formato MySQL datetime
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

// ✅ FUNCIÓN CORREGIDA: Transformar form data a DTO
export const transformFormDataToDto = (formData: ProjectFormData): CreateProjectDto => {
  console.log('📥 Form Data recibido:', formData);
  
  // Validar que Start_date existe
  if (!formData.Start_date || formData.Start_date.trim() === '') {
    throw new Error('La fecha de inicio es obligatoria');
  }
  
  // Convertir fechas a formato MySQL datetime
  const startDate = formatDateToMySQL(formData.Start_date);
  
  // Asegurar que Metric_value sea un número entero válido >= 0
  const metricValue = Math.max(0, Math.floor(Number(formData.Metric_value) || 0));

  const dto: CreateProjectDto = {
    Name: formData.Name?.trim() || '',
    Description: formData.Description?.trim() || '',
    Observations: formData.Observations?.trim() || '',
    Aim: formData.Aim?.trim() || '',
    Start_date: startDate,
    Target_population: formData.Target_population?.trim() || '',
    Location: formData.Location?.trim() || '',
    Metrics: formData.Metrics,
    Metric_value: metricValue,
  };
  
  // Manejar End_date opcional
  if (formData.End_date && formData.End_date.trim() !== '') {
    dto.End_date = formatDateToMySQL(formData.End_date);
  }
  
  console.log('✅ DTO final:', dto);
  console.log('✅ Start_date (MySQL datetime):', dto.Start_date);
  console.log('✅ End_date (MySQL datetime):', dto.End_date || 'No especificada');
  console.log('✅ Metric_value:', dto.Metric_value);
  
  return dto;
};

// ✅ FUNCIÓN CORREGIDA: Convertir DTO a FormData
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
  fd.append("Metrics", data.Metrics);
  fd.append("Metric_value", data.Metric_value.toString());
  
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

export const useProjects = () => {
  return useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await client.get('/projects');
      return res.data;
    },
  });
};

export const useProjectById = (id?: number) => {
  return useQuery<Project, Error>({
    queryKey: ['projects', 'detail', id],
    queryFn: async () => {
      const res = await client.get(`/projects/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

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
export const PROJECT_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: ProjectStatus.PENDING, label: 'Pendiente' },
  { value: ProjectStatus.PLANNING, label: 'Planificación' },
  { value: ProjectStatus.EXECUTION, label: 'Ejecución' },
  { value: ProjectStatus.SUSPENDED, label: 'Suspendido' },
  { value: ProjectStatus.FINISHED, label: 'Finalizado' },
];

export const METRIC_OPTIONS = [
  { value: MetricProject.TOTAL_BENEFICIATED_PERSONS, label: 'Personas Beneficiadas' },
  { value: MetricProject.TOTAL_WASTE_COLLECTED, label: 'Residuos Recolectados (kg)' },
  { value: MetricProject.TOTAL_TREES_PLANTED, label: 'Árboles Sembrados' },
];