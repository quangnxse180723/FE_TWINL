export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface OrderItem {
  productId: number | null
  productName: string | null
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
  status: OrderStatus
  totalAmount: number
  paymentMethod?: string | null
  paymentStatus?: PaymentStatus | null
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
