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

  // Tự động chuyển hướng sau khi thành công
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate(PATHS.orders)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate])

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
    <div className="payment-return">
      <div className="payment-return__card" style={{ maxWidth: '750px', width: '100%' }}>
        <div className="payment-return__header">
          <div className="payment-return__icon payment-return__icon--success">
            {isSuccess ? '✓' : (timeLeft === 0 ? '✕' : '⏳')}
          </div>
          <h2 className="payment-return__title">
            {isSuccess ? 'Thanh toán Thành công!' : (timeLeft === 0 ? 'Mã thanh toán đã hết hạn' : 'Thanh toán Đơn hàng')}
          </h2>
          <p className="payment-return__desc">
            {isSuccess
              ? 'Cảm ơn bạn! Đơn hàng của bạn đã được thanh toán và đang được xử lý.'
              : (timeLeft === 0 ? 'Đơn hàng đã quá thời gian thanh toán. Vui lòng tạo đơn hàng mới.' : 'Vui lòng sử dụng App Ngân hàng của bạn để quét mã QR dưới đây.')}
          </p>
          {!isSuccess && timeLeft > 0 && (
            <div style={{ marginTop: '12px', fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>
              Thời gian còn lại: {timeString}
            </div>
          )}
        </div>

        {!isSuccess && timeLeft > 0 && (
          <div className="payment-return__details" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', background: '#fff', padding: '24px', borderRadius: '12px', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Cột trái: Thông tin chuyển khoản */}
            <div style={{ flex: '1 1 320px', textAlign: 'left', background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                Thông tin chuyển khoản
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Ngân hàng:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#111827' }}>{bank}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Chủ tài khoản:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#111827' }}>{accountName.toUpperCase()}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Số tài khoản:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#0f7d3c', fontSize: '16px' }}>{acc}</strong>
                    <button 
                      onClick={() => handleCopy(acc, 'acc')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'acc' ? '#0f7d3c' : '#6b7280', padding: '4px' }}
                      title="Sao chép"
                    >
                      {copiedField === 'acc' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Số tiền:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#111827', fontSize: '16px' }}>
                      {amount ? `${new Intl.NumberFormat('vi-VN').format(Number(amount))} đ` : '...'}
                    </strong>
                    <button 
                      onClick={() => handleCopy(amount, 'amount')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'amount' ? '#0f7d3c' : '#6b7280', padding: '4px' }}
                      title="Sao chép"
                    >
                      {copiedField === 'amount' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Nội dung CK:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#111827', fontSize: '13px' }}>{des}</strong>
                    <button 
                      onClick={() => handleCopy(des, 'des')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'des' ? '#0f7d3c' : '#6b7280', padding: '4px' }}
                      title="Sao chép"
                    >
                      {copiedField === 'des' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '12px', background: '#fff3cd', borderRadius: '8px', color: '#856404', fontSize: '13px', lineHeight: '1.5' }}>
                <strong>Lưu ý:</strong> Vui lòng nhập chính xác số tiền và nội dung chuyển khoản để hệ thống tự động xác nhận đơn hàng.
              </div>
            </div>

            {/* Cột phải: Mã QR */}
            <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={qrUrl} 
                alt="VietQR" 
                style={{ display: 'block', width: '100%', maxWidth: '280px', height: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
              />
              <p style={{ marginTop: '16px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                Quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử.
              </p>
            </div>
            
          </div>
        )}

        <div className="payment-return__actions">
          <button
            className="payment-return__btn payment-return__btn--primary"
            onClick={() => navigate(PATHS.orders)}
          >
            Quản lý Đơn hàng
          </button>
          <button
            className="payment-return__btn payment-return__btn--secondary"
            onClick={() => navigate(PATHS.home)}
          >
            Về Trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}
