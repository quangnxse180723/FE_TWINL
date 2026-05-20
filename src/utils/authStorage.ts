import type { AuthResponse } from '../types/auth'
import type { AuthUser } from '../types/auth'

const STORAGE_KEY = 'twinil_auth'

export const saveAuth = (auth: AuthResponse) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export const clearAuth = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export const loadAuth = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthResponse
  } catch {
    return null
  }
}

export const getAccessToken = () => loadAuth()?.accessToken ?? null

export const updateAuthUser = (user: AuthUser) => {
  const current = loadAuth()
  if (!current) return
  saveAuth({ ...current, user })
}
