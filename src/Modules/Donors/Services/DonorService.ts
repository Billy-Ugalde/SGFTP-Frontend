import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config/env';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Const objects + union types (erasableSyntaxOnly compatible)
export const DonationType = {
  FOOD: 'food',
  CLOTHING: 'clothing',
  MONEY: 'money',
  USED_ITEMS: 'used_items',
  OTHER: 'other',
} as const;
export type DonationType = typeof DonationType[keyof typeof DonationType];

export const DonorInterest = {
  CULTURAL: 'cultural',
  ENVIRONMENTAL: 'environmental',
  SOCIAL: 'social',
} as const;
export type DonorInterest = typeof DonorInterest[keyof typeof DonorInterest];

export const DonorType = {
  DONOR: 'donor',
  STRATEGIC_ALLY: 'strategic_ally',
} as const;
export type DonorType = typeof DonorType[keyof typeof DonorType];

export const DonationStatus = {
  NUEVO: 'nuevo',
  EJECUCION: 'ejecucion',
  FINALIZADO: 'finalizado',
  SUSPENDIDO: 'suspendido',
} as const;
export type DonationStatus = typeof DonationStatus[keyof typeof DonationStatus];

// Donor entity (from backend)
export interface Donor {
  idDonor: number;
  firstName: string;
  secondName?: string | null;
  firstLastName: string;
  secondLastName: string;
  donorType: DonorType;
  nameCompany?: string | null;
  interest: DonorInterest;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Notation entity
export interface DonationNotation {
  id: number;
  content: string;
  createdAt: string;
  donation_id: number;
}

export interface CreateNotationDto {
  content: string;
}

// Donation entity (from backend)
export interface Donation {
  idDonation: number;
  donationType: DonationType;
  donationDetails: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  donor: Donor;
  notations?: DonationNotation[];
}

// DTOs
export interface CreateDonationDto {
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName: string;
  donorType: DonorType;
  nameCompany?: string;
  interest: DonorInterest;
  email: string;
  phone: string;
  donationType: DonationType;
  donationDetails: string;
}

export interface UpdateDonationDto {
  donationType?: DonationType;
  donationDetails?: string;
  status?: DonationStatus;
}

// Helper functions
export const humanizeEnum = (value?: string | null): string => {
  if (!value) return '—';
  return String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
};

export const getDonorFullName = (donor: Pick<Donor, 'firstName' | 'secondName' | 'firstLastName' | 'secondLastName'>) => {
  const first = [donor.firstName, donor.secondName].filter(Boolean).join(' ').trim();
  const last = [donor.firstLastName, donor.secondLastName].filter(Boolean).join(' ').trim();
  return `${first} ${last}`.trim();
};

// Label maps for enums
export const DonationTypeLabels: Record<DonationType, string> = {
  [DonationType.FOOD]: 'Comida',
  [DonationType.CLOTHING]: 'Ropa',
  [DonationType.MONEY]: 'Dinero',
  [DonationType.USED_ITEMS]: 'Artículos usados',
  [DonationType.OTHER]: 'Otro'
};

export const DonorInterestLabels: Record<DonorInterest, string> = {
  [DonorInterest.CULTURAL]: 'Cultural',
  [DonorInterest.ENVIRONMENTAL]: 'Ambiental',
  [DonorInterest.SOCIAL]: 'Social'
};

export const DonorTypeLabels: Record<DonorType, string> = {
  [DonorType.DONOR]: 'Persona',
  [DonorType.STRATEGIC_ALLY]: 'Aliado Estratégico',
};

export const DonationStatusLabels: Record<DonationStatus, string> = {
  [DonationStatus.NUEVO]: 'Nuevo',
  [DonationStatus.EJECUCION]: 'En Ejecución',
  [DonationStatus.FINALIZADO]: 'Finalizado',
  [DonationStatus.SUSPENDIDO]: 'Suspendido',
};

// React Query hooks
export const useDonations = () => {
  return useQuery({
    queryKey: ['donations'],
    queryFn: async (): Promise<Donation[]> => {
      const res = await client.get('/donations');
      return res.data;
    },
  });
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDonationDto): Promise<Donation> => {
      const res = await client.post('/donations', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};

export const useUpdateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDonationDto }): Promise<Donation> => {
      const res = await client.patch(`/donations/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};

export const useUpdateDonationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: DonationStatus }): Promise<Donation> => {
      const res = await client.patch(`/donations/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};

export const useAddNotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ donationId, data }: { donationId: number; data: CreateNotationDto }): Promise<DonationNotation> => {
      const res = await client.post(`/donations/${donationId}/notations`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};

// Backward compatibility - kept for existing components
export const useDonors = useDonations;
export const useCreateDonor = useCreateDonation;
export const useUpdateDonor = useUpdateDonation;

