import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { authApi } from '../api/auth/authApi'
import { setCredentials } from '../store/slices/authSlice'
import { saveAuth } from '../utils/authStorage'
import type { LoginRequest, RegisterRequest } from '../types/auth'

export const useLoginMutation = () => {
  const dispatch = useDispatch()
  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      saveAuth(data)
      dispatch(setCredentials(data))
    },
  })
}

export const useRegisterMutation = () => {
  const dispatch = useDispatch()
  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: (data) => {
      saveAuth(data)
      dispatch(setCredentials(data))
    },
  })
}

export const useSendOtpMutation = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.sendOtp(email),
  })
}

export const useGoogleLoginMutation = () => {
  const dispatch = useDispatch()
  return useMutation({
    mutationFn: (idToken: string) => authApi.googleLogin(idToken),
    onSuccess: (data) => {
      saveAuth(data)
      dispatch(setCredentials(data))
    },
  })
}

export const useSendForgotPasswordOtpMutation = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.sendForgotPasswordOtp(email),
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: { email: string; otp: string; newPassword: string }) => authApi.resetPassword(payload),
  })
}
