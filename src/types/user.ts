import type { Role } from './auth'

export interface UserProfile {
  id: number
  displayName: string
  email: string
  roles: Role[]
  avatarUrl: string | null
  phone: string | null
  address: string | null
  wardCode: string | null
  districtId: number | null
  provinceId: number | null
  gender: string | null
  dateOfBirth: string | null
}
