import { axiosClient } from '../../api/axiosClient'

export interface DashboardResponse {
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  totalOrders: number
  topProducts: { productId: number; productName: string; totalSold: number }[]
  recentOrders: {
    id: number
    code: string
    customerName: string
    totalAmount: number
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
    createdAt: string
  }[]
}

export const adminDashboardApi = {
  get: async () => {
    const { data } = await axiosClient.get<DashboardResponse>('/api/admin/dashboard')
    return data
  },
}
