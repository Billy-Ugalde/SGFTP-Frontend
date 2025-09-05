import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});


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

export interface EntrepreneurshipImage {
  id_image: number;
  url: string;
  alt?: string;
}

export interface Entrepreneurship {
  id_entrepreneurship?: number;
  id_entrepreneur?: number;
  name: string;
  description: string;
  location: string;
  category:
    | 'Comida'
    | 'Artesanía'
    | 'Vestimenta'
    | 'Accesorios'
    | 'Decoración'
    | 'Demostración'
    | 'Otra categoría';
  approach: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
  created_at?: string;
  updated_at?: string;
  images?: EntrepreneurshipImage[];
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
  category:
    | 'Comida'
    | 'Artesanía'
    | 'Vestimenta'
    | 'Accesorios'
    | 'Decoración'
    | 'Demostración'
    | 'Otra categoría';
  approach: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
}
export interface CreateCompleteEntrepreneurDto {
  person: CreatePersonDto;
  entrepreneur: CreateEntrepreneurDto;
  entrepreneurship: CreateEntrepreneurshipDto;
}
export interface UpdatePhoneDto { number?: string; type?: 'personal' | 'business'; is_primary?: boolean; }
export interface UpdatePersonDto {
  first_name?: string; second_name?: string; first_lastname?: string; second_lastname?: string;
  email?: string; phones?: UpdatePhoneDto[];
}
export interface UpdateEntrepreneurDto { experience?: number; facebook_url?: string; instagram_url?: string; }
export interface UpdateEntrepreneurshipDto {
  name?: string; description?: string; location?: string;
  category?: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración' | 'Otra categoría';
  approach?: 'social' | 'cultural' | 'ambiental';
  url_1?: string; url_2?: string; url_3?: string;
}
export interface UpdateCompleteEntrepreneurDto { person?: UpdatePersonDto; entrepreneur?: UpdateEntrepreneurDto; entrepreneurship?: UpdateEntrepreneurshipDto; }

export interface EntrepreneurFormData {
  first_name: string; second_name?: string; first_lastname: string; second_lastname: string; email: string;
  phones: { number: string; type: 'personal' | 'business'; is_primary: boolean }[];
  experience: number | null; facebook_url?: string; instagram_url?: string;
  entrepreneurship_name: string; description: string; location: string;
  category: 'Comida'|'Artesanía'|'Vestimenta'|'Accesorios'|'Decoración'|'Demostración'|'Otra categoría';
  approach: 'social'|'cultural'|'ambiental'; url_1?: string; url_2?: string; url_3?: string;
}
export interface EntrepreneurUpdateData extends Partial<Omit<EntrepreneurFormData,'entrepreneurship_name'>> {
  entrepreneurship_name?: string;
}

const getValueOrUndefined = (value: string | undefined): string | undefined =>
  value === '' ? undefined : value;

export const transformFormDataToDto = (formData: EntrepreneurFormData): CreateCompleteEntrepreneurDto => ({
  person: {
    first_name: formData.first_name,
    second_name: formData.second_name,
    first_lastname: formData.first_lastname,
    second_lastname: formData.second_lastname,
    email: formData.email,
    phones: formData.phones.map(p => ({ number: p.number, type: p.type, is_primary: p.is_primary }))
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
    approach: formData.approach,
    url_1: formData.url_1,
    url_2: formData.url_2,
    url_3: formData.url_3
  }
});

