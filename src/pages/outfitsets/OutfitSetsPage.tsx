import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import outfitSetsApi, { type OutfitSet } from '../../api/outfitSetsApi'
import { PATHS } from '../../routes/paths'
import { ArrowRight, Tag } from 'lucide-react'
import './OutfitSetsPage.css'

export default function OutfitSetsPage() {
  const [sets, setSets] = useState<OutfitSet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    outfitSetsApi.getAll()
      .then((res: { data: OutfitSet[] }) => setSets(res.data))
      .catch(() => setSets([]))
      .finally(() => setLoading(false))
  }, [])

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v).replace('₫', 'đ')

  if (loading) {
    return (
      <div className="outfit-page">
        <div className="outfit-page__loading">Đang tải bộ sưu tập...</div>
      </div>
    )
  }

  return (
    <div className="outfit-page">
      {/* Hero */}
      <section className="outfit-hero">
        <div className="outfit-hero__inner">
          <p className="outfit-hero__label">B2C EXCLUSIVE</p>
          <h1 className="outfit-hero__title">Bộ Phối Đồ<br />Được Tuyển Chọn</h1>
          <p className="outfit-hero__sub">
            Các bộ trang phục do TWINL phối sẵn — Mua lẻ hoặc mua nguyên set để nhận ưu đãi hấp dẫn.
          </p>
          <div className="outfit-hero__badges">
            <span className="hero-badge">🛍 Mua 2 món → Giảm 5%</span>
            <span className="hero-badge hero-badge--gold">✦ Mua nguyên set → Giảm 8–10%</span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="outfit-grid-section">
        <div className="outfit-grid-container">
          {sets.length === 0 ? (
            <div className="outfit-empty">Chưa có bộ set nào. Hãy quay lại sau nhé!</div>
          ) : (
            <div className="outfit-grid">
              {sets.map((set, idx) => (
                <Link
                  key={set.id}
                  to={PATHS.outfitSetDetail.replace(':id', String(set.id))}
                  className={`outfit-card ${idx === 0 ? 'outfit-card--featured' : ''}`}
                >
                  <div className="outfit-card__image-wrap">
                    {set.coverImageUrl ? (
                      <img src={set.coverImageUrl} alt={set.name} className="outfit-card__cover" />
                    ) : (
                      <div className="outfit-card__no-image">
                        {/* Preview mosaic từ ảnh sản phẩm */}
                        <div className="outfit-card__mosaic">
                          {set.items.slice(0, 4).map(item => (
                            <div key={item.id} className="mosaic-cell">
                              {item.productImageUrl
                                ? <img src={item.productImageUrl} alt={item.productName} />
                                : <div className="mosaic-placeholder" />
                              }
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {set.styleTag && (
                      <div className="outfit-card__tag">
                        <Tag size={10} />
                        {set.styleTag}
                      </div>
                    )}
                    <div className="outfit-card__discount-badge">
                      <span>−{set.discountThresholdHigh}%</span>
                    </div>
                  </div>

                  <div className="outfit-card__body">
                    <div className="outfit-card__meta">
                      <span className="outfit-card__count">{set.itemCount} sản phẩm</span>
                    </div>
                    <h2 className="outfit-card__name">{set.name}</h2>
                    {set.description && (
                      <p className="outfit-card__desc">{set.description}</p>
                    )}
                    <div className="outfit-card__footer">
                      <div className="outfit-card__price">
                        <span className="price-label">Tổng gốc</span>
                        <span className="price-val">{formatPrice(set.totalPrice)}</span>
                      </div>
                      <div className="outfit-card__cta">
                        Xem bộ <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
