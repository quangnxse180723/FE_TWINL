import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import vnpayApi from '../../api/payment/vnpayApi'
import { PATHS } from '../../routes/paths'
import '../../styles/pages/payment-return.css'

export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'success' | 'failed' | 'loading'>('loading')

  const params = useMemo(() => {
    const entries: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      entries[key] = value
    })
    return entries
  }, [searchParams])

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await vnpayApi.handleReturn(params)
        setMessage(response.data.message)
        setStatus(response.data.paymentStatus === 'SUCCESS' ? 'success' : 'failed')
      } catch (error) {
        setMessage('Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.')
        setStatus('failed')
      }
    }

    if (Object.keys(params).length === 0) {
      setMessage('Thiếu thông tin thanh toán.')
      setStatus('failed')
      return
    }

    verifyPayment()
  }, [params])

  return (
    <section className="payment-return">
      <div className="payment-return__card">
        {status === 'loading' ? (
          <p className="payment-return__loading">Đang xác nhận thanh toán...</p>
        ) : (
          <>
            <h1 className={status === 'success' ? 'payment-return__title success' : 'payment-return__title failed'}>
              {status === 'success' ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
            </h1>
            <p className="payment-return__message">{message}</p>
            <div className="payment-return__actions">
              <Link className="payment-return__button" to={PATHS.cart}>Quay lại giỏ hàng</Link>
              <Link className="payment-return__button outline" to={PATHS.home}>Tiếp tục mua sắm</Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
