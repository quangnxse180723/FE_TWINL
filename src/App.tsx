import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppRoutes from './routes/AppRoutes'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import type { RootState } from './store'
import { logout } from './store/slices/authSlice'
import { clearAuth } from './utils/authStorage'
import { authApi } from './api/auth/authApi'
import { adminAnalyticsApi } from './admin/api/adminAnalyticsApi'

function App() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Track visit once per session load
    adminAnalyticsApi.trackVisit().catch(() => {})
  }, [])

  useEffect(() => {
    // Chỉ kích hoạt chức năng auto-logout khi người dùng đã đăng nhập
    if (!user) return

    const handleIdle = async () => {
      try {
        await authApi.logout()
      } catch (error) {
        // Ignored
      } finally {
        clearAuth()
        dispatch(logout())
        toast.info('Hết phiên đăng nhập, vui lòng đăng nhập lại.')
      }
    }

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // Set timeout 5 phút
      timeoutRef.current = setTimeout(handleIdle, 300000)
    }

    // Các sự kiện người dùng
    const events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'MSPointerDown', 'MSPointerMove']

    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    // Khởi tạo timer lần đầu tiên
    resetTimer()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [user, dispatch])

  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  )
}

export default App
