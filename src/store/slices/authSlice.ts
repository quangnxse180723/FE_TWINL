import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthResponse, AuthUser } from '../../types/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user
      state.token = action.payload.accessToken
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer
