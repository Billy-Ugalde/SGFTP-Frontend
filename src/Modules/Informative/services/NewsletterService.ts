import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';

export interface CreateSubscriberRequest {
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage: 'es' | 'en';
}

export interface UpdateSubscriberRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  preferredLanguage?: 'es' | 'en';
}

export interface Subscriber {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage: 'es' | 'en';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberStats {
  total: number;
  today: number;
  month: number;
  byLanguage: {
    spanish: number;
    english: number;
  };
  monthByLanguage: {
    spanish: number;
    english: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class SubscribersService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/subscribers`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        statusCode: error.response.status,
        error: error.response.data?.error
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error - Unable to connect to server',
        statusCode: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 500
      };
    }
  }

  // Create new subscriber
  async createSubscriber(data: CreateSubscriberRequest): Promise<Subscriber> {
    const response = await this.api.post<Subscriber>('/', data);
    return response.data;
  }

  // Get all subscribers
  async getAllSubscribers(): Promise<Subscriber[]> {
    const response = await this.api.get<Subscriber[]>('/');
    return response.data;
  }

  // Get subscriber by ID
  async getSubscriberById(id: number): Promise<Subscriber> {
    const response = await this.api.get<Subscriber>(`/${id}`);
    return response.data;
  }

  // Get subscriber by email
  async getSubscriberByEmail(email: string): Promise<Subscriber> {
    const response = await this.api.get<Subscriber>(`/email/${email}`);
    return response.data;
  }

  // Update subscriber
  async updateSubscriber(id: number, data: UpdateSubscriberRequest): Promise<Subscriber> {
    const response = await this.api.patch<Subscriber>(`/${id}`, data);
    return response.data;
  }

  // Delete subscriber
  async deleteSubscriber(id: number): Promise<void> {
    await this.api.delete(`/${id}`);
  }

  // Get subscribers by language
  async getSubscribersByLanguage(language: 'es' | 'en'): Promise<Subscriber[]> {
    const response = await this.api.get<Subscriber[]>(`/language/${language}`);
    return response.data;
  }

  // Get Spanish subscribers
  async getSpanishSubscribers(): Promise<Subscriber[]> {
    const response = await this.api.get<Subscriber[]>('/language/spanish');
    return response.data;
  }

  // Get English subscribers
  async getEnglishSubscribers(): Promise<Subscriber[]> {
    const response = await this.api.get<Subscriber[]>('/language/english');
    return response.data;
  }

  // Search subscribers by name
  async searchSubscribersByName(firstName?: string, lastName?: string): Promise<Subscriber[]> {
    const params = new URLSearchParams();
    if (firstName) params.append('firstName', firstName);
    if (lastName) params.append('lastName', lastName);
    
    const response = await this.api.get<Subscriber[]>(`/search?${params.toString()}`);
    return response.data;
  }

  // Get general statistics
  async getStats(): Promise<SubscriberStats> {
    const response = await this.api.get<SubscriberStats>('/stats');
    return response.data;
  }

  // Get statistics by language
  async getStatsByLanguage(language: 'es' | 'en'): Promise<{
    total: number;
    today: number;
    month: number;
    language: string;
  }> {
    const response = await this.api.get(`/stats/language/${language}`);
    return response.data;
  }
}

// Export singleton instance
export const subscribersService = new SubscribersService();
export default subscribersService;