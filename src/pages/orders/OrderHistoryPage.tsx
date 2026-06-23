import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShoppingBag, User, KeyRound, Store, Package, CheckCircle2, Truck, Clock, XCircle, AlertCircle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import orderApi from '../../api/orders/orderApi'
import { PATHS } from '../../routes/paths'
import { API_BASE_URL } from '../../config/constants'
import type { RootState } from '../../store'
import type { OrderPage } from '../../types/order'
import '../../styles/pages/orders.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('vi-VN')
}

type TabKey = 'ALL' | 'PENDING' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELED' | 'RETURNED'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'ALL',       label: 'Tất cả',      icon: <Package size={14} /> },
  { key: 'PENDING',   label: 'Chờ xử lý',   icon: <Clock size={14} /> },
  { key: 'PICKED_UP', label: 'Đang giao',    icon: <Truck size={14} /> },
  { key: 'DELIVERED', label: 'Đã giao',      icon: <CheckCircle2 size={14} /> },
  { key: 'COMPLETED', label: 'Hoàn thành',   icon: <CheckCircle2 size={14} /> },
  { key: 'CANCELED',  label: 'Đã huỷ',       icon: <XCircle size={14} /> },
  { key: 'RETURNED',  label: 'Trả hàng',     icon: <RotateCcw size={14} /> },
]

const STATUS_BADGE: Record<string, string> = {
  PENDING:   'order-badge--pending',
  ASSIGNED:  'order-badge--assigned',
  PICKED_UP: 'order-badge--picked_up',
  DELIVERED: 'order-badge--delivered',
  COMPLETED: 'order-badge--completed',
  CANCELED:  'order-badge--canceled',
  DISPUTED:  'order-badge--disputed',
  RETURNED:  'order-badge--returned',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Chờ xử lý',
  ASSIGNED:  'Đã giao Shipper',
  PICKED_UP: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELED:  'Đã huỷ',
  DISPUTED:  'Khiếu nại',
  RETURNED:  'Trả hàng',
}

export default function OrderHistoryPage() {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [page, setPage] = useState(0)
  const [sizePage] = useState(10)
  const [data, setData] = useState<OrderPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')

  const avatarSrc = (() => {
    const url = user?.avatarUrl
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  })()

  useEffect(() => {
    const fetch = async () => {
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
    fetch()
  }, [page, sizePage])

  const handleConfirmReceipt = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn đã nhận được hàng?')) return
    try {
      await orderApi.confirmReceipt(id)
      window.location.reload()
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại.')
    }
  }

  const handleReportMissing = async (id: number) => {
    const reason = window.prompt('Vui lòng nhập lý do (tùy chọn):')
    if (reason === null) return
    try {
      await orderApi.reportMissing(id, reason)
      alert('Đã gửi báo cáo khiếu nại!')
      window.location.reload()
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại.')
    }
  }

  const filteredOrders = data?.content?.filter(o =>
    activeTab === 'ALL' || o.status === activeTab
  ) ?? []

  const tabCounts: Record<string, number> = { ALL: data?.content?.length ?? 0 }
  data?.content?.forEach(o => {
    tabCounts[o.status] = (tabCounts[o.status] ?? 0) + 1
  })

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
            <button className="orders-sidebar__nav-item active">
              <ShoppingBag size={16} /> Đơn hàng của tôi
            </button>
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
            <div className="orders-card__header">
              <div className="orders-card__title">
                <ShoppingBag size={20} />
                Đơn hàng của tôi
              </div>

              {/* Tabs */}
              <div className="orders-tabs">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    className={`orders-tab${activeTab === tab.key ? ' active' : ''}`}
                    onClick={() => { setActiveTab(tab.key); setPage(0) }}
                  >
                    {tab.icon}
                    {tab.label}
                    {tabCounts[tab.key] !== undefined && tabCounts[tab.key] > 0 && (
                      <span className="orders-tab__badge">{tabCounts[tab.key]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="orders-loading">Đang tải đơn hàng...</div>
            ) : error ? (
              <div className="orders-error">
                <AlertCircle size={16} style={{ display: 'inline', marginRight: 6 }} />
                {error}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="orders-empty">
                <Package size={48} />
                {activeTab === 'ALL' ? 'Bạn chưa có đơn hàng nào.' : `Không có đơn hàng "${TABS.find(t => t.key === activeTab)?.label}".`}
              </div>
            ) : (
              <>
                <div className="orders-list">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="order-item">

                      {/* Header */}
                      <div className="order-item__header">
                        <div className="order-item__meta">
                          <span className="order-item__code">Mã đơn: #{order.code}</span>
                          <span className="order-item__sep">|</span>
                          <span className="order-item__date">Ngày đặt: {formatDate(order.createdAt)}</span>
                        </div>
                        <div className="order-item__badges">
                          {order.paymentStatus === 'SUCCESS' && (
                            <span className="order-badge order-badge--completed">
                              <CheckCircle2 size={11} /> Đã thanh toán
                            </span>
                          )}
                          <span className={`order-badge ${STATUS_BADGE[order.status] || 'order-badge--default'}`}>
                            {STATUS_LABEL[order.status] || order.status}
                          </span>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="order-item__products">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item__product">
                            <div className="order-item__img">
                              {item.imageUrl
                                ? <img src={item.imageUrl} alt={item.productName || 'Sản phẩm'} />
                                : <div className="order-item__img-placeholder"><Package size={20} /></div>
                              }
                            </div>
                            <div className="order-item__product-info">
                              <p className="order-item__product-name">{item.productName}</p>
                              <p className="order-item__product-meta">x{item.quantity}</p>
                            </div>
                            <div className="order-item__product-price">{formatPrice(item.unitPrice)}</div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="order-item__footer">
                        <div className="order-item__total">
                          <span className="order-item__total-label">Thành tiền</span>
                          <span className="order-item__total-amount">{formatPrice(order.totalAmount)}</span>
                        </div>

                        <div className="order-item__actions">
                          {order.status === 'DELIVERED' && (
                            <>
                              <button
                                type="button"
                                className="order-btn order-btn--success"
                                onClick={() => handleConfirmReceipt(order.id)}
                              >
                                <CheckCircle2 size={14} /> Đã nhận hàng
                              </button>
                              <button
                                type="button"
                                className="order-btn order-btn--danger"
                                onClick={() => handleReportMissing(order.id)}
                              >
                                Chưa nhận hàng
                              </button>
                            </>
                          )}
                          {order.status === 'COMPLETED' && (
                            <button
                              type="button"
                              className="order-btn order-btn--outline"
                              onClick={() => alert('Tính năng trả hàng sẽ sớm có mặt!')}
                            >
                              <RotateCcw size={14} /> Trả hàng
                            </button>
                          )}
                          <Link
                            className="order-btn order-btn--primary"
                            to={PATHS.orderTracking.replace(':code', order.code)}
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="orders-pagination">
                    <button
                      className="orders-pagination__btn"
                      onClick={() => setPage(p => Math.max(p - 1, 0))}
                      disabled={page === 0}
                    >
                      <ChevronLeft size={16} style={{ display: 'inline' }} /> Trước
                    </button>
                    <span className="orders-pagination__info">
                      Trang {data.number + 1} / {data.totalPages}
                    </span>
                    <button
                      className="orders-pagination__btn"
                      onClick={() => setPage(p => p + 1 < data.totalPages ? p + 1 : p)}
                      disabled={page + 1 >= data.totalPages}
                    >
                      Sau <ChevronRight size={16} style={{ display: 'inline' }} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}
