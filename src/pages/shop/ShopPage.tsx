import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { axiosClient } from '../../api/axiosClient'
import productsApi, { type Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import type { RootState } from '../../store'
import { Package, ShoppingBag, Store, Star, MessageSquare, X, ChevronLeft, ChevronRight } from 'lucide-react'
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
      <div className="shop-page-premium">
        <div className="shop-page__loading">Đang tải thông tin shop...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="shop-page-premium">
        <div className="shop-page__error">Không tìm thấy shop này.</div>
      </div>
    )
  }

  return (
    <div className="shop-page-premium">
      {/* ── PREMIUM HERO BANNER ──────────────────────────────── */}
      <div className="shop-premium__hero">
        <div className="shop-premium__hero-bg">
          {/* Decorative blurred blobs for modern feel */}
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
      </div>

      <div className="shop-premium__container">
        {/* ── GLASSMORPHISM PROFILE CARD ──────────────────────── */}
        <div className="shop-premium__profile-card">
          <div className="shop-premium__avatar-wrapper">
            <div className="shop-premium__avatar">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} />
              ) : (
                <span>{profile.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
          
          <div className="shop-premium__profile-info">
            <h1 className="shop-premium__name">{profile.displayName}</h1>
            
            <div className="shop-premium__stats-row">
              <div className="shop-premium__stat-item">
                <div className="stat-icon"><Package size={16} /></div>
                <div className="stat-data">
                  <span className="stat-val">{profile.productCount}</span>
                  <span className="stat-label">Sản phẩm</span>
                </div>
              </div>
              <div className="stat-divider"></div>
              
              <div className="shop-premium__stat-item">
                <div className="stat-icon"><ShoppingBag size={16} /></div>
                <div className="stat-data">
                  <span className="stat-val">{profile.soldCount}</span>
                  <span className="stat-label">Đã bán</span>
                </div>
              </div>
              <div className="stat-divider"></div>
              
              <div className="shop-premium__stat-item">
                <div className="stat-icon rating-icon"><Star size={16} fill="currentColor" /></div>
                <div className="stat-data">
                  <span className="stat-val rating-val">
                    {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'Mới'}
                  </span>
                  <span className="stat-label">{profile.reviewCount} đánh giá</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PREMIUM TABS ─────────────────────────────── */}
        <div className="shop-premium__tabs-wrapper">
          <div className="shop-premium__tabs">
            <button 
              className={`shop-premium__tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Store size={18} />
              <span>Sản phẩm</span>
              {activeTab === 'products' && <div className="tab-indicator" />}
            </button>
            <button 
              className={`shop-premium__tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageSquare size={18} />
              <span>Đánh giá</span>
              {activeTab === 'reviews' && <div className="tab-indicator" />}
            </button>
          </div>
        </div>

        {/* ── CONTENT AREA ─────────────────────────────── */}
        <div className="shop-premium__content">
          {activeTab === 'products' ? (
            <div className="shop-premium__products-section fade-in">
              {loadingProducts ? (
                <div className="shop-premium__loading">
                  <div className="spinner"></div>
                  <p>Đang tải sản phẩm...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="shop-premium__empty">
                  <Package size={48} opacity={0.2} />
                  <p>Shop chưa có sản phẩm nào.</p>
                </div>
              ) : (
                <>
                  <div className="shop-premium__grid">
                    {products.map(product => (
                      <Link
                        key={product.id}
                        to={PATHS.productDetail.replace(':id', String(product.id))}
                        className="shop-premium__card group"
                      >
                        <div className="shop-premium__card-image-wrap">
                          {product.imageUrls?.[0] ? (
                            <>
                              <img src={product.imageUrls[0]} alt={product.name} className="primary-img" />
                              {product.imageUrls[1] && (
                                <img src={product.imageUrls[1]} alt={product.name} className="secondary-img" />
                              )}
                            </>
                          ) : (
                            <div className="img-placeholder"><Package size={32} /></div>
                          )}
                          {product.conditionPercentage && (
                            <div className="condition-badge">
                              {product.conditionPercentage}% MỚI
                            </div>
                          )}
                        </div>
                        <div className="shop-premium__card-info">
                          <h4 className="product-title">{product.name}</h4>
                          <div className="product-price">{formatPrice(product.price)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Modern Pagination */}
                  {totalPages > 1 && (
                    <div className="shop-premium__pagination">
                      <button
                        className="btn-page"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="page-indicator">Trang {page + 1} / {totalPages}</span>
                      <button
                        className="btn-page"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="shop-premium__reviews-section fade-in">
              <div className="reviews-header">
                <h2>Khách hàng nói gì về shop</h2>
                {user && user.id !== Number(sellerId) && (
                  <button className="btn-write-review" onClick={() => setIsReviewModalOpen(true)}>
                    <MessageSquare size={16} />
                    <span>Viết đánh giá</span>
                  </button>
                )}
              </div>

              {loadingReviews ? (
                <div className="shop-premium__loading">
                  <div className="spinner"></div>
                  <p>Đang tải đánh giá...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="shop-premium__empty">
                  <MessageSquare size={48} opacity={0.2} />
                  <p>Chưa có đánh giá nào cho shop này.</p>
                </div>
              ) : (
                <div className="shop-premium__review-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-avatar">
                        {review.reviewerAvatarUrl ? (
                          <img src={review.reviewerAvatarUrl} alt={review.reviewerName} />
                        ) : (
                          <span>{review.reviewerName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="review-body">
                        <div className="review-meta">
                          <strong className="reviewer-name">{review.reviewerName}</strong>
                          <span className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="review-stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={14} 
                              fill={star <= review.rating ? '#f59e0b' : 'transparent'} 
                              color={star <= review.rating ? '#f59e0b' : '#e2e8f0'} 
                            />
                          ))}
                        </div>
                        <p className="review-text">{review.comment}</p>
                      </div>
                    </div>
                  ))}

                  {reviewsTotalPages > 1 && (
                    <div className="shop-premium__pagination">
                      <button
                        className="btn-page"
                        disabled={reviewsPage === 0}
                        onClick={() => setReviewsPage(p => p - 1)}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="page-indicator">Trang {reviewsPage + 1} / {reviewsTotalPages}</span>
                      <button
                        className="btn-page"
                        disabled={reviewsPage >= reviewsTotalPages - 1}
                        onClick={() => setReviewsPage(p => p + 1)}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── PREMIUM REVIEW MODAL ──────────────────────────────── */}
      {isReviewModalOpen && (
        <div className="shop-premium__modal-overlay fade-in" onClick={() => setIsReviewModalOpen(false)}>
          <div className="shop-premium__modal scale-up" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsReviewModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="modal-header">
              <h3>Đánh giá Shop</h3>
              <p>Trải nghiệm mua hàng của bạn như thế nào?</p>
            </div>
            
            <form onSubmit={submitReview} className="modal-form">
              <div className="form-group">
                <label>Chất lượng dịch vụ</label>
                <div className="stars-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={32} 
                      fill={star <= reviewRating ? '#f59e0b' : 'transparent'} 
                      color={star <= reviewRating ? '#f59e0b' : '#cbd5e1'} 
                      onClick={() => setReviewRating(star)}
                      className="star-interactive"
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Nhận xét chi tiết</label>
                <textarea 
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Hãy chia sẻ thêm về trải nghiệm mua hàng của bạn..."
                  rows={4}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-submit-review" 
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <><span className="spinner-small"></span> Đang gửi...</>
                ) : (
                  'Gửi Đánh Giá'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
