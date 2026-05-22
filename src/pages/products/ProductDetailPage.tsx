import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import productsApi, { type Product } from '../../api/products/productsApi'
import cartApi from '../../api/cart/cartApi'
import { PATHS } from '../../routes/paths'
import type { RootState } from '../../store'
import '../../styles/pages/productDetail.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [mainImage, setMainImage] = useState('')
  const [similar, setSimilar] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const categoryLink = useMemo(() => {
    if (!product?.category) return PATHS.home
    if (product.category === 'Nữ') return PATHS.women
    if (product.category === 'Nam') return PATHS.men
    return PATHS.home
  }, [product?.category])

  useEffect(() => {
    if (!id) return
    const fetchProduct = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await productsApi.getProductById(Number(id))
        setProduct(response.data)
        setMainImage(response.data.imageUrls?.[0] ?? '')

        if (response.data.category) {
          const similarResponse = await productsApi.getProducts({
            category: response.data.category,
            page: 0,
            sizePage: 4,
          })
          const filtered = similarResponse.data.content.filter((item) => item.id !== response.data.id)
          setSimilar(filtered)
        } else {
          setSimilar([])
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể tải sản phẩm'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return <section className="product-detail">Đang tải sản phẩm...</section>
  }

  if (error || !product) {
    return <section className="product-detail">{error || 'Không tìm thấy sản phẩm'}</section>
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate(PATHS.login)
      return
    }
    if (!product) return
    setAdding(true)
    try {
      await cartApi.addItem({ productId: product.id, quantity: 1 })
    } catch {
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="product-detail">
      <nav className="product-detail__breadcrumbs">
        <Link to={PATHS.home}>Trang chủ</Link>
        <span>/</span>
        <Link to={categoryLink}>{product.category}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-detail__content">
        <div className="product-detail__gallery">
          <div className="product-detail__thumbs">
            {(product.imageUrls ?? []).map((url) => (
              <button
                key={url}
                type="button"
                className={`product-detail__thumb${mainImage === url ? ' is-active' : ''}`}
                onClick={() => setMainImage(url)}
              >
                <img src={url} alt={product.name} />
              </button>
            ))}
          </div>
          <div className="product-detail__main">
            {mainImage ? <img src={mainImage} alt={product.name} /> : null}
          </div>
        </div>

        <aside className="product-detail__info">
          <div className="product-detail__price">{formatPrice(product.price)}</div>
          <div className="product-detail__meta">
            <span className="product-detail__badge">Size {product.sizes?.[0] || 'Free'}</span>
            <span className="product-detail__status">Tình trạng: Khá tốt</span>
          </div>
          <div className="product-detail__actions">
            <button type="button" className="product-detail__buy">Mua ngay</button>
            <button
              type="button"
              className="product-detail__cart"
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </button>
          </div>

          <div className="product-detail__divider" />
          <div className="product-detail__section">
            <h3>Miêu tả sản phẩm</h3>
            <p>{product.description || 'Sản phẩm thời trang tinh tế, phù hợp nhiều phong cách.'}</p>
            <ul>
              <li>Danh mục: {product.category}</li>
              <li>Thương hiệu: {product.brand}</li>
              <li>Phong cách: {product.style || 'Tinh tế'} </li>
            </ul>
          </div>
          <div className="product-detail__benefits">
            <div>
              <strong>Giao hàng & Trả hàng</strong>
              <span>Miễn phí trên 500k</span>
            </div>
            <div>
              <strong>Bảo hành 12 tháng</strong>
              <span>Đã đặt cam kết</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="product-detail__similar">
        <h2>Sản phẩm tương tự</h2>
        <div className="product-detail__similar-grid">
          {similar.length > 0 ? (
            similar.map((item) => (
              <Link
                key={item.id}
                to={PATHS.productDetail.replace(':id', String(item.id))}
                className="product-detail__card"
              >
                <div className="product-detail__card-image">
                  {item.imageUrls?.[0] ? <img src={item.imageUrls[0]} alt={item.name} /> : null}
                </div>
                <div className="product-detail__card-body">
                  <h4>{item.name}</h4>
                  <span>{formatPrice(item.price)}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="product-detail__empty">Chưa có sản phẩm tương tự</div>
          )}
        </div>
      </div>
    </section>
  )
}
