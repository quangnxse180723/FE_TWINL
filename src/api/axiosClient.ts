import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { getAccessToken, clearAuth } from '../utils/authStorage';
import { PATHS } from '../routes/paths';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token vào mỗi request
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Bắt 401 (token hết hạn) → xóa auth + redirect về trang login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      // Dispatch logout action thông qua Redux store nếu có
      try {
        // Dùng dynamic import để tránh circular dependency
        import('../store').then(({ store }) => {
          import('../store/slices/authSlice').then(({ logout }) => {
            store.dispatch(logout());
          });
        });
      } catch {
        // ignore
      }

      // Redirect về trang đăng nhập (chỉ redirect nếu chưa ở trang login)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = PATHS.login;
      }
    }
    return Promise.reject(error);
  }
);
