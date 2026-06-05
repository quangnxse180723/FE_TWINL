import { axiosClient } from '../axiosClient';
import type { NotificationResponse } from '../../types/notification';

export const notificationApi = {
  getNotifications: () => axiosClient.get<NotificationResponse[]>('/api/v1/notifications'),
  getUnreadCount: () => axiosClient.get<number>('/api/v1/notifications/unread-count'),
  markAsRead: (id: number) => axiosClient.put<void>(`/api/v1/notifications/${id}/read`),
};
