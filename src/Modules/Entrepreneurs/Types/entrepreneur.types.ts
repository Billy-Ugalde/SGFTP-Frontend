// ==================== Base Types ====================

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

// ==================== Create DTOs ====================

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

// ==================== Update DTOs ====================

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

// ==================== Form Types ====================

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
  url_1?: File | undefined;
  url_2?: File | undefined;
  url_3?: File | undefined;
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

// ==================== Constants ====================

export const ENTREPRENEURSHIP_CATEGORIES = [
  'Comida',
  'Artesanía',
  'Vestimenta',
  'Accesorios',
  'Decoración',
  'Demostración',
  'Otra categoría',
] as const;

export const ENTREPRENEURSHIP_APPROACHES = [
  { value: 'social', label: 'Social' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'ambiental', label: 'Ambiental' },
] as const;
