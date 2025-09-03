import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Person {
  id_person: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
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
  role: Role;
}

export interface CreateUserDto {
  password: string;
  id_person: number;
  status?: boolean;
  id_role: number;
}

export interface UpdateUserDto {
  password?: string;
  status?: boolean;
  id_role?: number;
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

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newUser: CreateUserDto) => {
      const res = await client.post('/users', newUser);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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

export const usePersons = () => {
  return useQuery<Person[], Error>({
    queryKey: ['persons'],
    queryFn: async () => {
      const res = await client.get('/persons');
      return res.data;
    },
  });
};

export const useRoles = () => {
  return useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await client.get('/roles');
      return res.data;
    },
  });
};