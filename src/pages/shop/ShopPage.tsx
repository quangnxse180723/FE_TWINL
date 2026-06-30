import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { axiosClient } from '../../api/axiosClient'
import productsApi, { type Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import { Package, ShoppingBag, Store } from 'lucide-react'

import './ShopPage.css'

interface SellerProfile {
  id: number
  displayName: string
  avatarUrl?: string
  productCount: number
  soldCount: number
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ')

export default function ShopPage() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    if (!sellerId) return
    const fetchProfile = async () => {
      setLoadingProfile(true)
      try {
        const res = await axiosClient.get<SellerProfile>(`/api/sellers/${sellerId}/profile`)
        setProfile(res.data)
      } catch {
        setProfile(null)
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [sellerId])

  useEffect(() => {
    if (!sellerId) return
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const res = await productsApi.getProducts({ page, sizePage: 12 })
        // Filter by seller - until backend supports it via query param
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
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUCTS GRID ─────────────────────────────── */}
      <div className="shop-page__body">
        <div className="shop-page__section-title">
          <Store size={18} />
          <span>Sản phẩm của shop</span>
        </div>

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
      </div>
    </div>
  )
}
