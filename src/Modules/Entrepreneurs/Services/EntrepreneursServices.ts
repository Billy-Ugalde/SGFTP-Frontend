import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true
});

// Data model interfaces
export interface Phone {
  id_phone?: number;
  id_person?: number;
  number: string;
  type: 'personal' | 'business';
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Person {
  id_person?: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  phones?: Phone[];
}

export interface Entrepreneur {
  id_entrepreneur?: number;
  id_person?: number;
  experience: number;
  status: 'pending' | 'approved' | 'rejected';
  registration_date?: string;
  updated_at?: string;
  is_active: boolean;
  facebook_url?: string;
  instagram_url?: string;
  person?: Person;
  entrepreneurship?: Entrepreneurship;
}

export interface Entrepreneurship {
  id_entrepreneurship?: number;
  id_entrepreneur?: number;
  name: string;
  description: string;
  location: string;
  category: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración' | 'Otra categoría';
  approach: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
  created_at?: string;
  updated_at?: string;
}

// DTO interfaces 
export interface CreatePhoneDto {
  number: string;
  type?: 'personal' | 'business';
  is_primary?: boolean;
}

export interface CreatePersonDto {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phones: CreatePhoneDto[];
}

export interface CreateEntrepreneurDto {
  experience: number | null;
  facebook_url?: string;
  instagram_url?: string;
}

export interface CreateEntrepreneurshipDto {
  name: string;
  description: string;
  location: string;
  category: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración' | 'Otra categoría';
  approach: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
}

export interface CreateCompleteEntrepreneurDto {
  person: CreatePersonDto;
  entrepreneur: CreateEntrepreneurDto;
  entrepreneurship: CreateEntrepreneurshipDto;
  files?: File[];
  urls?: String[];
}

// Update DTOs
export interface UpdatePhoneDto {
  number?: string;
  type?: 'personal' | 'business';
  is_primary?: boolean;
}

export interface UpdatePersonDto {
  first_name?: string;
  second_name?: string | null;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phones?: UpdatePhoneDto[];
}

export interface UpdateEntrepreneurDto {
  experience?: number;
  facebook_url?: string | null;
  instagram_url?: string | null;
}

export interface UpdateEntrepreneurshipDto {
  name?: string;
  description?: string;
  location?: string;
  category?: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración' | 'Otra categoría';
  approach?: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
}

export interface UpdateCompleteEntrepreneurDto {
  person?: UpdatePersonDto;
  entrepreneur?: UpdateEntrepreneurDto;
  entrepreneurship?: UpdateEntrepreneurshipDto;
  files?: File[];
  urls?: string[];
}

// Form data interfaces for easier form handling
export interface EntrepreneurFormData {
  // Person data
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phones: {
    number: string;
    type: 'personal' | 'business';
    is_primary: boolean;
  }[];
  // Entrepreneur data
  experience: number | null;
  facebook_url?: string;
  instagram_url?: string;
  // Entrepreneurship data
  entrepreneurship_name: string;
  description: string;
  location: string;
  category: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración' | 'Otra categoría';
  approach: 'social' | 'cultural' | 'ambiental';
  url_1?:  File | undefined;
  url_2?:  File | undefined;
  url_3?:  File | undefined;
}

export interface EntrepreneurUpdateData {
  first_name?: string;
  second_name?: string;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phones?: {
    number: string;
    type: 'personal' | 'business';
    is_primary: boolean;
  }[];
  experience?: number;
  facebook_url?: string;
  instagram_url?: string;
  entrepreneurship_name?: string;
  description?: string;
  location?: string;
  category?: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración' | 'Otra categoría';
  approach?: 'social' | 'cultural' | 'ambiental';
  url_1?: File | string;
  url_2?: File | string;
  url_3?: File | string;
}

const getValueOrUndefined = (value: string | undefined): string | undefined => {
  return value === '' ? undefined : value;
};

// Helper function to transform form data to backend DTO
export const transformFormDataToDto = (formData: EntrepreneurFormData): CreateCompleteEntrepreneurDto => {

  const validPhones = formData.phones
    .filter(phone => phone.number && phone.number.trim() !== '')
    .map(phone => ({
      number: phone.number.trim(),
      type: phone.type,
      is_primary: phone.is_primary
    }));

  // Validar que los 3 archivos existan
  if (!(formData.url_1 instanceof File) ||
    !(formData.url_2 instanceof File) ||
    !(formData.url_3 instanceof File)) {
    throw new Error('Debes subir exactamente 3 imágenes.');
  }
  const files = [formData.url_1, formData.url_2, formData.url_3];

  return {
    person: {
      first_name: formData.first_name,
      second_name: formData.second_name,
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname,
      email: formData.email,
      phones: validPhones
    },
    entrepreneur: {
      experience: formData.experience,
      facebook_url: getValueOrUndefined(formData.facebook_url),
      instagram_url: getValueOrUndefined(formData.instagram_url),
    },
    entrepreneurship: {
      name: formData.entrepreneurship_name,
      description: formData.description,
      location: formData.location,
      category: formData.category,
      approach: formData.approach
    },
    files: [formData.url_1, formData.url_2, formData.url_3]
  };
};
// Helper function to transform form data to backend DTO for updates
export const transformUpdateDataToDto = (
  formData: EntrepreneurUpdateData
): UpdateCompleteEntrepreneurDto => {
  const dto: UpdateCompleteEntrepreneurDto = {};

  if (
    formData.first_name ||
    formData.second_name ||
    formData.first_lastname ||
    formData.second_lastname ||
    formData.email ||
    formData.phones
  ) {
    dto.person = {};
    if (formData.first_name) dto.person.first_name = formData.first_name;
    if (formData.second_name !== undefined) {
      dto.person.second_name =
        formData.second_name.trim() === '' ? null : formData.second_name;
    }
    if (formData.first_lastname) dto.person.first_lastname = formData.first_lastname;
    if (formData.second_lastname) dto.person.second_lastname = formData.second_lastname;
    if (formData.email) dto.person.email = formData.email;

    if (formData.phones) {
      const filteredPhones = formData.phones.filter(
        (phone) => phone.number && phone.number.trim() !== ''
      );

      if (filteredPhones.length > 0) {
        dto.person.phones = filteredPhones.map((phone, index) => ({
          number: phone.number,
          type: index === 0 ? 'personal' : 'business',
          is_primary: phone.is_primary,
        }));
      }
    }
  }

  if (
    formData.experience !== undefined ||
    formData.facebook_url !== undefined ||
    formData.instagram_url !== undefined
  ) {
    dto.entrepreneur = {};

    if (formData.experience !== undefined) {
      dto.entrepreneur.experience = formData.experience;
    }

    if (formData.facebook_url !== undefined) {
      dto.entrepreneur.facebook_url =
        formData.facebook_url.trim() === '' ? null : formData.facebook_url;
    }

    if (formData.instagram_url !== undefined) {
      dto.entrepreneur.instagram_url =
        formData.instagram_url.trim() === '' ? null : formData.instagram_url;
    }
  }

  if (
    formData.entrepreneurship_name ||
    formData.description ||
    formData.location ||
    formData.category ||
    formData.approach ||
    formData.url_1 ||
    formData.url_2 ||
    formData.url_3
  ) {
    dto.entrepreneurship = {};
    if (formData.entrepreneurship_name) dto.entrepreneurship.name = formData.entrepreneurship_name;
    if (formData.description) dto.entrepreneurship.description = formData.description;
    if (formData.location) dto.entrepreneurship.location = formData.location;
    if (formData.category) dto.entrepreneurship.category = formData.category;
    if (formData.approach) dto.entrepreneurship.approach = formData.approach;
  }

 // NUEVA LÓGICA: Separar archivos y conservar URLs existentes
  const files: File[] = [];
  
  // Conservar URLs que no cambiaron y marcar las que sí cambiaron
  (['url_1', 'url_2', 'url_3'] as const).forEach((field) => {
    const value = formData[field];
    if (value instanceof File) {
      files.push(value);
      // Agregar metadatos para saber qué campo corresponde a cada archivo
      if (!dto.entrepreneurship) dto.entrepreneurship = {};
      (dto.entrepreneurship as any)[field] = `__FILE_REPLACE_${field.toUpperCase()}__`;
    } else if (typeof value === 'string' && value.trim() !== '') {
      if (!dto.entrepreneurship) dto.entrepreneurship = {};
      dto.entrepreneurship[field] = value;
    }
  });

  if (files.length > 0) {
    dto.files = files;
  }
  // Agregar log antes de retornar
  console.log('📤 DTO a enviar:', {
    hasFiles: dto.files?.length || 0,
    entrepreneurship: dto.entrepreneurship,
    fileMarkers: Object.entries(dto.entrepreneurship || {})
      .filter(([key, val]) => typeof val === 'string' && val.startsWith('__FILE_REPLACE_'))
  });
  return dto;
};


// convierte DTO → FormData (para enviar al backend)
export const transformEntrepreneurToFormData = (
  data: CreateCompleteEntrepreneurDto | UpdateCompleteEntrepreneurDto
): FormData => {
  const fd = new FormData();

  if (data.person) fd.append("person", JSON.stringify(data.person));
  if (data.entrepreneur) fd.append("entrepreneur", JSON.stringify(data.entrepreneur));
  if (data.entrepreneurship) fd.append("entrepreneurship", JSON.stringify(data.entrepreneurship));

  if (data.files && data.files.length > 0) {
    data.files.forEach(file => fd.append("files", file));
  }

  if (data.urls && data.urls.length > 0) {
    fd.append("urls", JSON.stringify(data.urls));
  }

  return fd;
};


// Get all entrepreneurs (approved)
export const useEntrepreneurs = () => {
  return useQuery<Entrepreneur[], Error>({
    queryKey: ['entrepreneurs'],
    queryFn: async () => {
      const res = await client.get('/entrepreneurs');
      return res.data;
    },
  });
};

/* ===== ADICIÓN (Archivo 2) - Hook: obtener emprendedor por ID ===== */
export const useEntrepreneurById = (id?: number) => {
  return useQuery<Entrepreneur, Error>({
    queryKey: ['entrepreneurs', 'detail', id],
    queryFn: async () => {
      const res = await client.get(`/entrepreneurs/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get pending entrepreneur requests
export const usePendingEntrepreneurs = () => {
  return useQuery<Entrepreneur[], Error>({
    queryKey: ['entrepreneurs', 'pending'],
    queryFn: async () => {
      const res = await client.get('/entrepreneurs/pending');
      return res.data;
    },
  });
};

// Add a new entrepreneur
export const useAddEntrepreneur = (isAdmin: boolean) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEntrepreneur: CreateCompleteEntrepreneurDto) => {
      if (!newEntrepreneur.files || newEntrepreneur.files.length !== 3) {
        throw new Error("Debes subir exactamente 3 imágenes.");
      }
      const url = isAdmin ? "/entrepreneurs" : "/entrepreneurs/public";
      const res = await client.post(url, transformEntrepreneurToFormData(newEntrepreneur));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs", "pending"] });
    },
  });
};

// Update an existing entrepreneur
export const useUpdateEntrepreneur = (id_entrepreneur: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updateData: UpdateCompleteEntrepreneurDto) => {
      if (updateData.files && updateData.files.length > 0) {
        const res = await client.put(`/entrepreneurs/${id_entrepreneur}`, transformEntrepreneurToFormData(updateData));
        return res.data;
      }
      const res = await client.put(`/entrepreneurs/${id_entrepreneur}`, updateData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurs", "pending"] });
    },
  });
};

// Update entrepreneur status (approve/reject)
export const useUpdateEntrepreneurStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_entrepreneur, status }: { id_entrepreneur: number; status: 'approved' | 'rejected' }) => {
      const res = await client.patch(`/entrepreneurs/${id_entrepreneur}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
    },
  });
};

// Toggle entrepreneur active/inactive
export const useToggleEntrepreneurActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_entrepreneur, active }: { id_entrepreneur: number; active: boolean }) => {
      const res = await client.patch(`/entrepreneurs/${id_entrepreneur}/toggle-active`, { active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
    },
  });
};

export const useDeleteEntrepreneur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id_entrepreneur: number) => {
      await client.delete(`/entrepreneurs/${id_entrepreneur}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
    },
  });
};

export const ENTREPRENEURSHIP_CATEGORIES = [
  'Comida',
  'Artesanía',
  'Vestimenta',
  'Accesorios',
  'Decoración',
  'Demostración',
  'Otra categoría'
] as const;

export const ENTREPRENEURSHIP_APPROACHES = [
  { value: 'social', label: 'Social' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'ambiental', label: 'Ambiental' },
] as const;
