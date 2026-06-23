export interface AdminProduct {
  id: number
  sellerId?: number | null
  sellerName?: string | null
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
  conditionPercentage?: number | null
  length?: number | null
  shoulder?: number | null
  chest?: number | null
  waist?: number | null
  defects?: string[] | null
  createdAt?: string
  updatedAt?: string
}

export interface AdminOrderItem {
  productId: number | null
  productName: string | null
  imageUrl?: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface AdminOrder {
  id: number
  code: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  shippingAddress?: string | null
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELED'
  totalAmount: number
  paymentMethod?: string | null
  paymentStatus?: string | null
  shipperId?: number | null
  shipperName?: string | null
  deliveredAt?: string | null
  note?: string | null
  items: AdminOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface AdminOrderPage {
  content: AdminOrder[]
  totalElements: number
  totalPages: number
  size: number
  number: number
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
  conditionPercentage?: number
  length?: number | null
  shoulder?: number | null
  chest?: number | null
  waist?: number | null
  defects?: string[]
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
  role: 'USER' | 'STAFF' | 'SHIPPER'
  phone?: string | null
  address?: string | null
  gender?: string | null
  dateOfBirth?: string | null
}

export interface AdminUserUpdatePayload {
  displayName?: string | null
  role?: 'USER' | 'STAFF' | 'SHIPPER'
  phone?: string | null
  address?: string | null
  gender?: string | null
  dateOfBirth?: string | null
}

export interface AdminUserStatusPayload {
  active: boolean
}
