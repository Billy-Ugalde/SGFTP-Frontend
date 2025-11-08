import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ← CRÍTICO para cookies
});

// Interceptor para renovación automática de token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const publicAuthEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/activate',
      '/auth/resend-activation'
    ];
    const isPublicEndpoint = publicAuthEndpoints.some(endpoint =>
      originalRequest.url?.includes(endpoint)
    );

    // Si el error es 401 y no hemos intentado refresh aún
    // Y NO es un endpoint público de autenticación
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      if (isRefreshing) {
        // Si ya hay un refresh en proceso, esperar
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => authClient.request(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refresh
        await authClient.post('/auth/refresh');
        processQueue();
        isRefreshing = false;
        // Reintentar request original
        return authClient.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        // Redirect a session expired page si refresh falla
        window.location.href = '/session-expired';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default authClient;