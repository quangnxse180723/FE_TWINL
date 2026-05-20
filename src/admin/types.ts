export interface AdminProduct {
  id: number
  name: string
  description?: string | null
  price: number
  categoryId?: number | null
  category?: string | null
  brand: string
  gender?: string | null
  imageUrls?: string[]
  status?: string | null
  style?: string | null
  stock: number
  sizes?: string[]
  colorIds?: number[]
  colors?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface AdminProductPage {
  content: AdminProduct[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface AdminProductPayload {
  name: string
  description?: string | null
  price: number
  categoryId: number
  brand: string
  gender?: string | null
  imageUrls?: string[]
  status?: string | null
  style?: string | null
  stock: number
  sizes?: string[]
  colorIds?: number[]
}

export interface AdminUser {
  id: number
  displayName: string
  email: string
  roles: string[]
  avatarUrl?: string | null
  phone?: string | null
  address?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  active?: boolean | null
}

export interface AdminUserCreatePayload {
  displayName: string
  email: string
  password: string
  role: 'USER' | 'STAFF'
  phone?: string | null
  address?: string | null
  gender?: string | null
  dateOfBirth?: string | null
}

export interface AdminUserUpdatePayload {
  displayName?: string | null
  role?: 'USER' | 'STAFF'
  phone?: string | null
  address?: string | null
  gender?: string | null
  dateOfBirth?: string | null
}

export interface AdminUserStatusPayload {
  active: boolean
}