export const transformUpdateDataToDto = (formData: EntrepreneurUpdateData): UpdateCompleteEntrepreneurDto => {
  const dto: UpdateCompleteEntrepreneurDto = {};
  if (formData.first_name || formData.second_name || formData.first_lastname || formData.second_lastname || formData.email || formData.phones) {
    dto.person = {};
    if (formData.first_name) dto.person.first_name = formData.first_name;
    if (formData.second_name) dto.person.second_name = formData.second_name;
    if (formData.first_lastname) dto.person.first_lastname = formData.first_lastname;
    if (formData.second_lastname) dto.person.second_lastname = formData.second_lastname;
    if (formData.email) dto.person.email = formData.email;
    if (formData.phones) dto.person.phones = formData.phones.map(p => ({ number: p.number, type: p.type, is_primary: p.is_primary }));
  }
  if (formData.experience || formData.facebook_url !== undefined || formData.instagram_url !== undefined) {
    dto.entrepreneur = {};
    if (formData.experience) dto.entrepreneur.experience = formData.experience;
    if (formData.facebook_url !== undefined) dto.entrepreneur.facebook_url = getValueOrUndefined(formData.facebook_url);
    if (formData.instagram_url !== undefined) dto.entrepreneur.instagram_url = getValueOrUndefined(formData.instagram_url);
  }
  if (formData.entrepreneurship_name || formData.description || formData.location || formData.category || formData.approach || formData.url_1 || formData.url_2 || formData.url_3) {
    dto.entrepreneurship = {};
    if (formData.entrepreneurship_name) dto.entrepreneurship.name = formData.entrepreneurship_name;
    if (formData.description) dto.entrepreneurship.description = formData.description;
    if (formData.location) dto.entrepreneurship.location = formData.location;
    if (formData.category) dto.entrepreneurship.category = formData.category;
    if (formData.approach) dto.entrepreneurship.approach = formData.approach;
    if (formData.url_1) dto.entrepreneurship.url_1 = formData.url_1;
    if (formData.url_2) dto.entrepreneurship.url_2 = formData.url_2;
    if (formData.url_3) dto.entrepreneurship.url_3 = formData.url_3;
  }
  return dto;
};

export const transformEntrepreneurToFormData = (e: Entrepreneur): EntrepreneurFormData => ({
  first_name: e.person?.first_name || '',
  second_name: e.person?.second_name,
  first_lastname: e.person?.first_lastname || '',
  second_lastname: e.person?.second_lastname || '',
  email: e.person?.email || '',
  phones: e.person?.phones || [{ number: '', type: 'personal', is_primary: true }],
  experience: e.experience,
  facebook_url: e.facebook_url,
  instagram_url: e.instagram_url,
  entrepreneurship_name: e.entrepreneurship?.name || '',
  description: e.entrepreneurship?.description || '',
  location: e.entrepreneurship?.location || '',
  category: e.entrepreneurship?.category || 'Comida',
  approach: e.entrepreneurship?.approach || 'social',
  url_1: e.entrepreneurship?.url_1,
  url_2: e.entrepreneurship?.url_2,
  url_3: e.entrepreneurship?.url_3,
});


export const useEntrepreneurs = () =>
  useQuery<Entrepreneur[], Error>({
    queryKey: ['entrepreneurs'],
    queryFn: async () => (await client.get('/entrepreneurs')).data,
  });

export const useEntrepreneurById = (id?: number) =>
  useQuery<Entrepreneur, Error>({
    queryKey: ['entrepreneurs', 'detail', id],
    queryFn: async () => (await client.get(`/entrepreneurs/${id}`)).data,
    enabled: !!id,           
    staleTime: 5 * 60 * 1000 
  });

export const usePendingEntrepreneurs = () =>
  useQuery<Entrepreneur[], Error>({
    queryKey: ['entrepreneurs', 'pending'],
    queryFn: async () => (await client.get('/entrepreneurs/pending')).data,
  });

export const useAddEntrepreneur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCompleteEntrepreneurDto) =>
      (await client.post('/entrepreneurs', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
    },
  });
};

export const useUpdateEntrepreneur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_entrepreneur, ...updateData }: { id_entrepreneur: number } & UpdateCompleteEntrepreneurDto) =>
      (await client.put(`/entrepreneurs/${id_entrepreneur}`, updateData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
    },
  });
};

export const useUpdateEntrepreneurStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_entrepreneur, status }: { id_entrepreneur: number; status: 'approved' | 'rejected' }) =>
      (await client.patch(`/entrepreneurs/${id_entrepreneur}/status`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
    },
  });
};

export const useToggleEntrepreneurActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_entrepreneur, active }: { id_entrepreneur: number; active: boolean }) =>
      (await client.patch(`/entrepreneurs/${id_entrepreneur}/toggle-active`, { active })).data,
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
  'Comida', 'Artesanía', 'Vestimenta', 'Accesorios', 'Decoración', 'Demostración', 'Otra categoría',
] as const;

export const ENTREPRENEURSHIP_APPROACHES = [
  { value: 'social', label: 'Social' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'ambiental', label: 'Ambiental' },
] as const;
