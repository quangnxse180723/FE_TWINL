import { axiosClient } from '../../api/axiosClient'
import type { AdminOrder, AdminOrderPage } from '../types'

export const adminOrdersApi = {
  list: async (page = 0, sizePage = 12) => {
    const { data } = await axiosClient.get<AdminOrderPage>('/api/admin/orders', {
      params: { page, sizePage },
    })
    return data
  },

  assign: async (orderId: number, shipperId: number) => {
    const { data } = await axiosClient.post<AdminOrder>(`/api/v1/orders/${orderId}/assign`, {
      orderId,
      shipperId,
    })
    return data
  },
}
