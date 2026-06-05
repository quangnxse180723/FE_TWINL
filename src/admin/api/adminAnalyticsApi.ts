import { axiosClient } from '../../api/axiosClient'

export interface AccessLog {
  id: number
  ipAddress: string
  userAgent: string
  device: string
  location: string
  status: string
  userId: number | null
  userName: string
  userRole: string
  createdAt: string
}

export interface AnalyticsOverview {
  totalVisits: number
  activeUsers: number
  bounceRate: string
  newSignups: number
}

export const adminAnalyticsApi = {
  getOverview: (startDate?: string, endDate?: string) => {
    return axiosClient.get<AnalyticsOverview>('/api/v1/analytics/overview', { params: { startDate, endDate } })
  },
  getTrafficChart: (startDate?: string, endDate?: string) => {
    return axiosClient.get<Array<{ name: string; uv: number }>>('/api/v1/analytics/traffic-chart', { params: { startDate, endDate } })
  },
  getTopSources: (startDate?: string, endDate?: string) => {
    return axiosClient.get<Array<{ label: string; val: string; color: string }>>('/api/v1/analytics/top-sources', { params: { startDate, endDate } })
  },
  getAccessLogs: (startDate?: string, endDate?: string, userType?: string) => {
    return axiosClient.get<AccessLog[]>('/api/v1/analytics/access-logs', { params: { startDate, endDate, userType } })
  },
  trackVisit: () => {
    return axiosClient.post('/api/v1/analytics/track')
  },
  getOnlineUsers: () => {
    return axiosClient.get<{ onlineUsers: number }>('/api/v1/business-analytics/online-users')
  },
}
