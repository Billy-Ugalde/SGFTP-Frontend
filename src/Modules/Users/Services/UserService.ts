import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config/env';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export interface Person {
  id_person: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;
  user?: User;
}

export interface Role {
  id_role: number;
  name: string;
}

export interface User {
  id_user: number;
  password: string;
  status: boolean;
  person: Person;
  roles: Role[];      
}

export interface CreateUserDto {
  id_person: number;
  status?: boolean;
  id_roles: number[];
}

export interface UpdateUserDto {
  password?: string;
  status?: boolean;
  id_role?: number;
}

export interface CreatePersonDto {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;
}

export interface UpdatePersonDto {
  first_name?: string
  second_name?: string | null;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phone_primary?: string;
  phone_secondary?: string;
}

export interface CreateInvitationDto {
  id_person: number;
  status?: boolean;
  id_roles: number[];  
}

export interface CreateCompleteInvitationDto {
  // Datos de Person
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;

  // Datos de User
  id_roles: number[];
  status?: boolean;
}

export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await client.get('/users');
      return res.data;
    },
  });
};

export const useAddCompleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCompleteInvitationDto) => {
      const res = await client.post('/users/invite-complete', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newUser: CreateUserDto) => {
      const res = await client.post('/users/invite', newUser);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_user, ...data }: {
      id_user: number;
      password?: string;
      status?: boolean;
      id_role?: number;
    }) => {
      const res = await client.put(`/users/update/${id_user}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_user, status }: { id_user: number; status: boolean }) => {
      const res = await client.patch(`/users/status/${id_user}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_user, id_roles }: { id_user: number; id_roles: number[] }) => {
      const res = await client.patch(`/users/${id_user}/roles`, { id_roles });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const usePersons = () => {
  return useQuery<Person[], Error>({
    queryKey: ['persons'],
    queryFn: async () => {
      const res = await client.get('/people');
      return res.data;
    },
  });
};

export const useAddPerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPerson: CreatePersonDto) => {
      const res = await client.post('/people', newPerson);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdatePersonDto) => {
      const res = await client.put(`/people/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/people/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
};
export const useRoles = () => {
  return useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await client.get(`/users/roles/all?t=${timestamp}`);
        return res.data;
      } catch (error) {
        console.error('Error fetching roles from /users/roles/all:', error);

        // FALLBACK MEJORADO - Solo roles básicos predefinidos
        return [
          { id_role: 1, name: "super_admin" },
          { id_role: 2, name: "general_admin" },
          { id_role: 3, name: "fair_admin" },
          { id_role: 4, name: "content_admin" },
          { id_role: 5, name: "auditor" },
          { id_role: 6, name: "entrepreneur" },
          { id_role: 7, name: "volunteer" }
        ];
      }
    },
    staleTime: 5 * 60 * 1000,     // 5 minutos
    gcTime: 10 * 60 * 1000,       // 10 minutos 
    refetchOnWindowFocus: false,   // No refetch automático
    refetchOnMount: true,
  });
};