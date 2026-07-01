import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../api/notifications/notificationApi';
import type { NotificationResponse } from '../../types/notification';
import type { RootState } from '../../store';
import { PATHS } from '../../routes/paths';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user) {
      navigate(PATHS.login);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await notificationApi.getNotifications();
        setNotifications(res.data);
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, navigate]);

  const handleMarkAsRead = async (id: number, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    await handleMarkAsRead(notification.id, notification.isRead);
    
    if (notification.type === 'NEW_PRODUCT_PENDING') {
      navigate(PATHS.adminProducts);
    } else if (notification.type === 'NEW_ORDER_PAID') {
      navigate(PATHS.adminOrders);
    } else if (notification.type === 'ORDER_STATUS') {
      const match = notification.title.match(/TWINL\d+/);
      if (match) {
        navigate(PATHS.orderTracking.replace(':code', match[0]));
      } else {
        navigate(PATHS.orders);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const hasUnread = notifications.some(n => !n.isRead);
    if (!hasUnread) return;
    
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[50vh] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[70vh]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="text-blue-600" size={28} />
          Tất cả thông báo
        </h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-5 cursor-pointer transition-colors hover:bg-gray-50 flex items-start gap-4 ${
                  notification.isRead ? 'bg-white' : 'bg-blue-50/30'
                }`}
              >
                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                  <Bell size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500">
            <Bell className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Không có thông báo nào</h3>
            <p className="text-gray-500">Bạn đã xem hết tất cả các thông báo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
