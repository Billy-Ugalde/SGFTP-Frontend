// ==================== Base Types ====================

export interface Person {
  id_person?: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Volunteer {
  id_volunteer?: number;
  id_person?: number;
  is_active: boolean;
  registration_date?: string;
  updated_at?: string;
  person?: Person;
}

// ==================== DTOs ====================

export interface CreatePersonDto {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;
}

export interface CreateVolunteerDto {
  person: CreatePersonDto;
  is_active?: boolean;
}

export interface UpdatePersonDto {
  first_name?: string;
  second_name?: string;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phone_primary?: string;
  phone_secondary?: string;
}

export interface UpdateVolunteerDto {
  person?: UpdatePersonDto;
  is_active?: boolean;
}

// ==================== Form Types ====================

export interface VolunteerFormData {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;
  is_active: boolean;
}

export interface VolunteerUpdateData {
  id_volunteer?: number;
  first_name?: string;
  second_name?: string;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phone_primary?: string;
  phone_secondary?: string;
  is_active?: boolean;
}
