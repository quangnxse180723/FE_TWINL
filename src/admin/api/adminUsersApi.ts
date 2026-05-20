import { axiosClient } from '../../api/axiosClient'
import type { AdminUser, AdminUserCreatePayload, AdminUserStatusPayload, AdminUserUpdatePayload } from '../types'

export const adminUsersApi = {
  list: async () => {
    const { data } = await axiosClient.get<AdminUser[]>('/api/users')
    return data
  },
  create: async (payload: AdminUserCreatePayload) => {
    const { data } = await axiosClient.post<AdminUser>('/api/users', payload)
    return data
  },
  update: async (id: number, payload: AdminUserUpdatePayload) => {
    const { data } = await axiosClient.put<AdminUser>(`/api/users/${id}`, payload)
    return data
  },
  updateStatus: async (id: number, payload: AdminUserStatusPayload) => {
    const { data } = await axiosClient.patch<AdminUser>(`/api/users/${id}/status`, payload)
    return data
  },
}
