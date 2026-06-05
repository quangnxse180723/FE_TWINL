import { axiosClient } from '../../api/axiosClient'

export interface BusinessDashboardData {
  metrics: {
    totalRevenue: number
    revenueTrend: string
    totalOrders: number
    ordersTrend: string
    ordersSuccess: number
    ordersShipping: number
    ordersPending: number
    ordersCancelled: number
    newUsers: number
    usersTrend: string
    newUsersToday: number
    activeProducts: number
  }
  finance: {
    escrowBalance: number
    platformCommission: number
    readyToPay: number
  }
  salesChart: Array<{ name: string; uv: number }>
  topCategories: Array<{ name: string; orders: number; percent: number }>
  shipping: {
    successRate: string
    avgDeliveryDays: string
    delayedOrdersCount: number
    returnedOrdersCount: number
  }
  attentionOrders: Array<{
    code: string
    customer: string
    issue: string
    shipper: string
    status: string
  }>
}

export const adminBusinessApi = {
  getDashboard: (startDate?: string, endDate?: string) => {
    return axiosClient.get<BusinessDashboardData>('/api/v1/business-analytics/dashboard', {
      params: { startDate, endDate },
    })
  },
}
