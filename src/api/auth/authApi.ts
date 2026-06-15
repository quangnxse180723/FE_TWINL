import { axiosClient } from '../axiosClient'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types/auth'

export const authApi = {
  login: async (payload: LoginRequest) => {
    const { data } = await axiosClient.post<AuthResponse>('/api/auth/login', payload)
    return data
  },
  sendOtp: async (email: string) => {
    await axiosClient.post('/api/auth/send-otp', { email })
  },
  register: async (payload: RegisterRequest) => {
    const { data } = await axiosClient.post<AuthResponse>('/api/auth/register', payload)
    return data
  },
  logout: async () => {
    await axiosClient.post('/api/auth/logout')
  },
  googleLogin: async (idToken: string) => {
    const { data } = await axiosClient.post<AuthResponse>('/api/auth/google', { idToken })
    return data
  },
  sendForgotPasswordOtp: async (email: string) => {
    await axiosClient.post('/api/auth/forgot-password/send-otp', { email })
  },
  resetPassword: async (payload: { email: string; otp: string; newPassword: string }) => {
    await axiosClient.post('/api/auth/forgot-password/reset', payload)
  },
}
