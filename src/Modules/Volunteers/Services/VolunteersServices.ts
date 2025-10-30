import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Volunteer,
  CreateVolunteerDto,
  VolunteerFormData,
  UpdateVolunteerDto,
  VolunteerUpdateData
} from '../Types';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true
});

export const transformFormDataToDto = (formData: VolunteerFormData): CreateVolunteerDto => {

  const validPhones = formData.phones
    .filter(phone => phone.number && phone.number.trim() !== '')
    .map(phone => ({
      number: phone.number.trim()
    }));

  return {
    person: {
      first_name: formData.first_name,
      second_name: formData.second_name?.trim() || undefined,
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname,
      email: formData.email,
      phones: validPhones,
    },
    is_active: formData.is_active
  };
};

export const transformUpdateFormDataToDto = (formData: VolunteerUpdateData): UpdateVolunteerDto => {
  const phones = formData.phones && formData.phones.trim() !== '' 
    ? [{ number: formData.phones.trim() }]
    : [];

  return {
    person: {
      first_name: formData.first_name,
      second_name: formData.second_name?.trim() || undefined,
      first_lastname: formData.first_lastname,
      second_lastname: formData.second_lastname,
      email: formData.email,
      phones: phones
    },
    is_active: formData.is_active
  };
};

// Get all volunteers
export const useVolunteers = () => {
  return useQuery<Volunteer[], Error>({
    queryKey: ['volunteers'],
    queryFn: async () => {
      const res = await client.get('/volunteers');
      return res.data;
    },
  });
};

// Add a new volunteer
export const useAddVolunteer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newVolunteer: CreateVolunteerDto) => {
      const res = await client.post('/volunteers', newVolunteer);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
};

// Update volunteer
export const useUpdateVolunteer = (volunteerId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (volunteerData: UpdateVolunteerDto) => {
      const res = await client.put(`/volunteers/${volunteerId}`, volunteerData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
};

export const useToggleVolunteerActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_volunteer, is_active }: { id_volunteer: number; is_active: boolean }) => {
      const res = await client.patch(`/volunteers/${id_volunteer}/status`, { is_active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
};