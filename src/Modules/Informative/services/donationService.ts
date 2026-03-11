import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';

export type DonorType = 'donor' | 'strategic_ally';
export type DonorInterest = 'cultural' | 'environmental' | 'social';
export type DonationType = 'food' | 'clothing' | 'money' | 'used_items' | 'other';

export interface CreateDonationDto {
  firstName: string;
  secondName?: string;
  nameCompany?: string;
  firstLastName: string;
  secondLastName: string;
  donorType: DonorType;
  interest: DonorInterest;
  email: string;
  phone: string;
  donationType: DonationType;
  donationDetails: string;
}

export const DonationsApi = {
  createDonation: async (dto: CreateDonationDto) => {
    const response = await axios.post(`${API_BASE_URL}/donations`, dto);
    return response.data;
  },
};
