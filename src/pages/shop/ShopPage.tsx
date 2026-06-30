import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { axiosClient } from '../../api/axiosClient'
import productsApi, { type Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import type { RootState } from '../../store'
import { Package, ShoppingBag, Star, Store, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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
    if (sellerId === 'official') {
      setProfile({
        id: 0,
        displayName: 'TWINL Official',
        avatarUrl: '', // Will use 'T'
        productCount: 0,
        soldCount: 0,
        averageRating: 0,
        reviewCount: 0
      })
      setLoadingProfile(false)
      return
    }
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
        const res = await productsApi.getProducts({ page, sizePage: 50 })
        const all = res.data.content.filter((p: Product) => {
          if (sellerId === 'official') return !p.sellerId || !p.sellerName
          return p.sellerId === Number(sellerId)
        })
        setProducts(all)
        setTotalPages(Math.ceil(all.length / 12) || 1)
        if (sellerId === 'official') {
          setProfile(prev => prev ? { ...prev, productCount: all.length } : null)
        }
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
    if (sellerId === 'official') {
      setReviews([]) // Official store has no regular reviews yet
      setLoadingReviews(false)
      return
    }
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
    if (sellerId === 'official') {
      toast.info('Tính năng đánh giá hệ thống đang được cập nhật.')
      return
    }
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
    return <div className="shop-page__loading">Đang tải thông tin...</div>
  }

  if (!profile) {
    return <div className="shop-page__error">Không tìm thấy thông tin.</div>
  }

  return (
    <div className="shop-page">
      <div className="shop-page__container">
        
        {/* ── HEADER BÁN HÀNG THEO YÊU CẦU ──────────────────────────────── */}
        <div className="shop-page__seller-card">
          <div className="shop-page__seller-avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} />
            ) : (
              <span>{profile.displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="shop-page__seller-info">
            <h1 className="shop-page__seller-name">{profile.displayName}</h1>
            
            <div className="shop-page__seller-stats">
              <div className="shop-page__seller-stat">
                <Package size={12} />
                <span>{profile.productCount} SẢN PHẨM</span>
              </div>
              <span className="shop-page__seller-stats-dot" />
              <div className="shop-page__seller-stat">
                <ShoppingBag size={12} />
                <span>ĐÃ BÁN {profile.soldCount}</span>
              </div>
              <span className="shop-page__seller-stats-dot" />
              <div className="shop-page__seller-stat">
                <Star size={12} fill={profile.averageRating > 0 ? "currentColor" : "none"} />
                <span>
                  {profile.averageRating > 0 ? `${profile.averageRating.toFixed(1)} ĐÁNH GIÁ` : 'CHƯA CÓ (ĐÁNH GIÁ)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION: SẢN PHẨM CỦA SHOP ──────────────────────────────── */}
        <div className="shop-page__section-header">
          <Store size={18} />
          <h2>Sản phẩm của shop</h2>
        </div>

        <div className="shop-page__tabs">
          <button 
            className={`shop-page__tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Sản phẩm
          </button>
          <button 
            className={`shop-page__tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Đánh giá
          </button>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <div className="shop-page__main">
          {activeTab === 'products' ? (
            <div className="shop-page__fade-in">
              {loadingProducts ? (
                <div className="shop-page__loading">Đang tải sản phẩm...</div>
              ) : products.length === 0 ? (
                <div className="shop-page__empty">Chưa có sản phẩm nào.</div>
              ) : (
                <>
                  <div className="shop-page__grid">
                    {products.map(product => (
                      <Link
                        key={product.id}
                        to={PATHS.productDetail.replace(':id', String(product.id))}
                        className="shop-page__card"
                      >
                        <div className="shop-page__card-image-wrap">
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
                              {product.conditionPercentage}% MỚI
                            </div>
                          )}
                        </div>
                        <div className="shop-page__card-info">
                          <h4 className="product-title">{product.name}</h4>
                          <div className="product-price">{formatPrice(product.price)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="shop-page__pagination">
                      <button
                        className="btn-page"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="page-indicator">{page + 1} / {totalPages}</span>
                      <button
                        className="btn-page"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="shop-page__fade-in">
              <div className="reviews-header">
                <h2>Đánh giá từ khách hàng</h2>
                {user && user.id !== Number(sellerId) && (
                  <button className="btn-editorial" onClick={() => setIsReviewModalOpen(true)}>
                    <span>VIẾT ĐÁNH GIÁ</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {loadingReviews ? (
                <div className="shop-page__loading">Đang tải đánh giá...</div>
              ) : reviews.length === 0 ? (
                <div className="shop-page__empty">Chưa có đánh giá nào.</div>
              ) : (
                <div className="shop-page__review-list">
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
                              fill={star <= review.rating ? '#f59e0b' : 'transparent'} 
                              color={star <= review.rating ? '#f59e0b' : '#cbd5e1'} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))}

                  {reviewsTotalPages > 1 && (
                    <div className="shop-page__pagination">
                      <button
                        className="btn-page"
                        disabled={reviewsPage === 0}
                        onClick={() => setReviewsPage(p => p - 1)}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="page-indicator">{reviewsPage + 1} / {reviewsTotalPages}</span>
                      <button
                        className="btn-page"
                        disabled={reviewsPage >= reviewsTotalPages - 1}
                        onClick={() => setReviewsPage(p => p + 1)}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── REVIEW MODAL ──────────────────────────────── */}
      {isReviewModalOpen && (
        <div className="shop-page__modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="shop-page__modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsReviewModalOpen(false)}>
              <X size={24} />
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
                      fill={star <= reviewRating ? '#f59e0b' : 'transparent'} 
                      color={star <= reviewRating ? '#f59e0b' : '#cbd5e1'} 
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
                className="btn-submit" 
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
