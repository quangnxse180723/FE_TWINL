export interface CartItem {
  id: number
  productId: number
  productName: string
  imageUrl?: string | null
  availableStock?: number | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CartResponse {
  id: number
  userId: number
  items: CartItem[]
  totalQuantity: number
  subtotal: number
  createdAt: string
  updatedAt: string
}

export interface AddCartItemRequest {
  productId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}
