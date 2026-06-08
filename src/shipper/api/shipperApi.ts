import { axiosClient } from '../../api/axiosClient'
import type { AdminOrder, AdminOrderPage } from '../../admin/types'

export type ShipperOrderStatus = 'PICKED_UP' | 'DELIVERED'

export const shipperApi = {
  getMyOrders: async (page = 0, sizePage = 12) => {
    const { data } = await axiosClient.get<AdminOrderPage>('/api/v1/shipper/orders', {
      params: { page, sizePage },
    })
    return data
  },

  updateStatus: async (orderId: number, status: ShipperOrderStatus, note?: string) => {
    const { data } = await axiosClient.put<AdminOrder>(
      `/api/v1/shipper/orders/${orderId}/status`,
      { status, note },
    )
    return data
  },
}
