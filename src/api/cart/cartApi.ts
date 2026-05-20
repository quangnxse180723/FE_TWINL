import { axiosClient } from '../axiosClient'
import type { AddCartItemRequest, CartResponse, UpdateCartItemRequest } from '../../types/cart'

const cartApi = {
  getCart: () => axiosClient.get<CartResponse>('/api/cart'),
  addItem: (payload: AddCartItemRequest) => axiosClient.post<CartResponse>('/api/cart/items', payload),
  updateItem: (itemId: number, payload: UpdateCartItemRequest) =>
    axiosClient.put<CartResponse>(`/api/cart/items/${itemId}`, payload),
  removeItem: (itemId: number) => axiosClient.delete<CartResponse>(`/api/cart/items/${itemId}`),
  clearCart: () => axiosClient.delete<CartResponse>('/api/cart'),
}

export default cartApi
