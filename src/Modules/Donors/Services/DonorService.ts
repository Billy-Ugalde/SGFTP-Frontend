import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config/env';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export type DonationType = string;
export type DonorInterest = string;
export type ReadStatus = string;

export interface Donor {
  Id_donor: number;
  first_name: string;
  second_name?: string | null;
  first_lastname: string;
  second_lastname: string;
  Donation_type: DonationType;
  Interest: DonorInterest;
  Donation_details: string;
  Email: string;
  Phone: string;
  status: ReadStatus;
  archived: boolean;
  Created_at: string;
  Updated_at: string;
}

export interface CreateDonorDto {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  Donation_type: DonationType;
  Interest: DonorInterest;
  Donation_details: string;
  Email: string;
  Phone: string;
}

export type UpdateDonorDto = Partial<CreateDonorDto> & {
  archived?: boolean;
  status?: ReadStatus;
};

export const humanizeEnum = (value?: string | null): string => {
  if (!value) return '—';
  return String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
};

export const getDonorFullName = (donor: Pick<Donor, 'first_name' | 'second_name' | 'first_lastname' | 'second_lastname'>) => {
  const first = [donor.first_name, donor.second_name].filter(Boolean).join(' ').trim();
  const last = [donor.first_lastname, donor.second_lastname].filter(Boolean).join(' ').trim();
  return `${first} ${last}`.trim();
};

export const useDonors = () => {
  return useQuery({
    queryKey: ['donors'],
    queryFn: async (): Promise<Donor[]> => {
      const res = await client.get('/donors');
      return res.data;
    },
  });
};

export const useCreateDonor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDonorDto): Promise<Donor> => {
      const res = await client.post('/donors', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};

export const useUpdateDonor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDonorDto }): Promise<Donor> => {
      const res = await client.patch(`/donors/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};

