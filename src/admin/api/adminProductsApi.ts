import { axiosClient } from '../../api/axiosClient'
import type { AdminProduct, AdminProductPage, AdminProductPayload } from '../types'

export interface AdminProductQuery {
  search?: string
  category?: string
  brand?: string
  gender?: string
  size?: string
  color?: string
  minPrice?: string
  maxPrice?: string
  inStock?: boolean
  status?: string
  page?: number
  sizePage?: number
}

export const adminProductsApi = {
  list: async (params: AdminProductQuery) => {
    const { data } = await axiosClient.get<AdminProductPage>('/api/products', { params })
    return data
  },
  getById: async (id: string | number) => {
    const { data } = await axiosClient.get<AdminProduct>(`/api/products/${id}`)
    return data
  },
  create: async (payload: AdminProductPayload) => {
    const { data } = await axiosClient.post<AdminProduct>('/api/products', payload)
    return data
  },
  update: async (id: string | number, payload: AdminProductPayload) => {
    const { data } = await axiosClient.put<AdminProduct>(`/api/products/${id}`, payload)
    return data
  },
  updateStatus: async (id: string | number, status: string) => {
    const { data } = await axiosClient.patch<AdminProduct>(`/api/products/${id}/status`, null, {
      params: { status }
    })
    return data
  },
  remove: async (id: string | number) => {
    await axiosClient.delete(`/api/products/${id}`)
  },
  uploadImages: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    const { data } = await axiosClient.post<string[]>('/api/products/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}
