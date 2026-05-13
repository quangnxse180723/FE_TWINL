export type Role = 'ADMIN' | 'USER' | 'STAFF'

export interface AuthUser {
  id: number
  displayName: string
  email: string
  roles: Role[]
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
}
