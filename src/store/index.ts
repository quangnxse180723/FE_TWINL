import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { loadAuth } from '../utils/authStorage'

const persistedAuth = loadAuth()

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: persistedAuth
      ? { user: persistedAuth.user, token: persistedAuth.accessToken }
      : { user: null, token: null },
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
