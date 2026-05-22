import { axiosClient } from '../axiosClient'
import type { Order, OrderPage } from '../../types/order'

const orderApi = {
  list: (page = 0, sizePage = 10) =>
    axiosClient.get<OrderPage>('/api/orders', { params: { page, sizePage } }),
  getByCode: (code: string) => axiosClient.get<Order>(`/api/orders/${code}`),
}

export default orderApi
