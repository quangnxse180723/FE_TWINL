export type Role = 'ADMIN' | 'USER' | 'STAFF' | 'SHIPPER'

export interface AuthUser {
  id: number
  displayName: string
  email: string
  roles: Role[]
  avatarUrl?: string | null
  phone?: string | null
  address?: string | null
  wardCode?: string | null
  districtId?: number | null
  provinceId?: number | null
  gender?: string | null
  dateOfBirth?: string | null
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  displayName: string
  email: string
  password: string
  otp: string
}
