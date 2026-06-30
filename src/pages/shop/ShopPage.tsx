import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { axiosClient } from '../../api/axiosClient'
import productsApi, { type Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import type { RootState } from '../../store'
import { Star, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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
      <div className="shop-page-minimal">
        <div className="shop-min__loading">Đang tải thông tin...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="shop-page-minimal">
        <div className="shop-min__error">Không tìm thấy thông tin.</div>
      </div>
    )
  }

  return (
    <div className="shop-page-minimal">
      {/* ── MINIMALIST EDITORIAL HEADER ──────────────────────────────── */}
      <header className="shop-min__header">
        <div className="shop-min__container">
          <div className="shop-min__header-inner">
            <div className="shop-min__avatar-wrapper">
              <div className="shop-min__avatar">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName} />
                ) : (
                  <span>{profile.displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            <div className="shop-min__profile-info">
              <p className="shop-min__subtitle">OFFICIAL CURATOR</p>
              <h1 className="shop-min__name">{profile.displayName}</h1>
              
              <div className="shop-min__stats-row">
                <div className="shop-min__stat">
                  <span className="stat-val">{profile.productCount}</span>
                  <span className="stat-label">SẢN PHẨM</span>
                </div>
                <div className="stat-divider"></div>
                <div className="shop-min__stat">
                  <span className="stat-val">{profile.soldCount}</span>
                  <span className="stat-label">ĐÃ BÁN</span>
                </div>
                <div className="stat-divider"></div>
                <div className="shop-min__stat">
                  <span className="stat-val">
                    {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : '—'}
                  </span>
                  <span className="stat-label">{profile.reviewCount} ĐÁNH GIÁ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── EDITORIAL TABS ─────────────────────────────── */}
      <div className="shop-min__tabs-container">
        <div className="shop-min__container">
          <div className="shop-min__tabs">
            <button 
              className={`shop-min__tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              ARCHIVE
            </button>
            <button 
              className={`shop-min__tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              REVIEWS
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ─────────────────────────────── */}
      <main className="shop-min__main">
        <div className="shop-min__container">
          {activeTab === 'products' ? (
            <div className="shop-min__fade-in">
              {loadingProducts ? (
                <div className="shop-min__loading">LOADING ARCHIVE...</div>
              ) : products.length === 0 ? (
                <div className="shop-min__empty">No items available.</div>
              ) : (
                <>
                  <div className="shop-min__grid">
                    {products.map(product => (
                      <Link
                        key={product.id}
                        to={PATHS.productDetail.replace(':id', String(product.id))}
                        className="shop-min__card group"
                      >
                        <div className="shop-min__card-image-wrap">
                          {product.imageUrls?.[0] ? (
                            <>
                              <img src={product.imageUrls[0]} alt={product.name} className="primary-img" />
                              {product.imageUrls[1] && (
                                <img src={product.imageUrls[1]} alt={product.name} className="secondary-img" />
                              )}
                            </>
                          ) : (
                            <div className="img-placeholder">NO IMAGE</div>
                          )}
                          {product.conditionPercentage && (
                            <div className="condition-badge">
                              {product.conditionPercentage}%
                            </div>
                          )}
                        </div>
                        <div className="shop-min__card-info">
                          <h4 className="product-title">{product.name}</h4>
                          <div className="product-price">{formatPrice(product.price)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="shop-min__pagination">
                      <button
                        className="btn-page"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                      >
                        <ChevronLeft size={18} strokeWidth={1.5} />
                      </button>
                      <span className="page-indicator">{page + 1} / {totalPages}</span>
                      <button
                        className="btn-page"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                      >
                        <ChevronRight size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="shop-min__fade-in">
              <div className="reviews-header">
                <h2 className="reviews-title">CLIENT FEEDBACK</h2>
                {user && user.id !== Number(sellerId) && (
                  <button className="btn-editorial" onClick={() => setIsReviewModalOpen(true)}>
                    <span>VIẾT ĐÁNH GIÁ</span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>

              {loadingReviews ? (
                <div className="shop-min__loading">LOADING REVIEWS...</div>
              ) : reviews.length === 0 ? (
                <div className="shop-min__empty">Chưa có đánh giá nào.</div>
              ) : (
                <div className="shop-min__review-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-meta">
                        <div className="review-avatar">
                          {review.reviewerAvatarUrl ? (
                            <img src={review.reviewerAvatarUrl} alt={review.reviewerName} />
                          ) : (
                            <span>{review.reviewerName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="review-meta-text">
                          <strong className="reviewer-name">{review.reviewerName}</strong>
                          <span className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="review-stars-wrap">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={12} 
                              fill={star <= review.rating ? '#0a0a0a' : 'transparent'} 
                              color="#0a0a0a" 
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))}

                  {reviewsTotalPages > 1 && (
                    <div className="shop-min__pagination">
                      <button
                        className="btn-page"
                        disabled={reviewsPage === 0}
                        onClick={() => setReviewsPage(p => p - 1)}
                      >
                        <ChevronLeft size={18} strokeWidth={1.5} />
                      </button>
                      <span className="page-indicator">{reviewsPage + 1} / {reviewsTotalPages}</span>
                      <button
                        className="btn-page"
                        disabled={reviewsPage >= reviewsTotalPages - 1}
                        onClick={() => setReviewsPage(p => p + 1)}
                      >
                        <ChevronRight size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── EDITORIAL REVIEW MODAL ──────────────────────────────── */}
      {isReviewModalOpen && (
        <div className="shop-min__modal-overlay fade-in" onClick={() => setIsReviewModalOpen(false)}>
          <div className="shop-min__modal scale-up" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsReviewModalOpen(false)}>
              <X size={24} strokeWidth={1} />
            </button>
            <div className="modal-header">
              <h3>Đánh giá Dịch vụ</h3>
            </div>
            
            <form onSubmit={submitReview} className="modal-form">
              <div className="form-group">
                <div className="stars-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={28} 
                      fill={star <= reviewRating ? '#0a0a0a' : 'transparent'} 
                      color="#0a0a0a" 
                      strokeWidth={1}
                      onClick={() => setReviewRating(star)}
                      className="star-interactive"
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <textarea 
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Viết trải nghiệm của bạn..."
                  rows={4}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-submit-editorial" 
                disabled={submittingReview}
              >
                {submittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
