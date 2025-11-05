import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type {
  NewsletterCampaign,
  SendCampaignDto,
  SubscribersCount,
  SubscribersList,
  CampaignLanguage,
  CampaignsResponse
} from '../types/newsletter.types';
import { API_BASE_URL } from '../../../config/env';

const newsletterClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const NEWSLETTER_KEYS = {
  all: ['newsletters'] as const,
  subscribers: {
    count: (language?: CampaignLanguage) => ['newsletters', 'subscribers', 'count', language] as const,
    list: (language?: CampaignLanguage) => ['newsletters', 'subscribers', 'list', language] as const,
  },
  campaigns: {
    all: () => ['newsletters', 'campaigns'] as const,
    list: (page: number, limit: number) => ['newsletters', 'campaigns', 'list', page, limit] as const,
    detail: (id: number) => ['newsletters', 'campaigns', 'detail', id] as const,
  },
};

export const useSubscribersCount = (language?: CampaignLanguage) => {
  return useQuery<SubscribersCount, Error>({
    queryKey: NEWSLETTER_KEYS.subscribers.count(language),
    queryFn: async () => {
      const params = language ? { language } : {};
      const res = await newsletterClient.get('/newsletters/subscribers/count', { params });
      return res.data;
    },
    staleTime: 30000,
    retry: 1,
  });
};

export const useSubscribersList = (language?: CampaignLanguage) => {
  return useQuery<SubscribersList, Error>({
    queryKey: NEWSLETTER_KEYS.subscribers.list(language),
    queryFn: async () => {
      const params = language ? { language } : {};
      const res = await newsletterClient.get('/newsletters/subscribers/list', { params });
      return res.data;
    },
    staleTime: 30000,
    retry: 1,
  });
};

export const useSendCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation<NewsletterCampaign, Error, SendCampaignDto>({
    mutationFn: async (campaignData: SendCampaignDto) => {
      const res = await newsletterClient.post('/newsletters/send', campaignData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWSLETTER_KEYS.campaigns.all() });
      queryClient.invalidateQueries({ queryKey: NEWSLETTER_KEYS.subscribers.count() });
    },
  });
};

export const useCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery<CampaignsResponse, Error>({
    queryKey: NEWSLETTER_KEYS.campaigns.list(page, limit),
    queryFn: async () => {
      const res = await newsletterClient.get('/newsletters/campaigns', {
        params: { page, limit }
      });
      return res.data;
    },
    staleTime: 60000,
    retry: 1,
  });
};

export const useCampaign = (id: number) => {
  return useQuery<NewsletterCampaign, Error>({
    queryKey: NEWSLETTER_KEYS.campaigns.detail(id),
    queryFn: async () => {
      const res = await newsletterClient.get(`/newsletters/campaigns/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 60000,
    retry: 1,
  });
};