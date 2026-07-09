import { apiClient } from './client';
import type { ApiResponse, AuthData, User } from '../types';

export const authApi = {
  async login(
    username: string,
    password: string,
    fcmToken?: string | null,
  ): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>('/auth/login', {
      username,
      password,
      fcmToken,
    });
    return data;
  },

  async logout(): Promise<ApiResponse<{ userId: number }>> {
    const { data } = await apiClient.post<ApiResponse<{ userId: number }>>(
      '/auth/logout',
    );
    console.log('logout response', data);
    return data;
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>(
      '/auth/profile',
    );
    return data;
  },

  async updateFcmToken(fcmToken: string): Promise<ApiResponse<{ user: User }>> {
    const { data } = await apiClient.put<ApiResponse<{ user: User }>>(
      '/auth/profile',
      { fcmToken },
    );
    return data;
  },
};
