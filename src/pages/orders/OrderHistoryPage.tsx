import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import orderApi from '../../api/orders/orderApi'
import { PATHS } from '../../routes/paths'
import type { OrderPage } from '../../types/order'
import '../../styles/pages/orders.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('vi-VN')
}

export default function OrderHistoryPage() {
  const [page, setPage] = useState(0)
  const [sizePage] = useState(10)
  const [data, setData] = useState<OrderPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await orderApi.list(page, sizePage)
        setData(response.data)
      } catch {
        setError('Không thể tải lịch sử đơn hàng.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [page, sizePage])

  return (
    <section className="orders">
      <div className="orders__header">
        <div>
          <p className="orders__eyebrow">Tài khoản</p>
          <h1>Lịch sử đơn hàng</h1>
        </div>
        <Link className="orders__back" to={PATHS.profile}>Quay lại hồ sơ</Link>
      </div>

      <div className="orders__panel">
        {loading ? (
          <div className="orders__state">Đang tải đơn hàng...</div>
        ) : error ? (
          <div className="orders__state orders__state--error">{error}</div>
        ) : data?.content?.length ? (
          <>
            <table className="orders__table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((order) => (
                  <tr key={order.id}>
                    <td>{order.code}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <span className={`orders__status orders__status--${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link className="orders__link" to={PATHS.orderTracking.replace(':code', order.code)}>
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="orders__pagination">
              <button type="button" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
                Trước
              </button>
              <span>Trang {data.number + 1} / {data.totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((prev) => (prev + 1 < data.totalPages ? prev + 1 : prev))}
                disabled={page + 1 >= data.totalPages}
              >
                Sau
              </button>
            </div>
          </>
        ) : (
          <div className="orders__state">Chưa có đơn hàng.</div>
        )}
      </div>
    </section>
  )
}
