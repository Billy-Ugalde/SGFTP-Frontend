import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
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
  category: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración';
  approach: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
  created_at?: string;
  updated_at?: string;
}

// DTO interfaces that match your backend structure
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
  experience: number;
  facebook_url?: string;
  instagram_url?: string;
}

export interface CreateEntrepreneurshipDto {
  name: string;
  description: string;
  location: string;
  category: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración';
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

// Update DTOs
export interface UpdatePhoneDto {
  number?: string;
  type?: 'personal' | 'business';
  is_primary?: boolean;
}

export interface UpdatePersonDto {
  first_name?: string;
  second_name?: string;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phones?: UpdatePhoneDto[];
}

export interface UpdateEntrepreneurDto {
  experience?: number;
  facebook_url?: string;
  instagram_url?: string;
}

export interface UpdateEntrepreneurshipDto {
  name?: string;
  description?: string;
  location?: string;
  category?: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración';
  approach?: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
}

export interface UpdateCompleteEntrepreneurDto {
  person?: UpdatePersonDto;
  entrepreneur?: UpdateEntrepreneurDto;
  entrepreneurship?: UpdateEntrepreneurshipDto;
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
  experience: number;
  facebook_url?: string;
  instagram_url?: string;
  // Entrepreneurship data
  entrepreneurship_name: string;
  description: string;
  location: string;
  category: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración';
  approach: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
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
  category?: 'Comida' | 'Artesanía' | 'Vestimenta' | 'Accesorios' | 'Decoración' | 'Demostración';
  approach?: 'social' | 'cultural' | 'ambiental';
  url_1?: string;
  url_2?: string;
  url_3?: string;
}

 const getValueOrUndefined = (value: string | undefined): string | undefined => {
    return value === '' ? undefined : value;
  };

// Helper function to transform form data to backend DTO
export const transformFormDataToDto = (formData: EntrepreneurFormData): CreateCompleteEntrepreneurDto => {
  
  return {
    person: {
      first_name: formData.first_name,
      second_name: formData.second_name,
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname,
      email: formData.email,
      phones: formData.phones.map(phone => ({ number: phone.number, type: phone.type, is_primary: phone.is_primary }))
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
  };
};

// Helper function to transform form data to backend DTO for updates
export const transformUpdateDataToDto = (formData: EntrepreneurUpdateData): UpdateCompleteEntrepreneurDto => {
  const dto: UpdateCompleteEntrepreneurDto = {};
  

  if (formData.first_name || formData.second_name || formData.first_lastname || formData.second_lastname || formData.email || formData.phones) {
    dto.person = {};
    if (formData.first_name) dto.person.first_name = formData.first_name;
    if (formData.second_name) dto.person.second_name = formData.second_name;
    if (formData.first_lastname) dto.person.first_lastname = formData.first_lastname;
    if (formData.second_lastname) dto.person.second_lastname = formData.second_lastname;
    if (formData.email) dto.person.email = formData.email;
    
    if (formData.phones) {
      dto.person.phones = formData.phones.map(phone => ({
        number: phone.number,
        type: phone.type,
        is_primary: phone.is_primary
      }));
    }
  }

  if (formData.experience || formData.facebook_url || formData.instagram_url) {
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

// Helper function to transform entrepreneur data back to form format
export const transformEntrepreneurToFormData = (entrepreneur: Entrepreneur): EntrepreneurFormData => {
  return {
    first_name: entrepreneur.person?.first_name || '',
    second_name: entrepreneur.person?.second_name,
    first_lastname: entrepreneur.person?.first_lastname || '',
    second_lastname: entrepreneur.person?.second_lastname || '',
    email: entrepreneur.person?.email || '',
    phones: entrepreneur.person?.phones || [{ number: '', type: 'personal', is_primary: true }],
    experience: entrepreneur.experience,
    facebook_url: entrepreneur.facebook_url,
    instagram_url: entrepreneur.instagram_url,
    entrepreneurship_name: entrepreneur.entrepreneurship?.name || '',
    description: entrepreneur.entrepreneurship?.description || '',
    location: entrepreneur.entrepreneurship?.location || '',
    category: entrepreneur.entrepreneurship?.category || 'Comida',
    approach: entrepreneur.entrepreneurship?.approach || 'social',
    url_1: entrepreneur.entrepreneurship?.url_1,
    url_2: entrepreneur.entrepreneurship?.url_2,
    url_3: entrepreneur.entrepreneurship?.url_3
  };
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
export const useAddEntrepreneur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEntrepreneur: CreateCompleteEntrepreneurDto) => {
      const res = await client.post('/entrepreneurs', newEntrepreneur);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
    },
  });
};

// Update an existing entrepreneur
export const useUpdateEntrepreneur = () => {
  const queryClient = useQueryClient();
 return useMutation({
    mutationFn: async ({ id_entrepreneur, ...updateData }: { id_entrepreneur: number } & UpdateCompleteEntrepreneurDto) => {
      const res = await client.put(`/entrepreneurs/${id_entrepreneur}`, updateData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs'] });
      queryClient.invalidateQueries({ queryKey: ['entrepreneurs', 'pending'] });
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


export const ENTREPRENEURSHIP_CATEGORIES = [
  'Comida',
  'Artesanía', 
  'Vestimenta',
  'Accesorios',
  'Decoración',
  'Demostración'
] as const;

export const ENTREPRENEURSHIP_APPROACHES = [
  { value: 'social', label: 'Social' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'ambiental', label: 'Ambiental' },
] as const;