import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import outfitSetsApi, { type OutfitSet } from '../../api/outfitSetsApi'
import { PATHS } from '../../routes/paths'
import { ShoppingBag, ArrowLeft, Tag, Check, Package } from 'lucide-react'
import { toast } from 'react-toastify'
import cartApi from '../../api/cart/cartApi'
import './OutfitSetDetailPage.css'

export default function OutfitSetDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [set, setSet] = useState<OutfitSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!id) return
    outfitSetsApi.getById(Number(id))
      .then((res: { data: OutfitSet }) => {
        setSet(res.data)
        // Pre-select all items on load
        const allIds = new Set<number>(res.data.items.map((i: { productId: number }) => i.productId))
        setSelected(allIds)
      })
      .catch(() => setSet(null))
      .finally(() => setLoading(false))
  }, [id])

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v).replace('₫', 'đ')

  // Discount calculation
  const { subtotal, discountPct, discountAmount, finalPrice, discountLabel } = useMemo(() => {
    if (!set) return { subtotal: 0, discountPct: 0, discountAmount: 0, finalPrice: 0, discountLabel: '' }

    const selectedItems = set.items.filter(i => selected.has(i.productId))
    const subtotal = selectedItems.reduce((sum, i) => sum + i.productPrice, 0)
    const isFullSet = selectedItems.length === set.items.length

    let discountPct = 0
    let discountLabel = ''

    if (isFullSet) {
      discountPct = subtotal >= set.discountPriceThreshold
        ? set.discountThresholdHigh
        : set.discountThresholdLow
      discountLabel = `Giảm ${discountPct}% khi mua nguyên bộ`
    } else if (selectedItems.length >= 2) {
      discountPct = set.discountTwoItems
      discountLabel = `Giảm ${discountPct}% khi chọn ≥ 2 món`
    }

    const discountAmount = (subtotal * discountPct) / 100
    const finalPrice = subtotal - discountAmount

    return { subtotal, discountPct, discountAmount, finalPrice, discountLabel }
  }, [set, selected])

  const toggleItem = (productId: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const selectAll = () => {
    if (!set) return
    setSelected(new Set(set.items.map(i => i.productId)))
  }

  const handleAddToCart = async () => {
    if (!set || selected.size === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 sản phẩm')
      return
    }
    setAdding(true)
    try {
      const selectedItems = set.items.filter(i => selected.has(i.productId))
      for (const item of selectedItems) {
        await cartApi.addItem({ productId: item.productId, quantity: 1 })
      }
      toast.success(`Đã thêm ${selected.size} sản phẩm vào giỏ hàng!`)
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className="outfit-detail__loading">Đang tải bộ set...</div>
  if (!set) return <div className="outfit-detail__error">Không tìm thấy bộ set này.</div>

  const selectedItems = set.items.filter(i => selected.has(i.productId))
  const isFullSet = selectedItems.length === set.items.length

  return (
    <div className="outfit-detail">
      {/* Breadcrumb */}
      <div className="outfit-detail__breadcrumb">
        <Link to={PATHS.outfitSets} className="breadcrumb-link">
          <ArrowLeft size={14} /> Tất cả bộ set
        </Link>
      </div>

      <div className="outfit-detail__container">
        {/* LEFT: product list */}
        <div className="outfit-detail__left">
          <div className="outfit-detail__header">
            {set.styleTag && (
              <div className="outfit-detail__tag">
                <Tag size={12} /> {set.styleTag}
              </div>
            )}
            <h1 className="outfit-detail__title">{set.name}</h1>
            {set.description && (
              <p className="outfit-detail__desc">{set.description}</p>
            )}

            <div className="outfit-detail__discount-info">
              <div className="discount-rule">
                <span className="discount-rule__badge">5%</span>
                <span>Giảm khi chọn ≥ 2 sản phẩm trong bộ</span>
              </div>
              <div className="discount-rule discount-rule--gold">
                <span className="discount-rule__badge discount-rule__badge--gold">{set.discountThresholdLow}–{set.discountThresholdHigh}%</span>
                <span>Giảm khi mua nguyên bộ (tùy giá trị)</span>
              </div>
            </div>
          </div>

          <div className="outfit-detail__actions-top">
            <button className="btn-select-all" onClick={selectAll}>
              Chọn tất cả ({set.items.length} món)
            </button>
            <span className="selected-count">{selected.size} đang chọn</span>
          </div>

          {/* Product cards */}
          <div className="outfit-detail__items">
            {set.items.map(item => (
              <div
                key={item.id}
                className={`outfit-item ${selected.has(item.productId) ? 'outfit-item--selected' : ''}`}
                onClick={() => toggleItem(item.productId)}
              >
                <div className="outfit-item__checkbox">
                  {selected.has(item.productId) && <Check size={14} strokeWidth={2.5} />}
                </div>

                <div className="outfit-item__image">
                  {item.productImageUrl
                    ? <img src={item.productImageUrl} alt={item.productName} />
                    : <div className="outfit-item__no-img"><Package size={24} /></div>
                  }
                </div>

                <div className="outfit-item__info">
                  {item.role && <span className="outfit-item__role">{item.role.toUpperCase()}</span>}
                  <h3 className="outfit-item__name">{item.productName}</h3>
                  <span className="outfit-item__brand">{item.productBrand}</span>
                </div>

                <div className="outfit-item__right">
                  <span className="outfit-item__price">{formatPrice(item.productPrice)}</span>
                  {item.productStock === 0 && (
                    <span className="outfit-item__out">Hết hàng</span>
                  )}
                  <Link
                    to={PATHS.productDetail.replace(':id', String(item.productId))}
                    className="outfit-item__view"
                    onClick={e => e.stopPropagation()}
                  >
                    Xem SP
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: price summary sticky */}
        <div className="outfit-detail__right">
          <div className="outfit-summary">
            <h2 className="outfit-summary__title">Tóm tắt đơn hàng</h2>

            {selected.size === 0 ? (
              <p className="outfit-summary__empty">Chưa chọn sản phẩm nào</p>
            ) : (
              <>
                <div className="outfit-summary__items">
                  {selectedItems.map(item => (
                    <div key={item.id} className="summary-item">
                      <span className="summary-item__name">{item.productName}</span>
                      <span className="summary-item__price">{formatPrice(item.productPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="outfit-summary__totals">
                  <div className="total-row">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {discountPct > 0 && (
                    <div className="total-row total-row--discount">
                      <span>{discountLabel}</span>
                      <span>−{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="total-row total-row--final">
                    <span>Thành tiền</span>
                    <span>{formatPrice(finalPrice)}</span>
                  </div>
                </div>

                {/* Discount badge */}
                {isFullSet ? (
                  <div className="outfit-summary__badge outfit-summary__badge--full">
                    ✦ Mua nguyên bộ — Giảm {discountPct}%
                  </div>
                ) : selected.size >= 2 ? (
                  <div className="outfit-summary__badge outfit-summary__badge--two">
                    🛍 Đang giảm {discountPct}% — Thêm {set.items.length - selected.size} món nữa để được giảm nhiều hơn!
                  </div>
                ) : (
                  <div className="outfit-summary__badge outfit-summary__badge--hint">
                    💡 Chọn thêm 1 món nữa để nhận giảm giá
                  </div>
                )}
              </>
            )}

            <button
              className="outfit-summary__btn"
              onClick={handleAddToCart}
              disabled={selected.size === 0 || adding}
            >
              <ShoppingBag size={18} />
              {adding ? 'Đang thêm...' : `Thêm vào giỏ (${selected.size} món)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
