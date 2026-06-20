import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import productsApi, { type Product } from '../../api/products/productsApi'
import cartApi from '../../api/cart/cartApi'
import { PATHS } from '../../routes/paths'
import type { RootState } from '../../store'
import { Shield, CheckCircle2, Truck, ShieldCheck } from 'lucide-react'
import AiScannerModal from '../../components/shared/AiScannerModal'
import LegitCheckModal from '../../components/shared/LegitCheckModal'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import '../../styles/pages/productDetail.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('?', 'd')

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [mainImage, setMainImage] = useState('')
  const [similar, setSimilar] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [isLegitModalOpen, setIsLegitModalOpen] = useState(false)
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const categoryLink = useMemo(() => {
    if (!product?.category) return PATHS.home
    if (product.category === 'N?') return PATHS.women
    if (product.category === 'Nam') return PATHS.men
    if (product.category === 'Tr? em') return PATHS.kids
    if (product.category === 'Th? thao') return PATHS.sport
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
        const message = err instanceof Error ? err.message : 'Không th? t?i s?n ph?m'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return <section className="product-detail">Ðang t?i s?n ph?m...</section>
  }

  if (error || !product) {
    return <section className="product-detail">{error || 'Không tìm th?y s?n ph?m'}</section>
  }

  const handleBuyNow = async () => {
    if (!user) {
      navigate(PATHS.login)
      return
    }
    if (!product) return
    setAdding(true)
    try {
      await cartApi.addItem({ productId: product.id, quantity: quantity })
      window.dispatchEvent(new Event('cart-updated'))
      navigate(PATHS.cart)
    } catch {
      toast.error('Không th? thêm vào gi? hàng')
    } finally {
      setAdding(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Vui lòng dang nh?p d? thêm vào gi? hàng')
      navigate(PATHS.login)
      return
    }
    if (!product) return
    setAdding(true)
    try {
      await cartApi.addItem({ productId: product.id, quantity: quantity })
      window.dispatchEvent(new Event('cart-updated'))
      toast.success('Ðã thêm vào gi? hàng thành công')
    } catch {
      toast.error('Không th? thêm vào gi? hàng')
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="product-detail">
      <nav className="product-detail__breadcrumbs">
        <Link to={PATHS.home}>Trang ch?</Link>
        <span>&gt;</span>
        <Link to={categoryLink}>{product.category || 'Danh m?c'}</Link>
        <span>&gt;</span>
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
            {mainImage && (
              <div className="product-detail__ai-actions">
                <button 
                  type="button" 
                  className="ai-scan-direct-btn"
                  onClick={() => setIsAiModalOpen(true)}
                  title="Phân tích ?nh này b?ng AI"
                >
                  <CheckCircle2 size={16} />
                  <span>Quét AI</span>
                </button>
                <button 
                  type="button" 
                  className="ai-legit-btn"
                  onClick={() => setIsLegitModalOpen(true)}
                  title="Ki?m d?nh chính hãng b?ng AI"
                >
                  <Shield size={16} />
                  <span>Ki?m d?nh AI</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="product-detail__info">
          <div className="product-detail__title">
            <h1>{product.name}</h1>
          </div>
          <div className="product-detail__price">{formatPrice(product.price)}</div>
          
          <div className="product-detail__meta-badges">
            <span className="product-detail__badge product-detail__badge--size">
              Size {product.sizes?.[0] || 'M'}
            </span>
            {product.conditionPercentage && (
              <span className="product-detail__badge product-detail__badge--condition">
                Ð? m?i: {product.conditionPercentage}%
              </span>
            )}
            {product.defects && product.defects.length > 0 && product.defects[0] !== 'MINT' && (
              <span className="product-detail__badge product-detail__badge--defect">
                L?i: {product.defects.map(d => {
                  const defectLabels: Record<string, string> = {
                    'MINOR_FLAW': 'S?n nh?',
                    'STAINED': 'B?n/? vàng',
                    'MISSING_BUTTON': 'M?t cúc',
                    'TORN': 'Rách nh?',
                    'FADED': 'Phai màu'
                  };
                  return defectLabels[d] || d;
                }).join(', ')}
              </span>
            )}
            {product.defects && product.defects.includes('MINT') && (
              <span className="product-detail__badge product-detail__badge--mint">
                Không l?i (MINT)
              </span>
            )}
          </div>
          
          <div className={`product-detail__status ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
            <CheckCircle2 size={16} />
            <span>Tình tr?ng: {product.stock === 0 ? 'H?t hàng' : 'Còn hàng'}</span>
          </div>

          <div className="product-detail__attributes">
            <div>Màu s?c: <span>{product.colors?.length ? product.colors.join(', ') : 'Chua c?p nh?t'}</span></div>
            <div>Thuong hi?u: <span>{product.brand || 'Chua c?p nh?t'}</span></div>
          </div>

          <div className="product-detail__quantity">
            <span>S? lu?ng:</span>
            <div className="product-detail__qty-controls">
              <button
                type="button"
                className="product-detail__qty-btn"
                disabled={quantity <= 1 || product.stock === 0}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                -
              </button>
              <div className="product-detail__qty-value">{quantity}</div>
              <button
                type="button"
                className="product-detail__qty-btn"
                disabled={quantity >= (product.stock || 1) || product.stock === 0}
                onClick={() => setQuantity(q => Math.min(product.stock || 1, q + 1))}
              >
                +
              </button>
            </div>
            <span>{product.stock || 1} s?n ph?m có s?n</span>
          </div>

          <div className="product-detail__actions">
            <button
              type="button"
              className="product-detail__buy"
              onClick={handleBuyNow}
              disabled={adding || product.stock === 0}
            >
              {product.stock === 0 ? t('product.out_of_stock') : (adding ? 'Ðang x? lý...' : 'Mua Ngay')}
            </button>
            <button
              type="button"
              className="product-detail__cart"
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
            >
              {product.stock === 0 ? t('product.out_of_stock') : (adding ? t('product.adding') : 'Thêm Vào Gi? Hàng')}
            </button>
          </div>

          <div className="product-detail__divider" />
          
          <div className="product-detail__section">
            <h3>MÔ T? S?N PH?M</h3>
            <p>{product.description || 'S?n ph?m th?i trang secondhand du?c tuy?n ch?n k? lu?ng, mang d?n phong cách d?c dáo và ch?t lu?ng vu?t tr?i.'}</p>
            <ul>
              <li>Danh m?c: {product.category}</li>
              <li>Thuong hi?u: {product.brand || 'Khác'}</li>
              <li>Phong cách: {product.style || 'Casual, Streetwear'}</li>
            </ul>
          </div>
          
          <div className="product-detail__benefits">
            <div className="product-detail__benefits-card">
              <Truck size={24} />
              <strong>Giao Hàng & Tr? Hàng</strong>
              <span>Mi?n phí trên 500k</span>
            </div>
            <div className="product-detail__benefits-card">
              <ShieldCheck size={24} />
              <strong>B?o Hành 48 gi?</strong>
              <span>Ðã d?t cam k?t</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="product-detail__similar">
        <h2>S?n Ph?m Liên Quan</h2>
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
            <div className="product-detail__empty">Chua có s?n ph?m tuong t?</div>
          )}
        </div>
      </div>

      <AiScannerModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        directScanImageUrls={product.imageUrls ?? []}
      />
      <LegitCheckModal
        isOpen={isLegitModalOpen}
        onClose={() => setIsLegitModalOpen(false)}
        productImageUrls={product.imageUrls ?? []}
      />
    </section>
  )
}