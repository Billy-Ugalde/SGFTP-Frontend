import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Stand {
  id_stand: number;
  stand_code: string;
  status: boolean;
}

export interface Fair {
  id_fair: number;
  name: string;
  description: string;
  location: string;
  typeFair: string;
  stand_capacity: number;
  status: boolean;
  date: string;
}

export interface FairFormData {
  name: string;
  description: string;
  location: string;
  typeFair: string;
  stand_capacity: number;
  status: boolean;
  date: string;
}

export interface Phone {
  id_phone?: number;
  number: string;
  type: 'personal' | 'business';
  is_primary: boolean;
}

export interface Person {
  id_person?: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phones?: Phone[];
}

export interface Entrepreneur {
  id_entrepreneur?: number;
  experience: number;
  facebook_url?: string;
  instagram_url?: string;
  person?: Person;
  entrepreneurship?: Entrepreneurship; 
}

export interface Entrepreneurship {
  id_entrepreneurship?: number;
  name: string;
  description: string;
  location: string;
  category: string;
  approach: 'social' | 'cultural' | 'ambiental';
}

export interface FairEnrollment {
  id_enrrolment_fair?: number;
  registration_date?: string;
  status: 'pending' | 'approved' | 'rejected';
  fair?: Fair;
  stand?: Stand;
  entrepreneur?: Entrepreneur;
}

export const useFairs = () => {
  return useQuery<Fair[], Error>({
    queryKey: ['fairs'],
    queryFn: async () => {
      const res = await client.get('/fairs');
      return res.data;
    },
  });
};

export const useStandsByFair = (fairId: number) => {
  return useQuery<Stand[], Error>({
    queryKey: ['stands', fairId],
    queryFn: async () => {
      const res = await client.get(`/stand/${fairId}`);
      return res.data;
    },
    enabled: !!fairId,
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
};

export const useAddFair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newFair: FairFormData) => {
      const res = await client.post('/fairs', newFair);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
    },
  });
};

export const useUpdateFair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_fair, ...data }: { 
      id_fair: number; 
      name?: string; 
      description?: string; 
      location?: string; 
      typeFair?: string;
      stand_capacity?: number; 
      date?: string;
    }) => {
      const res = await client.put(`/fairs/${id_fair}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
      queryClient.invalidateQueries({ queryKey: ['stands'] });
    },
  });
};

export const useUpdateFairStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_fair, status }: { id_fair: number; status: boolean }) => {
      const res = await client.patch(`/fairs/${id_fair}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
    },
  });
};

export const useFairEnrollments = () => {
  return useQuery<FairEnrollment[], Error>({
    queryKey: ['fair-enrollments'],
    queryFn: async () => {
      const res = await client.get('/enrollment'); 
      return res.data;
    },
  });
};

export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
      const res = await client.patch(`/enrollment/${id}/status`, { status }); 
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fair-enrollments'] });
    },
  });
};