import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Cliente sin autenticación
const client = axios.create({
  baseURL: 'https://localhost:7210',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type FairStatus = 
  | 'draft'
  | 'published'
  | 'registration_open'
  | 'registration_closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'suspended';

export type FairCategory = 
  | 'environmental'
  | 'cultural'
  | 'artisan'
  | 'entrepreneurship'
  | 'community'
  | 'educational';

export interface Fair {
  id: number;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  province: string;
  maxParticipants: number;
  currentParticipants: number;
  status: FairStatus;
  category: FairCategory;
  requirements: string[];
  phone: string;
  email: string;
  responsiblePerson: string;
  createdAt: string;
  updatedAt: string;
}

export interface FairFormData {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  province: string;
  maxParticipants: number;
  category: FairCategory;
  requirements: string[];
  phone: string;
  email: string;
  responsiblePerson: string;
}

export interface FairStatusUpdate {
  id: number;
  status: FairStatus;
  reason?: string;
}

interface FairUpdateData extends Partial<FairFormData> {
  id: number;
}

export const useFairService = () => {
  const fetchFairs = async (): Promise<Fair[]> => {
    try {
      const response = await client.get<Fair[]>('/api/fairs');
      return response.data;
    } catch (error) {
      throw new Error('Error fetching fairs');
    }
  };

  const fetchFairById = async (id: number): Promise<Fair> => {
    try {
      const response = await client.get<Fair>(`/api/fairs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching fair with id ${id}`);
    }
  };

  const postFair = async (newFair: FairFormData): Promise<Fair> => {
    try {
      const response = await client.post<Fair>('/api/fairs', newFair);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Error adding fair");
      }
      return response.data;
    } catch (error) {
      throw new Error("Error adding fair");
    }
  };

  const updateFair = async (updatedFair: FairUpdateData): Promise<Fair> => {
    try {
      const { id, ...fairData } = updatedFair;
      const response = await client.put<Fair>(`/api/fairs/${id}`, fairData);
      if (response.status !== 200) {
        throw new Error("Error updating fair");
      }
      return response.data;
    } catch (error) {
      throw new Error("Error updating fair");
    }
  };

  const updateFairStatus = async (statusUpdate: FairStatusUpdate): Promise<Fair> => {
    try {
      const response = await client.patch<Fair>(`/api/fairs/${statusUpdate.id}/status`, {
        status: statusUpdate.status,
        reason: statusUpdate.reason
      });
      if (response.status !== 200) {
        throw new Error("Error updating fair status");
      }
      return response.data;
    } catch (error) {
      throw new Error("Error updating fair status");
    }
  };

  const deleteFair = async (id: number): Promise<void> => {
    try {
      const response = await client.delete(`/api/fairs/${id}`);
      if (response.status !== 200 && response.status !== 204) {
        throw new Error("Error deleting fair");
      }
    } catch (error) {
      throw new Error("Error deleting fair");
    }
  };

  const enableFair = async (id: number): Promise<Fair> => {
    return updateFairStatus({ 
      id, 
      status: 'published', 
      reason: 'Fair enabled by administrator' 
    });
  };

  const disableFair = async (id: number, reason?: string): Promise<Fair> => {
    return updateFairStatus({ 
      id, 
      status: 'suspended', 
      reason: reason || 'Fair disabled by administrator' 
    });
  };

  return { 
    fetchFairs, 
    fetchFairById, 
    postFair, 
    updateFair, 
    updateFairStatus, 
    deleteFair,
    enableFair,
    disableFair
  };
};

// Hooks para consultas
export const useFairs = () => {
  const { fetchFairs } = useFairService();
  return useQuery<Fair[], Error>({
    queryKey: ['fairs'],
    queryFn: fetchFairs,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useFair = (id: number) => {
  const { fetchFairById } = useFairService();
  return useQuery<Fair, Error>({
    queryKey: ['fair', id],
    queryFn: () => fetchFairById(id),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!id,
  });
};

// Interfaces para el contexto de las mutaciones
interface AddFairContext {
  previous: Fair[] | undefined;
}

interface UpdateFairContext {
  previousFairs: Fair[] | undefined;
  previousFair: Fair | undefined;
}

interface DeleteFairContext {
  previous: Fair[] | undefined;
}

// Hooks para mutaciones
export const useAddFair = () => {
  const queryClient = useQueryClient();
  const { postFair } = useFairService();

  return useMutation<Fair, Error, FairFormData, AddFairContext>({
    mutationFn: postFair,
    onMutate: async (newFair: FairFormData): Promise<AddFairContext> => {
      await queryClient.cancelQueries({ queryKey: ['fairs'] });
      const previous = queryClient.getQueryData<Fair[]>(['fairs']);

      const optimisticFair: Fair = {
        ...newFair,
        id: Date.now(), // Temporary ID
        currentParticipants: 0,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Fair[]>(['fairs'], (old: Fair[] | undefined) => 
        old ? [...old, optimisticFair] : [optimisticFair]
      );

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['fairs'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
    },
  });
};

export const useUpdateFair = () => {
  const queryClient = useQueryClient();
  const { updateFair } = useFairService();

  return useMutation<Fair, Error, FairUpdateData, UpdateFairContext>({
    mutationFn: updateFair,
    onMutate: async (updatedFair: FairUpdateData): Promise<UpdateFairContext> => {
      await queryClient.cancelQueries({ queryKey: ['fairs'] });
      await queryClient.cancelQueries({ queryKey: ['fair', updatedFair.id] });
      
      const previousFairs = queryClient.getQueryData<Fair[]>(['fairs']);
      const previousFair = queryClient.getQueryData<Fair>(['fair', updatedFair.id]);

      // Update fairs list
      queryClient.setQueryData<Fair[]>(['fairs'], (old: Fair[] | undefined) =>
        old ? old.map(fair => 
          fair.id === updatedFair.id ? { ...fair, ...updatedFair } : fair
        ) : []
      );

      // Update individual fair
      queryClient.setQueryData<Fair>(['fair', updatedFair.id], (old: Fair | undefined) => 
        old ? { ...old, ...updatedFair } : old
      );

      return { previousFairs, previousFair };
    },
    onError: (_err, updatedFair, context) => {
      if (context?.previousFairs) {
        queryClient.setQueryData(['fairs'], context.previousFairs);
      }
      if (context?.previousFair) {
        queryClient.setQueryData(['fair', updatedFair.id], context.previousFair);
      }
    },
    onSettled: (_data, _error, updatedFair) => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
      queryClient.invalidateQueries({ queryKey: ['fair', updatedFair.id] });
    },
  });
};

export const useUpdateFairStatus = () => {
  const queryClient = useQueryClient();
  const { updateFairStatus } = useFairService();

  return useMutation<Fair, Error, FairStatusUpdate>({
    mutationFn: updateFairStatus,
    onSuccess: (updatedFair: Fair) => {
      // Update fairs list
      queryClient.setQueryData<Fair[]>(['fairs'], (old: Fair[] | undefined) =>
        old ? old.map(fair => 
          fair.id === updatedFair.id ? updatedFair : fair
        ) : []
      );
      
      // Update individual fair
      queryClient.setQueryData<Fair>(['fair', updatedFair.id], updatedFair);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
    },
  });
};

export const useDeleteFair = () => {
  const queryClient = useQueryClient();
  const { deleteFair } = useFairService();

  return useMutation<void, Error, number, DeleteFairContext>({
    mutationFn: deleteFair,
    onMutate: async (id: number): Promise<DeleteFairContext> => {
      await queryClient.cancelQueries({ queryKey: ['fairs'] });
      const previous = queryClient.getQueryData<Fair[]>(['fairs']);

      queryClient.setQueryData<Fair[]>(['fairs'], (old: Fair[] | undefined) =>
        old ? old.filter(fair => fair.id !== id) : []
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['fairs'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
    },
  });
};

export const useEnableFair = () => {
  const queryClient = useQueryClient();
  const { enableFair } = useFairService();

  return useMutation<Fair, Error, number>({
    mutationFn: enableFair,
    onSuccess: (updatedFair: Fair) => {
      queryClient.setQueryData<Fair[]>(['fairs'], (old: Fair[] | undefined) =>
        old ? old.map(fair => 
          fair.id === updatedFair.id ? updatedFair : fair
        ) : []
      );
      queryClient.setQueryData<Fair>(['fair', updatedFair.id], updatedFair);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
    },
  });
};

export const useDisableFair = () => {
  const queryClient = useQueryClient();
  const { disableFair } = useFairService();

  return useMutation<Fair, Error, { id: number; reason?: string }>({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => disableFair(id, reason),
    onSuccess: (updatedFair: Fair) => {
      queryClient.setQueryData<Fair[]>(['fairs'], (old: Fair[] | undefined) =>
        old ? old.map(fair => 
          fair.id === updatedFair.id ? updatedFair : fair
        ) : []
      );
      queryClient.setQueryData<Fair>(['fair', updatedFair.id], updatedFair);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['fairs'] });
    },
  });
};