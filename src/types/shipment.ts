export type ShipmentStatus = 'PENDING' | 'CREATED' | 'PICKING' | 'SHIPPING' | 'DELIVERED' | 'FAILED' | 'CANCELLED'

export interface ShipmentResponse {
  id: number
  orderId: number
  provider: string
  trackingCode?: string | null
  shippingFee?: number | null
  status: ShipmentStatus
}
