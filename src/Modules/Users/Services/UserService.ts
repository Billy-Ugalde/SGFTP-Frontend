import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export type PhoneType = 'personal' | 'business';

export interface Phone {
  id_phone: number;
  number: string;
  type: PhoneType;
  is_primary: boolean;
  id_person: number;
}

export interface Person {
  id_person: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phones?: Phone[];
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

export interface CreatePersonDto {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phones: CreatePhoneDto[];
}

export interface CreatePhoneDto {
  number: string;
  type?: PhoneType;
  is_primary?: boolean;
}

export interface UpdatePersonDto {
  first_name?: string
  second_name?: string | null;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phones?: CreatePhoneDto[];
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

        try {
          const usersRes = await client.get('/users');
          const users: User[] = usersRes.data;

          if (users.length > 0) {
            const uniqueRoles = users.reduce((roles: Role[], user: User) => {
              const existingRole = roles.find(r => r.id_role === user.role.id_role);
              if (!existingRole) {
                roles.push(user.role);
              }
              return roles;
            }, []);

            return uniqueRoles.sort((a, b) => a.name.localeCompare(b.name));
          }
        } catch (usersError) {
          console.error('Error fetching users for roles:', usersError);
        }


        return [
          { id_role: 1, name: "Administrador" },
          { id_role: 2, name: "Visitante" }
        ];
      }
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 10000,
  });
};