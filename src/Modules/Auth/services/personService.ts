import authClient from '../../Auth/services/authClient';

export type UpdatePersonPayload = {
  first_name?: string;
  second_name?: string;
  first_lastname?: string;
  second_lastname?: string;
  email?: string;
  phones?: Array<{
    number?: string;
    type?: 'PERSONAL' | 'WORK' | 'HOME';
    is_primary?: boolean;
  }>;
};

export async function getPersonById(id: number) {
  const { data } = await authClient.get(`/people/${id}`);
  return data;
}

export async function updatePerson(id: number, payload: UpdatePersonPayload) {
  const { data } = await authClient.put(`/people/${id}`, payload);
  return data;
}

