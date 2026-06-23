import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import { notificationApi } from '../../api/notifications/notificationApi';
import type { NotificationResponse } from '../../types/notification';
import type { RootState } from '../../store';
import { API_BASE_URL } from '../../config/constants';
import { PATHS } from '../../routes/paths';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!token || !user) return;

    // Fetch initial data
    const fetchInitData = async () => {
      try {
        const [notifsRes, countRes] = await Promise.all([
          notificationApi.getNotifications(),
          notificationApi.getUnreadCount(),
        ]);
        setNotifications(notifsRes.data);
        setUnreadCount(countRes.data);
      } catch (error) {
        console.error('Lỗi khi fetch thông báo:', error);
      }
    };

    fetchInitData();

    // Setup SSE
    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream?token=${token}`);

    eventSource.addEventListener('notification', (event) => {
      try {
        const newNotification: NotificationResponse = JSON.parse(event.data);
        
        // Cập nhật state
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Toast
        toast.info(newNotification.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error('Lỗi parse SSE notification:', error);
      }
    });

    eventSource.addEventListener('init', (event) => {
      console.log('SSE connected:', event.data);
    });

    eventSource.onerror = () => {
      // Tự động đóng nếu lỗi (tránh retry liên tục gây treo web)
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [token, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    await handleMarkAsRead(notification.id, notification.isRead);
    setIsOpen(false);
    
    if (notification.type === 'NEW_PRODUCT_PENDING') {
      navigate(PATHS.adminProducts);
    } else if (notification.type === 'NEW_ORDER_PAID') {
      navigate(PATHS.adminOrders);
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

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 m-0 text-base">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {unreadCount} mới
              </span>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-blue-900'}`}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-400 mt-2 block">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="mx-auto text-gray-300 mb-2" size={32} />
                <p>Bạn không có thông báo nào</p>
              </div>
            )}
          </div>
          
          <div className="p-3 text-center border-t border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-sm font-medium text-blue-600">Xem tất cả</span>
          </div>
        </div>
      )}
    </div>
  );
}
