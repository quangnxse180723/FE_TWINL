import { axiosClient } from '../../api/axiosClient'
import type { AdminOrderPage } from '../../admin/types'

export const staffOrdersApi = {
  list: async (page = 0, sizePage = 12) => {
    const { data } = await axiosClient.get<AdminOrderPage>('/api/staff/orders', {
      params: { page, sizePage },
    })
    return data
  },
}
