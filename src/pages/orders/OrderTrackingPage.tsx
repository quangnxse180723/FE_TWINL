import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import orderApi from '../../api/orders/orderApi'
import { PATHS } from '../../routes/paths'
import type { Order, OrderStatus } from '../../types/order'
import '../../styles/pages/orders.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('vi-VN')
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  ASSIGNED: 'Đã giao Shipper',
  PICKED_UP: 'Đang giao hàng',
  DELIVERED: 'Đã giao thành công',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã huỷ',
}

const statusSteps: OrderStatus[] = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'COMPLETED']

export default function OrderTrackingPage() {
  const { code } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      if (!code) return
      try {
        setLoading(true)
        setError('')
        const response = await orderApi.getByCode(code)
        setOrder(response.data)
      } catch {
        setError('Không thể tải thông tin đơn hàng.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [code])

  const activeIndex = useMemo(() => {
    if (!order) return 0
    const index = statusSteps.indexOf(order.status)
    return index === -1 ? 0 : index
  }, [order])

  return (
    <section className="orders">
      <div className="orders__header">
        <div>
          <p className="orders__eyebrow">Theo dõi đơn hàng</p>
          <h1>{order ? `Đơn ${order.code}` : 'Chi tiết đơn hàng'}</h1>
        </div>
        <Link className="orders__back" to={PATHS.orders}>Lịch sử đơn hàng</Link>
      </div>

      <div className="orders__panel">
        {loading ? (
          <div className="orders__state">Đang tải đơn hàng...</div>
        ) : error ? (
          <div className="orders__state orders__state--error">{error}</div>
        ) : order ? (
          <>
            <div className="orders__meta">
              <div>
                <span>Ngày đặt</span>
                <strong>{formatDateTime(order.createdAt)}</strong>
              </div>
              <div>
                <span>Tổng tiền</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{STATUS_LABELS[order.status] || order.status}</strong>
              </div>
              {order.paymentStatus ? (
                <div>
                  <span>Thanh toán</span>
                  <strong>{order.paymentStatus}</strong>
                </div>
              ) : null}
              {order.shipperName ? (
                <div>
                  <span>Shipper</span>
                  <strong>{order.shipperName}</strong>
                </div>
              ) : null}
              {order.deliveredAt ? (
                <div>
                  <span>Thời gian giao</span>
                  <strong>{formatDateTime(order.deliveredAt)}</strong>
                </div>
              ) : null}
              {order.note ? (
                <div>
                  <span>Ghi chú từ Shipper</span>
                  <strong>{order.note}</strong>
                </div>
              ) : null}
            </div>

            <div className="orders__timeline">
              {statusSteps.map((step, index) => (
                <div key={step} className={`orders__step ${index <= activeIndex ? 'is-active' : ''}`}>
                  <span>{STATUS_LABELS[step]}</span>
                </div>
              ))}
              {order.status === 'CANCELED' ? (
                <div className="orders__step orders__step--cancelled is-active">
                  <span>{STATUS_LABELS['CANCELED']}</span>
                </div>
              ) : null}
            </div>

            <div className="orders__items">
              <h3>Sản phẩm</h3>
              <div className="orders__items-grid">
                {order.items.map((item) => (
                  <div key={`${item.productId}-${item.productName}`} className="orders__item">
                    <div>
                      <strong>{item.productName ?? 'Sản phẩm'}</strong>
                      <p>Số lượng: {item.quantity}</p>
                    </div>
                    <div>
                      <span>{formatPrice(item.lineTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="orders__state">Không tìm thấy đơn hàng.</div>
        )}
      </div>
    </section>
  )
}
