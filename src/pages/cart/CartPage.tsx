import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import cartApi from '../../api/cart/cartApi'
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
      // SePay – VietQR tiền thật
      const response = await sepayApi.createPayment()
      navigate(PATHS.sepayCheckout, { state: { qrUrl: response.data.paymentUrl, orderCode: response.data.orderCode } })
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Không thể tạo thanh toán SePay'
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
          <h1>{'Giỏ hàng của bạn'}</h1>
          <p>{'Vui lòng đăng nhập để xem giỏ hàng và mua sắm.'}</p>
          <Link className="cart__primary" to={PATHS.login}>{'Đăng nhập ngay'}</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="cart">
      <div className="cart__header">
        <h1>{'Giỏ hàng của bạn'}</h1>
        {cart?.items?.length ? (
          <button type="button" className="cart__clear" onClick={handleClearCart}>{'Xóa'} All</button>
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
                <span>{'Sản phẩm'}</span>
                <span>{'Đơn giá'}</span>
                <span>{'Số lượng'}</span>
                <span>{'Tạm tính'}</span>
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
                  <strong>{'Bạn có câu hỏi?'}</strong>
                  <p>{'Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng 24/7.'}</p>
                  <Link to={PATHS.contact}>{'Liên hệ ngay'}</Link>
                </div>
              </div>
              <div className="cart__feature">
                <div className="cart__feature-icon">LOCK</div>
                <div>
                  <strong>{'Ký quỹ an toàn'}</strong>
                  <p>{'Tiền được giữ bởi TWINL cho đến khi giao dịch hoàn tất'}</p>
                </div>
              </div>
              <div className="cart__feature">
                <div className="cart__feature-icon">OK</div>
                <div>
                  <strong>{'Hoàn tiền 48h'}</strong>
                  <p>{'Không vừa ý? Đổi trả ngay lập tức'}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="cart__summary">
            <div className="cart__summary-card">
              <h3>{'Tóm tắt đơn hàng'}:</h3>
              <div className="cart__summary-row">
                <span>{'Tên người nhận'}</span>
                <span>{user.displayName || 'Chưa cập nhật'}</span>
              </div>
              <div className="cart__summary-row">
                <span>{'Số điện thoại'}</span>
                <span>{user.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="cart__summary-row">
                <span>{'Địa chỉ nhận hàng'}</span>
                <span>{user.address || 'Chưa cập nhật'}</span>
              </div>

              {!hasShippingInfo ? (
                <div className="cart__summary-alert">
                  {'Vui lòng cập nhật thông tin giao hàng.'}
                  <button type="button" onClick={() => navigate(PATHS.profile)}>{'Cập nhật ngay'}</button>
                </div>
              ) : null}
              <div className="cart__summary-row">
                <span>{'Tạm tính'}</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="cart__summary-row">
                <span>{'Phí vận chuyển'}</span>
                <span>{totals.shipping === 0 ? 'Miễn phí' : formatPrice(totals.shipping)}</span>
              </div>
              <div className="cart__summary-total">
                <span>{'Tổng cộng'}</span>
                <strong>{formatPrice(totals.total)}</strong>
              </div>
              {/* ── Chọn phương thức thanh toán ── */}
              <div className="cart__payment-method">
                <h4>{'Phương thức thanh toán'}</h4>
                <div className="cart__payment-option cart__payment-option--active" style={{ cursor: 'default' }}>
                  <span className="cart__payment-option-icon">🏦</span>
                  <span>
                    <strong>{'Chuyển khoản VietQR'}</strong>
                  </span>
                </div>
              </div>

              <button
                  type="button"
                  className="cart__checkout"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading
                    ? 'Đang xử lý...'
                    : 'Thanh toán ngay'}
                </button>
              <div className="cart__coupon" style={{ display: 'none' }}>
                <input type="text" placeholder="Mã giảm giá" />
                <button type="button">Áp dụng</button>
              </div>
            </div>

            <div className="cart__summary-card cart__summary-card--info">
              <h4>{'Phương thức thanh toán'}</h4>
              <div className="cart__payments">
                <span>Visa</span>
                <span>MasterCard</span>
                <span>JCB</span>
                <span>Momo</span>
                <span>VNPay</span>
                <span>ZaloPay</span>
              </div>
              <div className="cart__policy">
                <h5>{'Hoàn tiền 48h'}</h5>
                <p>{'Kiểm tra kỹ trong 48h, nếu không hài lòng hoàn tiền ngay'}</p>
                <h5>{'Ký quỹ an toàn'}</h5>
                <p>{'Tiền được giữ cho đến khi bạn hài lòng'}</p>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="cart__empty">
          <h2>{'Giỏ hàng trống'}</h2>
          <p>{'Khám phá các sản phẩm mới nhất của TWINL.'}</p>
          <Link className="cart__primary" to={PATHS.home}>{'Tiếp tục mua sắm'}</Link>
        </div>
      )}
    </section>
  )
}
