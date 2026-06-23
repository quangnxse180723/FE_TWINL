import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShoppingBag, User, KeyRound, Store, ArrowLeft, MapPin, Clock, Package, Truck, CheckCircle2, Circle } from 'lucide-react'
import orderApi from '../../api/orders/orderApi'
import { PATHS } from '../../routes/paths'
import { API_BASE_URL } from '../../config/constants'
import type { RootState } from '../../store'
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

const STEP_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock size={16} />,
  ASSIGNED: <Package size={16} />,
  PICKED_UP: <Truck size={16} />,
  DELIVERED: <MapPin size={16} />,
  COMPLETED: <CheckCircle2 size={16} />,
}

export default function OrderTrackingPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const avatarSrc = (() => {
    const url = user?.avatarUrl
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  })()

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
    <div className="orders-page">
      <div className="orders-layout">

        {/* ── SIDEBAR ──────────────────────────── */}
        <aside className="orders-sidebar">
          <div className="orders-sidebar__avatar-block">
            <div className="orders-sidebar__avatar">
              {avatarSrc
                ? <img src={avatarSrc} alt={user?.displayName || 'User'} />
                : <span>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</span>
              }
            </div>
            <div className="orders-sidebar__name">{user?.displayName || 'Người dùng'}</div>
            <div className="orders-sidebar__since">Thành viên từ 2023</div>
          </div>

          <nav className="orders-sidebar__nav">
            <Link className="orders-sidebar__nav-item" to={PATHS.profile}>
              <User size={16} /> Thông tin cá nhân
            </Link>
            <Link className="orders-sidebar__nav-item active" to={PATHS.orders}>
              <ShoppingBag size={16} /> Đơn hàng của tôi
            </Link>
            <Link className="orders-sidebar__nav-item" to={PATHS.profile + '?tab=password'}>
              <KeyRound size={16} /> Đổi mật khẩu
            </Link>
          </nav>

          <button className="orders-sidebar__seller-btn" onClick={() => navigate(PATHS.sellerDashboard)}>
            <Store size={15} />
            Trở thành người bán
          </button>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────── */}
        <main className="orders-main">
          <div className="orders-card">
            {/* Header */}
            <div className="orders-card__header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => navigate(PATHS.orders)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280', padding: '4px', borderRadius: '8px' }}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Theo dõi đơn hàng</div>
                    <div className="orders-card__title" style={{ gap: '8px' }}>
                      <Package size={18} />
                      {order ? order.code : 'Chi tiết đơn hàng'}
                    </div>
                  </div>
                </div>
                <Link to={PATHS.orders} style={{ fontSize: '13px', color: '#1a7a3e', textDecoration: 'none', fontWeight: 500 }}>
                  Lịch sử đơn hàng
                </Link>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {loading ? (
                <div className="orders-loading">Đang tải đơn hàng...</div>
              ) : error ? (
                <div className="orders-error">{error}</div>
              ) : order ? (
                <>
                  {/* Meta info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', padding: '16px', background: '#f9fafb', borderRadius: '12px', marginBottom: '24px', border: '1px solid #f3f4f6' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Ngày đặt</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{formatDateTime(order.createdAt)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Tổng tiền</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a7a3e' }}>{formatPrice(order.totalAmount)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Trạng thái</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{STATUS_LABELS[order.status] || order.status}</div>
                    </div>
                    {order.paymentStatus && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Thanh toán</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{order.paymentStatus}</div>
                      </div>
                    )}
                    {order.shipperName && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Shipper</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{order.shipperName}</div>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Tiến trình đơn hàng</div>
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {/* Line track */}
                      <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: '#e5e7eb', zIndex: 0 }} />
                      <div style={{
                        position: 'absolute', top: '16px', left: '10%', height: '2px', zIndex: 1,
                        background: '#1a7a3e',
                        width: order.status === 'CANCELED' ? '0%' : `${(activeIndex / (statusSteps.length - 1)) * 80}%`
                      }} />

                      {statusSteps.map((step, index) => {
                        const isActive = index <= activeIndex && order.status !== 'CANCELED'
                        const isCurrent = index === activeIndex && order.status !== 'CANCELED'
                        return (
                          <div key={step} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: isActive ? '#1a7a3e' : '#fff',
                              border: isActive ? '2px solid #1a7a3e' : '2px solid #e5e7eb',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: isActive ? '#fff' : '#9ca3af',
                              boxShadow: isCurrent ? '0 0 0 4px rgba(26, 122, 62, 0.12)' : 'none',
                              transition: 'all 0.3s ease',
                            }}>
                              {isActive ? STEP_ICONS[step] : <Circle size={12} />}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isActive ? '#1a7a3e' : '#9ca3af', textAlign: 'center', lineHeight: 1.3 }}>
                              {STATUS_LABELS[step]}
                            </span>
                          </div>
                        )
                      })}

                      {order.status === 'CANCELED' && (
                        <div style={{ position: 'absolute', top: '-8px', right: 0, background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                          Đã huỷ
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Sản phẩm</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.items.map((item) => (
                        <div key={`${item.productId}-${item.productName}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName ?? 'Sản phẩm'}
                                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb', flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Package size={24} color="#9ca3af" />
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{item.productName ?? 'Sản phẩm'}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>Số lượng: {item.quantity}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a7a3e' }}>{formatPrice(item.lineTotal)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.note && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fefce8', borderRadius: '10px', border: '1px solid #fef08a' }}>
                      <div style={{ fontSize: '12px', color: '#713f12', fontWeight: 600, marginBottom: '4px' }}>Ghi chú</div>
                      <div style={{ fontSize: '13px', color: '#854d0e' }}>{order.note}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="orders-empty">
                  <Package size={48} />
                  Không tìm thấy đơn hàng.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
