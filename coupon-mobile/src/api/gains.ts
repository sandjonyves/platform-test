import { apiClient } from './client';
import type { ApiResponse, GainsReport, Payment } from '../types';

export const gainsApi = {
  async getReport(): Promise<ApiResponse<GainsReport>> {
    const { data } = await apiClient.get<ApiResponse<GainsReport>>('/gains');
    return data;
  },

  /** Enregistre un paiement du client (admin uniquement). */
  async createPayment(amount: number): Promise<ApiResponse<Payment>> {
    const { data } = await apiClient.post<ApiResponse<Payment>>('/payments', { amount });
    return data;
  },
};
