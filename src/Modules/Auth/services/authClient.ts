import axios from 'axios';

const authClient = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ← CRÍTICO para cookies
});

// Interceptor para renovación automática
/*
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh automáticamente
      try {
        await authClient.post('/auth/refresh');
        // Reintentar request original
        return authClient.request(error.config);
      } catch (refreshError) {
        // Redirect a login si refresh falla
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);*/

export default authClient;