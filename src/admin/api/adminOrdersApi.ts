import { axiosClient } from '../../api/axiosClient'

export interface AdminOrderItem {
  productId: number | null
  productName: string | null
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
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
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

export const adminOrdersApi = {
  list: async (page = 0, sizePage = 12) => {
    const { data } = await axiosClient.get<AdminOrderPage>('/api/admin/orders', {
      params: { page, sizePage },
    })
    return data
  },
}
