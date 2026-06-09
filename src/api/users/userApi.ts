import { axiosClient } from '../axiosClient'
import type { UserProfile } from '../../types'

export interface UpdateProfilePayload {
  displayName?: string | null
  phone?: string | null
  address?: string | null
  wardCode?: string | null
  districtId?: number | null
  provinceId?: number | null
  gender?: string | null
  dateOfBirth?: string | null
}

export const userApi = {
  getMe: async () => {
    const { data } = await axiosClient.get<UserProfile>('/api/users/me')
    return data
  },
  updateMe: async (payload: UpdateProfilePayload) => {
    const { data } = await axiosClient.put<UserProfile>('/api/users/me', payload)
    return data
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await axiosClient.post<UserProfile>('/api/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
  changePassword: async (payload: { oldPassword: string; newPassword: string }) => {
    const { data } = await axiosClient.put('/api/users/me/password', payload)
    return data
  },
}
