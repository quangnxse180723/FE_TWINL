import { axiosClient } from './axiosClient'

export interface OutfitSetItem {
  id: number
  productId: number
  productName: string
  productBrand: string
  productPrice: number
  productImageUrl?: string
  productStatus: string
  productStock: number
  role?: string
  displayOrder: number
}

export interface OutfitSet {
  id: number
  name: string
  description?: string
  coverImageUrl?: string
  styleTag?: string
  discountTwoItems: number
  discountThresholdLow: number
  discountThresholdHigh: number
  discountPriceThreshold: number
  active: boolean
  itemCount: number
  totalPrice: number
  createdAt: string
  items: OutfitSetItem[]
}

export interface OutfitSetRequest {
  name: string
  description?: string
  coverImageUrl?: string
  styleTag?: string
  discountTwoItems?: number
  discountThresholdLow?: number
  discountThresholdHigh?: number
  active?: boolean
  items: { productId: number; role?: string; displayOrder?: number }[]
}

const outfitSetsApi = {
  getAll: () => axiosClient.get<OutfitSet[]>('/api/outfit-sets'),
  getById: (id: number) => axiosClient.get<OutfitSet>(`/api/outfit-sets/${id}`),
  // Admin
  adminGetAll: () => axiosClient.get<OutfitSet[]>('/api/outfit-sets/admin/all'),
  create: (data: OutfitSetRequest) => axiosClient.post<OutfitSet>('/api/outfit-sets', data),
  update: (id: number, data: OutfitSetRequest) => axiosClient.put<OutfitSet>(`/api/outfit-sets/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/api/outfit-sets/${id}`),
  toggleActive: (id: number) => axiosClient.patch<OutfitSet>(`/api/outfit-sets/${id}/toggle`),
}

export default outfitSetsApi
