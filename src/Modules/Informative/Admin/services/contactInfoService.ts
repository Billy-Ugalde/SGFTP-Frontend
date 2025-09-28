// src/Modules/Informative/services/contactInfoService.ts
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const client = axios.create({
  baseURL: 'http://localhost:3001', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface ContactInfo {
  id_contact_info: number;
  email: string;
  phone: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  whatsapp_url: string;
  youtube_url: string;
  google_maps_url: string;
  lastUpdated: string;
}

export interface UpdateContactInfoDto {
  email?: string;
  phone?: string;
  address?: string;
  facebook_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
  youtube_url?: string;
  google_maps_url?: string;
}

// GET contact info
export const useContactInfo = () => {
  return useQuery<ContactInfo, Error>({
    queryKey: ['contactInfo'],
    queryFn: async () => {
      const res = await client.get('/contact-info');
      return res.data;
    },
  });
};

// UPDATE contact info
export const useUpdateContactInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateContactInfoDto) => {
      const res = await client.patch('/contact-info', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
    },
  });
};