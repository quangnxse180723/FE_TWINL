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
  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
  })
}
