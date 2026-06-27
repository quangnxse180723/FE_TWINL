import { useEffect, useRef } from 'react'
import { adminAnalyticsApi } from '../admin/api/adminAnalyticsApi'

export function useActiveTimer() {
  const logIdRef = useRef<number | null>(null)
  const isTrackingRef = useRef(false)
  const lastActiveRef = useRef<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 1. Initial track visit when app loads
    const startTracking = async () => {
      try {
        const res = await adminAnalyticsApi.trackVisit()
        if (res.data && res.data.id) {
          logIdRef.current = res.data.id
          isTrackingRef.current = true
        }
      } catch (error) {
        console.error('Failed to track visit', error)
      }
    }

    startTracking()

    // 2. Setup activity listeners
    const handleActivity = () => {
      lastActiveRef.current = Date.now()
    }

    // Attach listeners for common user interactions
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    // 3. Setup heartbeat interval (every 15 seconds)
    intervalRef.current = setInterval(() => {
      if (!isTrackingRef.current || !logIdRef.current) return

      const timeSinceLastActive = Date.now() - lastActiveRef.current
      
      // If user has been inactive for more than 30 seconds, don't ping
      if (timeSinceLastActive < 30000) {
        adminAnalyticsApi.pingActiveTime(logIdRef.current).catch(err => {
          console.error('Failed to ping active time', err)
        })
      }
    }, 15000)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}
