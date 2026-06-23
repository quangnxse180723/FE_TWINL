import { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PATHS } from '../../routes/paths'
import orderApi from '../../api/orders/orderApi'
import '../../styles/pages/payment-return.css'

export default function SepayCheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const qrUrl = location.state?.qrUrl
  const orderCode = location.state?.orderCode
  const [isSuccess, setIsSuccess] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const [successCountdown, setSuccessCountdown] = useState(5)

  useEffect(() => {
    if (!qrUrl || !orderCode) {
      navigate(PATHS.home)
    }
  }, [qrUrl, orderCode, navigate])

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0 || isSuccess) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isSuccess])

  useEffect(() => {
    if (!orderCode || isSuccess || timeLeft === 0) return

    const checkOrderStatus = async () => {
      try {
        const response = await orderApi.getByCode(orderCode)
        const paymentStatus = response.data.paymentStatus
        if (paymentStatus === 'SUCCESS') {
          setIsSuccess(true)
        }
      } catch (err) {
        console.error('Failed to check order status', err)
      }
    }

    // Kiểm tra mỗi 3 giây
    const intervalId = setInterval(checkOrderStatus, 3000)
    return () => clearInterval(intervalId)
  }, [orderCode, isSuccess, timeLeft])

  // Tự động đếm ngược và chuyển hướng sau khi thành công
  useEffect(() => {
    if (isSuccess && successCountdown > 0) {
      const timer = setInterval(() => {
        setSuccessCountdown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (isSuccess && successCountdown === 0) {
      navigate(PATHS.orders)
    }
  }, [isSuccess, successCountdown, navigate])

  const urlObj = qrUrl ? new URL(qrUrl) : null
  const bank = urlObj?.searchParams.get('bank') || 'MBBank'
  const acc = urlObj?.searchParams.get('acc') || '0853443242'
  const accountName = urlObj?.searchParams.get('accountName') || 'NGUYEN XUAN QUANG'
  const amount = urlObj?.searchParams.get('amount') || ''
  const des = urlObj?.searchParams.get('des') || orderCode

  if (!qrUrl) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#f8fafc', padding: '40px 24px', fontFamily: 'Inter, sans-serif' }}>
      
      {!isSuccess && timeLeft > 0 && (
        <div style={{ display: 'flex', maxWidth: '1000px', width: '100%', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ flex: '1 1 50%', padding: '32px', position: 'relative' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>Thanh toán Đơn hàng</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#fef2f2', color: '#ef4444', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {timeString}
              </div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.4', marginBottom: '20px' }}>
              Vui lòng sử dụng App Ngân hàng của bạn để quét mã QR bên cạnh để hoàn tất thanh toán an toàn.
            </p>

            {/* Info Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', color: '#047857', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v3"></path><path d="M12 14v3"></path><path d="M16 14v3"></path></svg>
              THÔNG TIN CHUYỂN KHOẢN
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Bank */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' }}>NGÂN HÀNG</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{bank}</div>
                </div>
                <button onClick={() => handleCopy(bank, 'bank')} style={{ width: '28px', height: '28px', background: '#047857', border: 'none', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {copiedField === 'bank' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Account Name */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' }}>CHỦ TÀI KHOẢN</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{accountName}</div>
                </div>
                <button onClick={() => handleCopy(accountName, 'name')} style={{ width: '28px', height: '28px', background: '#047857', border: 'none', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {copiedField === 'name' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Account Number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' }}>SỐ TÀI KHOẢN</div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#047857' }}>{acc}</div>
                </div>
                <button onClick={() => handleCopy(acc, 'acc')} style={{ width: '28px', height: '28px', background: '#047857', border: 'none', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {copiedField === 'acc' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' }}>SỐ TIỀN</div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#111827' }}>{amount ? `${new Intl.NumberFormat('vi-VN').format(Number(amount))} đ` : '...'}</div>
                </div>
                <button onClick={() => handleCopy(amount, 'amount')} style={{ width: '28px', height: '28px', background: '#047857', border: 'none', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {copiedField === 'amount' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f4f6', padding: '8px 12px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' }}>NỘI DUNG CHUYỂN KHOẢN</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{des}</div>
                </div>
                <button onClick={() => handleCopy(des, 'des')} style={{ width: '28px', height: '28px', background: '#047857', border: 'none', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {copiedField === 'des' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Secure Info */}
            <div style={{ marginTop: '20px', padding: '12px', background: '#e0f2fe', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ color: '#0369a1', marginTop: '2px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
              </div>
              <div>
                <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>Bảo vệ an toàn</div>
                <div style={{ color: '#0284c7', fontSize: '12px', lineHeight: '1.4' }}>Tiền của bạn được giữ an toàn cho đến khi bạn xác nhận nhận hàng thành công.</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: '1 1 50%', background: '#f8fafc', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px dashed #cbd5e1' }}>
            
            <div style={{ background: '#fff', padding: '12px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
              <img src={qrUrl} alt="QR Code" style={{ display: 'block', width: '200px', height: '200px', borderRadius: '10px' }} />
            </div>

            <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Thanh toán bảo mật
            </div>

            <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', lineHeight: '1.5', maxWidth: '280px', marginBottom: '24px' }}>
              Quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử để thanh toán nhanh chóng.
            </p>

            <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => navigate(PATHS.orders)} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                Quản lý Đơn hàng
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
              <button onClick={() => navigate(PATHS.home)} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', fontSize: '14px', fontWeight: '500', color: '#6b7280', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Về Trang chủ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {!isSuccess && timeLeft === 0 && (
        <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Mã thanh toán đã hết hạn</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Đơn hàng đã quá thời gian thanh toán. Vui lòng tạo đơn hàng mới.</p>
          <button onClick={() => navigate(PATHS.home)} style={{ padding: '12px 24px', background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Về trang chủ</button>
        </div>
      )}

      {/* SUCCESS STATE POPUP OVERLAY */}
      {isSuccess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
              Thanh toán Thành công!
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.5' }}>
              Đơn hàng của bạn đã được thanh toán và đang được xử lý.
            </p>
            <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '12px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
              Tự động chuyển trang sau <span style={{ color: '#047857', fontWeight: '700', fontSize: '16px' }}>{successCountdown}</span> giây...
            </div>
            <button onClick={() => navigate(PATHS.orders)} style={{ marginTop: '24px', width: '100%', padding: '14px', background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Đến Đơn hàng ngay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
