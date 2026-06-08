import { axiosClient } from '../axiosClient';
import type { ProductResponse } from '../../types/product';
import type { Order } from '../../types/order';

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const sellerApi = {
  getMyProducts: (page = 0, size = 10) => {
    return axiosClient.get<PaginatedResponse<ProductResponse>>('/api/v1/seller/products', {
      params: { page, sizePage: size },
    });
  },

  createProduct: (data: any) => {
    return axiosClient.post<ProductResponse>('/api/v1/seller/products', data);
  },

  getMyOrders: (page = 0, size = 10) => {
    return axiosClient.get<PaginatedResponse<Order>>('/api/v1/seller/orders', {
      params: { page, sizePage: size },
    });
  },

  getStatistics: () => {
    return axiosClient.get<any>('/api/v1/seller/statistics');
  },

  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await axiosClient.post<string[]>('/api/products/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
