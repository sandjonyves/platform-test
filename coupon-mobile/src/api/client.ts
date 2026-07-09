import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../config';
import { authStorage } from '../services/authStorage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    console.log(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }

  return config;
});

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] ← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      console.error('[API] ✗ Erreur', {
        url: `${error.config?.baseURL}${error.config?.url}`,
        code: error.code,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      await authStorage.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Erreur inattendue.';
  }

  if (error.code === 'ECONNABORTED') {
    return `Délai dépassé — serveur injoignable (${API_BASE_URL})`;
  }

  if (!error.response) {
    return `Serveur injoignable (${API_BASE_URL}). Vérifiez que le backend tourne et que l'IP est correcte.`;
  }

  const data = error.response.data as { message?: string } | undefined;
  return data?.message || `Erreur serveur (${error.response.status})`;
}
