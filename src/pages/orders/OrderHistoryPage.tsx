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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  ASSIGNED: 'Đã giao Shipper',
  PICKED_UP: 'Đang giao hàng',
  DELIVERED: 'Đã giao thành công',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã huỷ',
  DISPUTED: 'Khiếu nại',
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

  const handleConfirmReceipt = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn đã nhận được hàng?')) return;
    try {
      await orderApi.confirmReceipt(id);
      alert('Xác nhận thành công!');
      window.location.reload();
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleReportMissing = async (id: number) => {
    const reason = window.prompt('Vui lòng nhập lý do (tùy chọn):');
    if (reason === null) return; // User cancelled prompt
    try {
      await orderApi.reportMissing(id, reason);
      alert('Đã gửi báo cáo khiếu nại!');
      window.location.reload();
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

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
          <div className="orders__history-list">
            {data.content.map((order) => (
              <div key={order.id} className="orders__history-card">
                <div className="orders__history-card-header">
                  <div>
                    <span className="orders__history-code">#{order.code}</span>
                    <span className="orders__history-date">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="orders__history-statuses">
                    <span className={`orders__status orders__status--${order.paymentStatus?.toLowerCase() || 'pending'}`}>
                      {order.paymentStatus === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                    <span className={`orders__status orders__status--${order.status.toLowerCase()}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>

                <div className="orders__history-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="orders__history-item">
                      <div className="orders__history-item-image">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName || 'Sản phẩm'} />
                        ) : (
                          <div className="orders__history-item-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="orders__history-item-info">
                        <h4>{item.productName}</h4>
                        <p>Số lượng: {item.quantity}</p>
                      </div>
                      <div className="orders__history-item-price">
                        {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="orders__history-card-footer">
                  <div className="orders__history-total">
                    Tổng tiền: <strong>{formatPrice(order.totalAmount)}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {order.status === 'DELIVERED' && (
                      <>
                        <button
                          type="button"
                          className="orders__history-btn"
                          style={{ backgroundColor: '#28a745', color: 'white', border: 'none' }}
                          onClick={() => handleConfirmReceipt(order.id)}
                        >
                          Đã nhận hàng
                        </button>
                        <button
                          type="button"
                          className="orders__history-btn"
                          style={{ backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545' }}
                          onClick={() => handleReportMissing(order.id)}
                        >
                          Chưa nhận hàng
                        </button>
                      </>
                    )}
                    <Link className="orders__history-btn" to={PATHS.orderTracking.replace(':code', order.code)}>
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}

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
          </div>
        ) : (
          <div className="orders__state">Chưa có đơn hàng.</div>
        )}
      </div>
    </section>
  )
}
