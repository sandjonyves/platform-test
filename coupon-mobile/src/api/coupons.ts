import { apiClient } from './client';
import type { ApiResponse, CodeName, Coupon } from '../types';

export const couponsApi = {
  async getAll(): Promise<ApiResponse<Coupon[]>> {
    const { data } = await apiClient.get<ApiResponse<Coupon[]>>('/coupons');
    return data;
  },

  async getById(id: number): Promise<ApiResponse<Coupon>> {
    const { data } = await apiClient.get<ApiResponse<Coupon>>(`/coupons/${id}`);
    return data;
  },

  async validateCode(
    id: number,
    codeName: CodeName,
  ): Promise<ApiResponse<unknown>> {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/coupons/code/validate/${id}`,
      { codeName },
    );
    return data;
  },

  async invalidateCode(
    id: number,
    codeName: CodeName,
  ): Promise<ApiResponse<unknown>> {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/coupons/code/invalidate/${id}`,
      { codeName },
    );
    return data;
  },

  async validateCoupon(id: number): Promise<ApiResponse<Coupon>> {
    const { data } = await apiClient.put<ApiResponse<Coupon>>(
      `/coupons/validate/${id}`,
    );
    return data;
  },

  async invalidateCoupon(id: number): Promise<ApiResponse<Coupon>> {
    const { data } = await apiClient.put<ApiResponse<Coupon>>(
      `/coupons/invalidate/${id}`,
    );
    return data;
  },

  async sendReceivedEmail(id: number): Promise<ApiResponse<unknown>> {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/coupons/${id}/send-received-email`,
    );
    return data;
  },
};
