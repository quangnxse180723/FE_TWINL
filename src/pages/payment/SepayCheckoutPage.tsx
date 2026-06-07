import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PATHS } from '../../routes/paths'
import '../../styles/pages/payment-return.css'

export default function SepayCheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const qrUrl = location.state?.qrUrl

  useEffect(() => {
    if (!qrUrl) {
      navigate(PATHS.home)
    }
  }, [qrUrl, navigate])

  if (!qrUrl) return null

  return (
    <div className="payment-return__container">
      <div className="payment-return__card" style={{ maxWidth: '500px' }}>
        <div className="payment-return__header">
          <div className="payment-return__icon payment-return__icon--success">
            ✓
          </div>
          <h2 className="payment-return__title">Thanh toán Đơn hàng</h2>
          <p className="payment-return__desc">
            Vui lòng sử dụng App Ngân hàng của bạn để quét mã QR dưới đây.
          </p>
        </div>

        <div className="payment-return__details" style={{ textAlign: 'center', background: '#fff', padding: '20px', borderRadius: '12px' }}>
          <img src={qrUrl} alt="VietQR" style={{ width: '100%', maxWidth: '350px', height: 'auto', borderRadius: '8px' }} />
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            Hệ thống sẽ tự động cập nhật đơn hàng sau khi nhận được thanh toán thành công.
          </p>
        </div>

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
