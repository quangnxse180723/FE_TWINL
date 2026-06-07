import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import cartApi from '../../api/cart/cartApi'
import vnpayApi from '../../api/payment/vnpayApi'
import sepayApi from '../../api/payment/sepayApi'
import { PATHS } from '../../routes/paths'
import type { CartResponse } from '../../types/cart'
import type { RootState } from '../../store'
import '../../styles/pages/cart.css'

const formatPrice = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} VND`

export default function CartPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  // 'vnpay' = Sandbox test | 'sepay' = VietQR tiền thật
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'sepay'>('sepay')
  const [sepayQrUrl, setSepayQrUrl] = useState<string>('')

  const hasShippingInfo = Boolean(
    user?.displayName &&
    user?.phone &&
    user?.address &&
    user?.wardCode &&
    user?.districtId &&
    user?.districtId > 0 &&
    user?.provinceId &&
    user?.provinceId > 0
  )

  const totals = useMemo(() => {
    const subtotal = cart?.subtotal ?? 0
    const shipping = 0
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    }
  }, [cart])

  useEffect(() => {
    if (!user) {
      setCart(null)
      setLoading(false)
      return
    }

    const fetchCart = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await cartApi.getCart()
        setCart(response.data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể tải giỏ hàng'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const handleUpdateQuantity = async (itemId: number, nextQuantity: number) => {
    if (nextQuantity < 1) return
    try {
      const response = await cartApi.updateItem(itemId, { quantity: nextQuantity })
      setCart(response.data)
      setActionError('')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không thể cập nhật số lượng')
    }
  }

  const handleCheckout = async () => {
    if (!hasShippingInfo) {
      navigate(PATHS.profile)
      return
    }

    setCheckoutLoading(true)
    setActionError('')
    try {
      if (paymentMethod === 'sepay') {
        // SePay – VietQR tiền thật
        const response = await sepayApi.createPayment()
        setSepayQrUrl(response.data.paymentUrl)
      } else {
        // VNPay – Sandbox test
        const response = await vnpayApi.createPayment()
        window.location.href = response.data.paymentUrl
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : `Không thể tạo thanh toán ${paymentMethod === 'sepay' ? 'SePay' : 'VNPay'}`
      )
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      const response = await cartApi.removeItem(itemId)
      setCart(response.data)
      setActionError('')
      
      const newTotal = response.data?.items?.length ?? 0
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: newTotal }))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không thể xóa sản phẩm')
    }
  }

  const handleClearCart = async () => {
    try {
      const response = await cartApi.clearCart()
      setCart(response.data)
      setActionError('')
      
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: 0 }))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không thể làm trống giỏ hàng')
    }
  }

  if (!user) {
    return (
      <section className="cart">
        <div className="cart__empty-state">
          <h1>Giỏ hàng của bạn</h1>
          <p>Vui lòng đăng nhập để xem giỏ hàng.</p>
          <Link className="cart__primary" to={PATHS.login}>Đăng nhập ngay</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="cart">
      <div className="cart__header">
        <h1>Giỏ hàng của bạn</h1>
        {cart?.items?.length ? (
          <button type="button" className="cart__clear" onClick={handleClearCart}>Xóa tất cả</button>
        ) : null}
      </div>

      {loading ? (
        <div className="cart__loading">Đang tải giỏ hàng...</div>
      ) : error ? (
        <div className="cart__error">{error}</div>
      ) : cart && cart.items.length > 0 ? (
        <div className="cart__layout">
          <div className="cart__main">
            {actionError ? <div className="cart__action-error">{actionError}</div> : null}
            <div className="cart__table">
              <div className="cart__row cart__row--head">
                <span>Sản phẩm</span>
                <span>Giá</span>
                <span>Số lượng</span>
                <span>Tạm tính</span>
              </div>
              {cart.items.map((item) => {
                const maxStock = item.availableStock ?? item.quantity
                const canDecrease = item.quantity > 1
                const canIncrease = item.quantity < maxStock
                const disableQuantity = maxStock <= 1

                return (
                <div key={item.id} className="cart__row">
                  <div className="cart__product">
                    <button type="button" className="cart__remove" onClick={() => handleRemoveItem(item.id)}>
                      x
                    </button>
                    <div className="cart__thumb">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>IMG</span>}
                    </div>
                    <div className="cart__info">
                      <h4>{item.productName}</h4>
                      <p>Mã: {item.productId}</p>
                    </div>
                  </div>
                  <div className="cart__price">{formatPrice(item.unitPrice)}</div>
                  <div className="cart__qty">
                    <button
                      type="button"
                      disabled={!canDecrease || disableQuantity}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      disabled={!canIncrease || disableQuantity}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart__subtotal">{formatPrice(item.lineTotal)}</div>
                </div>
              )})}
            </div>

            <div className="cart__features">
              <div className="cart__feature">
                <div className="cart__feature-icon">?</div>
                <div>
                  <strong>Bạn có câu hỏi?</strong>
                  <p>Team TWINL luôn sẵn sàng hỗ trợ bạn.</p>
                  <Link to={PATHS.home}>Liên hệ ngay</Link>
                </div>
              </div>
              <div className="cart__feature">
                <div className="cart__feature-icon">LOCK</div>
                <div>
                  <strong>Mua sắm an toàn</strong>
                  <p>Dữ liệu & thanh toán của bạn luôn được bảo vệ.</p>
                </div>
              </div>
              <div className="cart__feature">
                <div className="cart__feature-icon">OK</div>
                <div>
                  <strong>Chính sách</strong>
                  <p>Bảo hành chính hãng trên toàn hệ thống.</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="cart__summary">
            <div className="cart__summary-card">
              <h3>Tổng cộng:</h3>
              <div className="cart__summary-row">
                <span>Tên hiển thị</span>
                <span>{user.displayName || 'Chưa cập nhật'}</span>
              </div>
              <div className="cart__summary-row">
                <span>Số điện thoại</span>
                <span>{user.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="cart__summary-row">
                <span>Địa chỉ</span>
                <span>{user.address || 'Chưa cập nhật'}</span>
              </div>
              <div className="cart__summary-row">
                <span>Ward Code</span>
                <span>{user.wardCode || 'Chưa cập nhật'}</span>
              </div>
              <div className="cart__summary-row">
                <span>District ID</span>
                <span>{user.districtId || 'Chưa cập nhật'}</span>
              </div>
              <div className="cart__summary-row">
                <span>Province ID</span>
                <span>{user.provinceId || 'Chưa cập nhật'}</span>
              </div>
              {!hasShippingInfo ? (
                <div className="cart__summary-alert">
                  Vui lòng cập nhật đầy đủ thông tin để thanh toán.
                  <button type="button" onClick={() => navigate(PATHS.profile)}>Cập nhật ngay</button>
                </div>
              ) : null}
              <div className="cart__summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="cart__summary-row">
                <span>Phí vận chuyển</span>
                <span>{totals.shipping === 0 ? 'Miễn phí' : formatPrice(totals.shipping)}</span>
              </div>
              <div className="cart__summary-total">
                <span>Tổng</span>
                <strong>{formatPrice(totals.total)}</strong>
              </div>
              {/* ── Chọn phương thức thanh toán ── */}
              <div className="cart__payment-method">
                <h4>Phương thức thanh toán</h4>
                <label className={`cart__payment-option ${paymentMethod === 'sepay' ? 'cart__payment-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="sepay"
                    checked={paymentMethod === 'sepay'}
                    onChange={() => setPaymentMethod('sepay')}
                  />
                  <span className="cart__payment-option-icon">🏦</span>
                  <span>
                    <strong>VietQR (Tiền thật)</strong>
                    <small>Chuyển khoản ngân hàng siêu tốc</small>
                  </span>
                </label>
                <label className={`cart__payment-option ${paymentMethod === 'vnpay' ? 'cart__payment-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={() => setPaymentMethod('vnpay')}
                  />
                  <span className="cart__payment-option-icon">🧪</span>
                  <span>
                    <strong>VNPay</strong>
                    <small>Sandbox – Chỉ dùng để test</small>
                  </span>
                </label>
              </div>

              {sepayQrUrl ? (
                <div className="cart__qr-container" style={{ textAlign: 'center', marginTop: '16px', background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <h4 style={{ color: '#0052cc', marginBottom: '12px', fontSize: '16px' }}>Quét mã QR để thanh toán</h4>
                  <img src={sepayQrUrl} alt="VietQR" style={{ width: '100%', maxWidth: '250px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>
                    Đơn hàng sẽ tự động duyệt sau khi nhận được thanh toán. Vui lòng giữ nguyên trang này hoặc theo dõi trong Đơn hàng của tôi.
                  </p>
                  <button
                    type="button"
                    className="cart__checkout"
                    style={{ marginTop: '16px', background: '#e0e0e0', color: '#333' }}
                    onClick={() => navigate(PATHS.orders)}
                  >
                    Xem đơn hàng
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="cart__checkout"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading
                    ? `Đang chuyển đến ${paymentMethod === 'sepay' ? 'trang thanh toán' : 'VNPay'}...`
                    : paymentMethod === 'sepay'
                    ? '💳 Thanh toán VietQR'
                    : '🧪 Thanh toán VNPay (Test)'}
                </button>
              )}
              <div className="cart__coupon">
                <input type="text" placeholder="Mã giảm giá" />
                <button type="button">Áp dụng</button>
              </div>
            </div>

            <div className="cart__summary-card cart__summary-card--info">
              <h4>Phương thức thanh toán</h4>
              <div className="cart__payments">
                <span>Visa</span>
                <span>MasterCard</span>
                <span>JCB</span>
                <span>Momo</span>
                <span>VNPay</span>
                <span>ZaloPay</span>
              </div>
              <div className="cart__policy">
                <h5>Hỗ trợ đổi sản phẩm</h5>
                <p>Trong vòng 7 ngày kể từ ngày nhận hàng nếu có lỗi từ nhà sản xuất.</p>
                <h5>Chính sách vận chuyển</h5>
                <ol>
                  <li>Miễn phí vận chuyển đơn hàng từ 500K.</li>
                  <li>Thời gian giao hàng 2-5 ngày làm việc.</li>
                  <li>Hỗ trợ kiểm tra hàng khi nhận.</li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="cart__empty">
          <h2>Giỏ hàng trống</h2>
          <p>Khám phá các sản phẩm mới nhất của TWINL.</p>
          <Link className="cart__primary" to={PATHS.home}>Tiếp tục mua sắm</Link>
        </div>
      )}
    </section>
  )
}
