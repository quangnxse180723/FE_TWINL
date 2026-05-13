import { axiosClient } from '../axiosClient'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types/auth'

export const authApi = {
  login: async (payload: LoginRequest) => {
    const { data } = await axiosClient.post<AuthResponse>('/api/auth/login', payload)
    return data
  },
  register: async (payload: RegisterRequest) => {
    const { data } = await axiosClient.post<AuthResponse>('/api/auth/register', payload)
    return data
  },
  logout: async () => {
    await axiosClient.post('/api/auth/logout')
  },
}
