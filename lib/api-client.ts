import axios from 'axios';
import { getToken, deleteToken } from './secure-storage';
import { getApiUrl } from '../constants/api';

const apiClient = axios.create();

// Dynamically set base URL from storage
apiClient.interceptors.request.use(async (config) => {
  const baseURL = await getApiUrl();
  config.baseURL = baseURL;

  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 by clearing auth and letting the app redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteToken();
      // The auth store will detect the missing token on next app focus
    }
    return Promise.reject(error);
  }
);

export default apiClient;
