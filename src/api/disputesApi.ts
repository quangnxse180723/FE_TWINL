import { axiosClient } from './axiosClient'
import type { PaginatedResponse } from '../types/common'

export interface DisputeRequestPayload {
  reason: string
  description: string
  evidenceImages?: string[]
}

export interface DisputeResponse {
  id: number
  orderId: number
  orderCode: string
  requesterName: string
  requesterEmail: string
  reason: string
  description: string
  evidenceImages: string[]
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export const disputesApi = {
  createDispute: async (orderId: number, payload: DisputeRequestPayload) => {
    const { data } = await axiosClient.post<DisputeResponse>(`/api/orders/${orderId}/dispute`, payload)
    return data
  },
  
  getAdminDisputes: async (params?: { page?: number; size?: number; status?: string }) => {
    const { data } = await axiosClient.get<PaginatedResponse<DisputeResponse>>('/api/admin/disputes', { params })
    return data
  },

  getAdminDisputeById: async (id: number) => {
    const { data } = await axiosClient.get<DisputeResponse>(`/api/admin/disputes/${id}`)
    return data
  },

  resolveDispute: async (id: number, resolution: 'ACCEPT' | 'REJECT', note?: string) => {
    const { data } = await axiosClient.post<DisputeResponse>(`/api/admin/disputes/${id}/resolve`, null, {
      params: { resolution, note }
    })
    return data
  }
}
