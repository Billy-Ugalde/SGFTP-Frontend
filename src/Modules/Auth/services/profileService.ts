// src/Modules/Auth/services/personService.ts
import authClient from './authClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** ------------------------------
 *  Tipos
 *  ------------------------------ */
export type UpdatePersonPayload = {
  first_name?: string;
  second_name?: string;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phone_primary?: string;
  phone_secondary?: string;
};

export type PersonProfile = {
  id_person: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname?: string;
  email?: string;
  phone_primary: string;
  phone_secondary?: string;
};

/** ------------------------------
 *  Funciones existentes (compat)
 *  ------------------------------ */
export async function getPersonById(id: number) {
  const { data } = await authClient.get(`/people/${id}`);
  return data;
}

export async function updatePerson(id: number, payload: UpdatePersonPayload) {
  const { data } = await authClient.put(`/people/${id}`, payload);
  return data;
}

/** ------------------------------
 *  Identidad del usuario logueado
 *  ------------------------------ */

// Devuelve el payload completo de identidad (no solo person)
export const useMyProfile = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<any> => {
      const tryGet = async (url: string) => {
        try {
          const { data } = await authClient.get(url);
          return data ?? null;
        } catch {
          return null;
        }
      };
      // Preferimos /users/me si existe; si no, /auth/me
      return (await tryGet('/users/me')) ?? (await tryGet('/auth/me')) ?? {};
    },
    staleTime: 60_000,
  });

// Extrae ids en múltiples formatos posibles (robusto ante distintas formas de back)
export function extractIdsFromMe(me: any): { personId?: number; entrepreneurId?: number } {
  const personId =
    me?.person?.id_person ??
    me?.person?.id ??
    me?.id_person ??
    me?.personId ??
    me?.user?.person?.id_person ??
    me?.user?.person?.id;

  const entrepreneurId =
    me?.entrepreneur?.id_entrepreneur ??
    me?.entrepreneur?.id ??
    me?.id_entrepreneur ??
    me?.entrepreneurId ??
    me?.user?.entrepreneur?.id_entrepreneur ??
    me?.user?.entrepreneur?.id;

  return { personId, entrepreneurId };
}

/** ------------------------------
 *  Actualizar perfil "me"
 *  ------------------------------ */
export const useUpdateMyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UpdatePersonPayload> & { id_person?: number }) => {
      try {
        const { data } = await authClient.patch('/users/me', payload);
        return data;
      } catch {
        // Fallback: actualizar vía /people/{id_person}
        let idToUse = payload.id_person;
        if (!idToUse) {
          const meUsers = await authClient.get('/users/me').catch(() => null);
          const meAuth = meUsers ?? (await authClient.get('/auth/me').catch(() => null));
          const { personId } = extractIdsFromMe(meAuth?.data ?? {});
          if (!personId) throw new Error('No se pudo resolver id_person del usuario autenticado.');
          idToUse = personId;
        }
        const { data } = await authClient.put(`/people/${idToUse}`, payload);
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
};
