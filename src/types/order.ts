export type OrderStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELED'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface OrderItem {
  productId: number | null
  productName: string | null
  imageUrl?: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: number
  code: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  shippingAddress?: string | null
  shippingWardCode?: string | null
  shippingDistrictId?: number | null
  shippingProvinceId?: number | null
  status: OrderStatus
  totalAmount: number
  paymentMethod?: string | null
  paymentStatus?: PaymentStatus | null
  // In-house Shipper fields
  shipperId?: number | null
  shipperName?: string | null
  deliveredAt?: string | null
  note?: string | null
  platformFee?: number | null
  sellerAmount?: number | null
  escrowStatus?: string | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderPage {
  content: Order[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
