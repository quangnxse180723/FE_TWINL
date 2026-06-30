import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { axiosClient } from '../../api/axiosClient'
import productsApi, { type Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import type { RootState } from '../../store'
import { Package, ShoppingBag, Store, Star, MessageSquare, X } from 'lucide-react'
import { toast } from 'react-toastify'

import './ShopPage.css'

interface SellerProfile {
  id: number
  displayName: string
  avatarUrl?: string
  productCount: number
  soldCount: number
  averageRating: number
  reviewCount: number
}

interface ShopReview {
  id: number
  reviewerId: number
  reviewerName: string
  reviewerAvatarUrl?: string
  rating: number
  comment: string
  createdAt: string
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ')

export default function ShopPage() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const user = useSelector((state: RootState) => state.auth.user)

  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products')
  
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [reviews, setReviews] = useState<ShopReview[]>([])
  const [reviewsPage, setReviewsPage] = useState(0)
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchProfile = async () => {
    if (!sellerId) return
    try {
      const res = await axiosClient.get<SellerProfile>(`/api/products/sellers/${sellerId}/profile`)
      setProfile(res.data)
    } catch {
      setProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }

  useEffect(() => {
    setLoadingProfile(true)
    fetchProfile()
  }, [sellerId])

  useEffect(() => {
    if (!sellerId) return
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const res = await productsApi.getProducts({ page, sizePage: 12 })
        const all = res.data.content.filter((p: Product) => p.sellerId === Number(sellerId))
        setProducts(all)
        setTotalPages(res.data.totalPages)
      } catch {
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [sellerId, page])

  useEffect(() => {
    if (!sellerId || activeTab !== 'reviews') return
    const fetchReviews = async () => {
      setLoadingReviews(true)
      try {
        const res = await axiosClient.get(`/api/products/sellers/${sellerId}/reviews?page=${reviewsPage}&size=10`)
        setReviews(res.data.content)
        setReviewsTotalPages(res.data.totalPages)
      } catch {
        setReviews([])
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [sellerId, activeTab, reviewsPage])

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
      return
    }
    setSubmittingReview(true)
    try {
      await axiosClient.post(`/api/products/sellers/${sellerId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      })
      toast.success('Gửi đánh giá thành công!')
      setIsReviewModalOpen(false)
      setReviewComment('')
      setReviewRating(5)
      // Refresh
      fetchProfile()
      if (reviewsPage === 0) {
        const res = await axiosClient.get(`/api/products/sellers/${sellerId}/reviews?page=0&size=10`)
        setReviews(res.data.content)
        setReviewsTotalPages(res.data.totalPages)
      } else {
        setReviewsPage(0)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, bạn cần mua hàng thành công để đánh giá.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="shop-page">
        <div className="shop-page__loading">Đang tải thông tin shop...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="shop-page">
        <div className="shop-page__error">Không tìm thấy shop này.</div>
      </div>
    )
  }

  return (
    <div className="shop-page">
      {/* ── SHOP HEADER ──────────────────────────────── */}
      <div className="shop-page__header">
        <div className="shop-page__header-inner">
          <div className="shop-page__avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} />
            ) : (
              <span>{profile.displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="shop-page__header-info">
            <h1 className="shop-page__name">{profile.displayName}</h1>
            <div className="shop-page__stats">
              <div className="shop-page__stat">
                <Package size={16} />
                <span><strong>{profile.productCount}</strong> sản phẩm</span>
              </div>
              <div className="shop-page__stat-divider" />
              <div className="shop-page__stat">
                <ShoppingBag size={16} />
                <span>Đã bán <strong>{profile.soldCount}</strong></span>
              </div>
              <div className="shop-page__stat-divider" />
              <div className="shop-page__stat">
                <Star size={16} fill="#fcd34d" color="#fcd34d" />
                <span><strong>{profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'Chưa có'}</strong> ({profile.reviewCount} đánh giá)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────── */}
      <div className="shop-page__tabs">
        <div className="shop-page__tabs-inner">
          <button 
            className={`shop-page__tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Store size={18} />
            Sản phẩm
          </button>
          <button 
            className={`shop-page__tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={18} />
            Đánh giá
          </button>
        </div>
      </div>

      <div className="shop-page__body">
        {activeTab === 'products' ? (
          <>
            {loadingProducts ? (
              <div className="shop-page__loading">Đang tải sản phẩm...</div>
            ) : products.length === 0 ? (
              <div className="shop-page__empty">Shop chưa có sản phẩm nào.</div>
            ) : (
              <>
                <div className="shop-page__grid">
                  {products.map(product => (
                    <Link
                      key={product.id}
                      to={PATHS.productDetail.replace(':id', String(product.id))}
                      className="shop-page__card"
                    >
                      <div className="shop-page__card-img">
                        {product.imageUrls?.[0] ? (
                          <>
                            <img src={product.imageUrls[0]} alt={product.name} className="primary" />
                            {product.imageUrls[1] && (
                              <img src={product.imageUrls[1]} alt={product.name} className="secondary" />
                            )}
                          </>
                        ) : (
                          <div className="shop-page__card-placeholder">
                            <Package size={32} />
                          </div>
                        )}
                        {product.conditionPercentage && (
                          <span className="shop-page__card-badge">{product.conditionPercentage}%</span>
                        )}
                      </div>
                      <div className="shop-page__card-body">
                        <h4 className="shop-page__card-name">{product.name}</h4>
                        <span className="shop-page__card-price">{formatPrice(product.price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="shop-page__pagination">
                    <button
                      className="shop-page__page-btn"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                    >
                      ← Trước
                    </button>
                    <span className="shop-page__page-info">Trang {page + 1} / {totalPages}</span>
                    <button
                      className="shop-page__page-btn"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Tiếp →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="shop-page__reviews-section">
            <div className="shop-page__reviews-header">
              <h3>Đánh giá từ người mua</h3>
              {user && user.id !== Number(sellerId) && (
                <button className="shop-page__write-review-btn" onClick={() => setIsReviewModalOpen(true)}>
                  Viết đánh giá
                </button>
              )}
            </div>

            {loadingReviews ? (
              <div className="shop-page__loading">Đang tải đánh giá...</div>
            ) : reviews.length === 0 ? (
              <div className="shop-page__empty">Chưa có đánh giá nào cho shop này.</div>
            ) : (
              <div className="shop-page__review-list">
                {reviews.map(review => (
                  <div key={review.id} className="shop-page__review-item">
                    <div className="shop-page__review-avatar">
                      {review.reviewerAvatarUrl ? (
                        <img src={review.reviewerAvatarUrl} alt={review.reviewerName} />
                      ) : (
                        <span>{review.reviewerName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="shop-page__review-content">
                      <div className="shop-page__review-meta">
                        <strong>{review.reviewerName}</strong>
                        <span className="shop-page__review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="shop-page__review-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={14} fill={star <= review.rating ? '#fcd34d' : 'transparent'} color={star <= review.rating ? '#fcd34d' : '#cbd5e1'} />
                        ))}
                      </div>
                      <p className="shop-page__review-text">{review.comment}</p>
                    </div>
                  </div>
                ))}

                {reviewsTotalPages > 1 && (
                  <div className="shop-page__pagination">
                    <button
                      className="shop-page__page-btn"
                      disabled={reviewsPage === 0}
                      onClick={() => setReviewsPage(p => p - 1)}
                    >
                      ← Trước
                    </button>
                    <span className="shop-page__page-info">Trang {reviewsPage + 1} / {reviewsTotalPages}</span>
                    <button
                      className="shop-page__page-btn"
                      disabled={reviewsPage >= reviewsTotalPages - 1}
                      onClick={() => setReviewsPage(p => p + 1)}
                    >
                      Tiếp →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="shop-page__modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="shop-page__modal" onClick={e => e.stopPropagation()}>
            <button className="shop-page__modal-close" onClick={() => setIsReviewModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="shop-page__modal-title">Đánh giá Shop</h3>
            <form onSubmit={submitReview}>
              <div className="shop-page__rating-input">
                <label>Chất lượng shop:</label>
                <div className="shop-page__stars-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={28} 
                      fill={star <= reviewRating ? '#fcd34d' : 'transparent'} 
                      color={star <= reviewRating ? '#fcd34d' : '#cbd5e1'} 
                      onClick={() => setReviewRating(star)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
              <div className="shop-page__comment-input">
                <label>Bình luận của bạn:</label>
                <textarea 
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn khi mua hàng từ shop này..."
                  rows={4}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="shop-page__submit-review-btn" 
                disabled={submittingReview}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
