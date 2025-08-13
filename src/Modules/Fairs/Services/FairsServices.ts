import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DateFair {
  id_date: number;
  date: string;
}

export interface Fair {
  id_fair: number;
  name: string;
  description: string;
  location: string;
  stand_capacity: number;
  status: boolean;
  datefairs: DateFair[]; 
}

export interface FairFormData {
  name: string;
  description: string;
  location: string;
  stand_capacity: number;
  status: boolean;
  dateFairs: string[]; 
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
      stand_capacity?: number; 
    }) => {
      const res = await client.put(`/fairs/${id_fair}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
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

export const useFairDates = (fairId: number) => {
  return useQuery<DateFair[], Error>({
    queryKey: ['fairDates', fairId],
    queryFn: async () => {
      const res = await client.get(`/dates/${fairId}`);
      return res.data;
    },
    enabled: !!fairId, 
  });
};

export const useAddFairDates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fairId, dates }: { fairId: number; dates: string[] }) => {
      const res = await client.post(`/dates/${fairId}`, { dateFairs: dates });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
      queryClient.invalidateQueries({ queryKey: ['fairDates', variables.fairId] });
    },
  });
};

export const useDeleteFairDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dateId: number) => {
      const res = await client.delete(`/dates/${dateId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
      queryClient.invalidateQueries({ queryKey: ['fairDates'] });
    },
  });
};