import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShoppingBag, User, KeyRound, Store, Package, CheckCircle2, Truck, Clock, XCircle, AlertCircle, RotateCcw, Star, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import orderApi from '../../api/orders/orderApi'
import { disputesApi } from '../../api/disputesApi'
import { DisputeModal } from './components/DisputeModal'
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

export default function OrderHistoryPage() {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [page, setPage] = useState(0)
  const [sizePage] = useState(10)
  const [data, setData] = useState<OrderPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')
  const [confirmOrder, setConfirmOrder] = useState<number | null>(null)
  const [reviewOrder, setReviewOrder] = useState<any | null>(null)
  const [disputeOrder, setDisputeOrder] = useState<number | null>(null)
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)

  const avatarSrc = (() => {
    const url = user?.avatarUrl
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  })()

  const fetchOrders = async (pageIndex: number) => {
    try {
      setLoading(true)
      setError('')
      const response = await orderApi.list(pageIndex, sizePage)
      setData(response.data)
    } catch {
      setError('Không thể tải lịch sử đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(page)
  }, [page, sizePage])

  const executeConfirmReceipt = async () => {
    if (!confirmOrder) return
    try {
      await orderApi.confirmReceipt(confirmOrder)
      const targetOrder = data?.content?.find(o => o.id === confirmOrder)
      setConfirmOrder(null)
      if (targetOrder) {
        setReviewOrder(targetOrder)
      }
      fetchOrders(page)
    } catch (err) {
      console.error('API error:', err)
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
      setConfirmOrder(null)
    }
  }

  const handleReportMissing = async (id: number) => {
    const reason = window.prompt('Vui lòng nhập lý do (tùy chọn):')
    if (reason === null) return
    try {
      await orderApi.reportMissing(id, reason)
      toast.success('Đã gửi báo cáo khiếu nại!')
      fetchOrders(page)
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
    }
  }

  const handleDisputeSubmit = async (reason: string, description: string, evidenceImages: string[]) => {
    if (!disputeOrder) return
    setIsSubmittingDispute(true)
    try {
      await disputesApi.createDispute(disputeOrder, { reason, description, evidenceImages })
      toast.success('Gửi yêu cầu trả hàng thành công!')
      setDisputeOrder(null)
      fetchOrders(page)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu')
    } finally {
      setIsSubmittingDispute(false)
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
      {/* ── Confirm Receipt Modal ── */}
      {confirmOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Package size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Xác nhận nhận hàng</h3>
            <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '14px' }}>Bạn có chắc chắn đã nhận được đơn hàng này và sản phẩm không có vấn đề gì?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setConfirmOrder(null)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
              <button type="button" onClick={executeConfirmReceipt} style={{ flex: 1, padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Đã nhận hàng</button>
            </div>
          </div>
        </div>
      )}

      {disputeOrder && (
        <DisputeModal
          isOpen={!!disputeOrder}
          onClose={() => setDisputeOrder(null)}
          onSubmit={handleDisputeSubmit}
          isSubmitting={isSubmittingDispute}
        />
      )}

      {/* ── Review Shop Modal ── */}
      {reviewOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
            <button type="button" onClick={() => setReviewOrder(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Star size={32} fill="currentColor" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Đánh giá Shop</h3>
            <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '14px' }}>Cảm ơn bạn đã mua sắm! Hãy để lại đánh giá về chất lượng sản phẩm và dịch vụ của shop nhé.</p>
            <button 
              onClick={() => {
                const sellerId = reviewOrder.items?.[0]?.sellerId;
                if (sellerId) navigate(PATHS.shop.replace(':sellerId', sellerId.toString()) + '?tab=reviews');
                else alert('Không tìm thấy thông tin shop.');
                setReviewOrder(null);
              }} 
              style={{ width: '100%', padding: '12px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Đánh giá ngay
            </button>
            <button onClick={() => setReviewOrder(null)} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#6b7280', border: 'none', fontWeight: 500, cursor: 'pointer', marginTop: '8px' }}>
              Để sau
            </button>
          </div>
        </div>
      )}

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
                                onClick={() => setConfirmOrder(order.id)}
                              >
                                <CheckCircle2 size={14} /> Đã nhận hàng
                              </button>
                              <button
                                type="button"
                                className="order-btn order-btn--outline"
                                onClick={() => setDisputeOrder(order.id)}
                              >
                                <AlertTriangle size={14} /> Trả hàng / Hoàn tiền
                              </button>
                            </>
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
