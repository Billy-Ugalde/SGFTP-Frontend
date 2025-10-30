// ==================== Base Types ====================

export interface Phone {
  id_phone?: number;
  id_person?: number;
  type: 'personal' | 'business';
  number: string;
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

export interface Volunteer {
  id_volunteer?: number;
  id_person?: number;
  is_active: boolean;
  registration_date?: string;
  updated_at?: string;
  person?: Person;
}

// ==================== DTOs ====================

export interface CreatePhoneDto {
  number: string;
}

export interface CreatePersonDto {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phones: CreatePhoneDto[];
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
  phones?: CreatePhoneDto[];
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
  phones: {
    number: string;
  }[];
  is_active: boolean;
}

export interface VolunteerUpdateData {
  id_volunteer?: number;
  first_name?: string;
  second_name?: string;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phones?: string; 
  is_active?: boolean;
}
