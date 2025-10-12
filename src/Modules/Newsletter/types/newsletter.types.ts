export type CampaignLanguage = 'spanish' | 'english';
export type CampaignStatus = 'completed' | 'failed' | 'partial';

export interface NewsletterCampaign {
  id: number;
  subject: string;
  content?: string;
  language: CampaignLanguage;
  sentBy: {
    name: string;
    email: string;
  };
  sentAt: string;
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  status: CampaignStatus;
  errors?: string[] | null;
}

export interface SendCampaignDto {
  subject: string;
  content: string;
  language: CampaignLanguage;
}

export interface SubscribersCount {
  count: number;
}

export interface Subscriber {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage: 'es' | 'en';
  createdAt: string;
}

export interface SubscribersList {
  subscribers: Subscriber[];
}

export interface CampaignsResponse {
  campaigns: NewsletterCampaign[];
  total: number;
  page: number;
  totalPages: number;
}