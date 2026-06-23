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

import '../../styles/pages/productDetail.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ')

export default function ProductDetailPage() {
  
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
    if (product.category === 'Nữ') return PATHS.women
    if (product.category === 'Nam') return PATHS.men
    if (product.category === 'Thể thao') return PATHS.sport
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

  const handleBuyNow = async () => {
    if (!user) {
      navigate(PATHS.login)
      return
    }
    if (!product) return
    setAdding(true)
    try {
      // Lấy giỏ hàng trước để kiểm tra tồn kho, tránh tạo ra lỗi 400 Bad Request ở Console
      const cartRes = await cartApi.getCart();
      const inCartItem = cartRes.data.items.find((item: any) => item.productId === product.id);
      const currentQtyInCart = inCartItem ? inCartItem.quantity : 0;
      
      if (currentQtyInCart + quantity > (product.stock || 0)) {
        if (currentQtyInCart > 0) {
          // Nếu đã có sẵn ở mức tối đa rồi thì chuyển luôn qua giỏ hàng
          navigate(PATHS.cart);
        } else {
          toast.error('Vượt quá số lượng tồn kho');
        }
        return;
      }

      await cartApi.addItem({ productId: product.id, quantity: quantity })
      window.dispatchEvent(new Event('cart-updated'))
      navigate(PATHS.cart)
    } catch {
      toast.error('Không thể thêm vào giỏ hàng')
    } finally {
      setAdding(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng')
      navigate(PATHS.login)
      return
    }
    if (!product) return
    setAdding(true)
    try {
      // Lấy giỏ hàng trước để kiểm tra tồn kho
      const cartRes = await cartApi.getCart();
      const inCartItem = cartRes.data.items.find((item: any) => item.productId === product.id);
      const currentQtyInCart = inCartItem ? inCartItem.quantity : 0;
      
      if (currentQtyInCart + quantity > (product.stock || 0)) {
        toast.error('Sản phẩm trong giỏ hàng đã đạt giới hạn tồn kho');
        return;
      }

      await cartApi.addItem({ productId: product.id, quantity: quantity })
      window.dispatchEvent(new Event('cart-updated'))
      toast.success('Đã thêm vào giỏ hàng thành công')
    } catch {
      toast.error('Không thể thêm vào giỏ hàng')
    } finally {
      setAdding(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    e.currentTarget.style.setProperty('--x', `${x}%`)
    e.currentTarget.style.setProperty('--y', `${y}%`)
  }

  return (
    <section className="product-detail">
      <nav className="product-detail__breadcrumbs">
        <Link to={PATHS.home}>Trang chủ</Link>
        <span>&gt;</span>
        <Link to={categoryLink}>{product.category || 'Danh mục'}</Link>
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
          <div 
            className="product-detail__main zoom-container"
            onMouseMove={handleMouseMove}
          >
            {mainImage ? <img src={mainImage} alt={product.name} className="zoom-image" /> : null}
            {mainImage && (
              <div className="product-detail__ai-actions">
                <button 
                  type="button" 
                  className="ai-scan-direct-btn"
                  onClick={() => setIsAiModalOpen(true)}
                  title="Phân tích ảnh này bằng AI"
                >
                  <CheckCircle2 size={16} />
                  <span>Quét AI</span>
                </button>
                <button 
                  type="button" 
                  className="ai-legit-btn"
                  onClick={() => setIsLegitModalOpen(true)}
                  title="Kiểm định chính hãng bằng AI"
                >
                  <Shield size={16} />
                  <span>Kiểm định AI</span>
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
                Độ mới: {product.conditionPercentage}%
              </span>
            )}
            {product.defects && product.defects.length > 0 && product.defects[0] !== 'MINT' && (
              <span className="product-detail__badge product-detail__badge--defect">
                Lỗi: {product.defects.map(d => {
                  const defectLabels: Record<string, string> = {
                    'MINOR_FLAW': 'Sờn nhẹ',
                    'STAINED': 'Bẩn/Ố vàng',
                    'MISSING_BUTTON': 'Mất cúc',
                    'TORN': 'Rách nhỏ',
                    'FADED': 'Phai màu'
                  };
                  return defectLabels[d] || d;
                }).join(', ')}
              </span>
            )}
            {product.defects && product.defects.includes('MINT') && (
              <span className="product-detail__badge product-detail__badge--mint">
                Không lỗi (MINT)
              </span>
            )}
          </div>
          
          <div className={`product-detail__status ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
            <CheckCircle2 size={16} />
            <span>Tình trạng: {product.stock === 0 ? 'Hết hàng' : 'Còn hàng'}</span>
          </div>

          <div className="product-detail__attributes">
            <div>Màu sắc: <span>{product.colors?.length ? product.colors.join(', ') : 'Chưa cập nhật'}</span></div>
            <div>Thương hiệu: <span>{product.brand || 'Chưa cập nhật'}</span></div>
          </div>

          <div className="product-detail__quantity">
            <span>Số lượng:</span>
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
            <span>{product.stock || 1} sản phẩm có sẵn</span>
          </div>

          <div className="product-detail__actions">
            <button
              type="button"
              className="product-detail__buy"
              onClick={handleBuyNow}
              disabled={adding || product.stock === 0}
            >
              {product.stock === 0 ? 'Hết hàng' : (adding ? 'Đang xử lý...' : 'Mua Ngay')}
            </button>
            <button
              type="button"
              className="product-detail__cart"
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
            >
              {product.stock === 0 ? 'Hết hàng' : (adding ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng')}
            </button>
          </div>

          <div className="product-detail__divider" />
          
          <div className="product-detail__section">
            <h3>MÔ TẢ SẢN PHẨM</h3>
            <p>{product.description || 'Sản phẩm thời trang secondhand được tuyển chọn kỹ lưỡng, mang đến phong cách độc đáo và chất lượng vượt trội.'}</p>
            <ul>
              <li>Danh mục: {product.category}</li>
              <li>Thương hiệu: {product.brand || 'Khác'}</li>
              <li>Phong cách: {product.style || 'Casual, Streetwear'}</li>
              {(product.length || product.shoulder || product.chest || product.waist) && (
                <li>
                  Số đo: 
                  {product.length ? ` Dài ${product.length}cm` : ''}
                  {product.shoulder ? `, Vai ${product.shoulder}cm` : ''}
                  {product.chest ? `, Ngực ${product.chest}cm` : ''}
                  {product.waist ? `, Eo ${product.waist}cm` : ''}
                </li>
              )}
            </ul>
          </div>
          
          <div className="product-detail__benefits">
            <div className="product-detail__benefits-card">
              <Truck size={24} />
              <strong>Giao Hàng & Trả Hàng</strong>
              <span>Miễn phí trên 500k</span>
            </div>
            <div className="product-detail__benefits-card">
              <ShieldCheck size={24} />
              <strong>Bảo Hành 48 giờ</strong>
              <span>Đã đặt cam kết</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="product-detail__similar">
        <h2>Sản Phẩm Liên Quan</h2>
        <div className="product-detail__similar-grid">
          {similar.length > 0 ? (
            similar.map((item) => (
              <Link
                key={item.id}
                to={PATHS.productDetail.replace(':id', String(item.id))}
                className="product-detail__card"
              >
                <div className="product-detail__card-image">
                  {item.imageUrls?.[0] ? (
                    <>
                      <img src={item.imageUrls[0]} alt={item.name} className="primary-img" />
                      {item.imageUrls[1] && (
                        <img src={item.imageUrls[1]} alt={item.name} className="secondary-img" />
                      )}
                    </>
                  ) : null}
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