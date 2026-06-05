import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import productsApi from '../../api/products/productsApi'
import type { Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import '../../styles/pages/ai-result.css'

interface AiScanData {
  brand: string;
  material: string;
  style: string;
  estimatedPrice: string;
}

export default function AiResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const aiResult = location.state?.aiResult as AiScanData
  const imagePreview = location.state?.imagePreview as string

  // Nếu truy cập thẳng đường dẫn mà không có state, đá về home
  useEffect(() => {
    if (!aiResult || !imagePreview) {
      navigate(PATHS.home)
    }
  }, [aiResult, imagePreview, navigate])

  // Lấy keyword để search. Thử dùng Brand trước, nếu Không xác định thì dùng Style
  const searchKeyword = (aiResult?.brand && aiResult.brand !== 'Không xác định') 
    ? aiResult.brand 
    : (aiResult?.style || '')

  const { data: productsData } = useQuery({
    queryKey: ['products', 'ai-search', searchKeyword],
    queryFn: () => productsApi.getProducts({ search: searchKeyword, sizePage: 4 }),
    enabled: !!searchKeyword
  })

  const similarProducts = productsData?.data?.content || []

  if (!aiResult || !imagePreview) return null

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ'
  }

  const renderProductCard = (item: Product) => {
    const imageUrl = item.imageUrls && item.imageUrls.length > 0 
      ? item.imageUrls[0] 
      : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80'

    return (
      <Link key={item.id} to={`/products/${item.id}`} className="home__card-link">
        <article className="home__card">
          <div className="home__card-media" style={{ aspectRatio: '3/4', height: 'auto' }}>
            <img src={imageUrl} alt={item.name} loading="lazy" />
          </div>
          <div className="home__card-body">
            <h5>{item.name}</h5>
            <p>{item.brand}</p>
            <strong>{formatPrice(item.price)}</strong>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <div className="ai-result-page">
      <div className="ai-result-header">
        <h1>Kết quả phân tích AI</h1>
        <div className="ai-result-subtitle">
          <CheckCircle2 size={16} />
          <span>Đã hoàn tất phân tích hình ảnh của bạn</span>
        </div>
      </div>

      <div className="ai-info-container">
        <div className="ai-image-preview">
          <img src={imagePreview} alt="Uploaded" />
          <div className="ai-focus-markers"></div>
        </div>

        <div className="ai-details">
          <div className="ai-badge">
            <Sparkles size={14} />
            <span>PHÁT HIỆN TỰ ĐỘNG</span>
          </div>

          <div className="ai-detail-row">
            <div className="ai-detail-label">Thương hiệu nhận diện</div>
            <div className="ai-detail-value">
              {aiResult.brand}
              {aiResult.brand !== 'Không xác định' && <CheckCircle2 size={18} color="#22c55e" />}
            </div>
          </div>

          <div className="ai-detail-row">
            <div className="ai-detail-label">Chất liệu</div>
            <div className="ai-detail-value">{aiResult.material}</div>
          </div>

          <div className="ai-detail-row">
            <div className="ai-detail-label">Kiểu dáng / Phong cách</div>
            <div className="ai-detail-value">{aiResult.style}</div>
          </div>

          <div className="ai-detail-row">
            <div className="ai-detail-label">Giá mua mới ước tính (Retail)</div>
            <div className="ai-detail-value price">{aiResult.estimatedPrice}</div>
          </div>
        </div>
      </div>

      <div className="ai-related-section">
        <div className="ai-related-header">
          <h2>Sản phẩm tương tự trên Twinil</h2>
          <Link to={PATHS.home} className="ai-related-link">Xem tất cả</Link>
        </div>
        
        <div className="home__card-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {similarProducts.map(renderProductCard)}
          {similarProducts.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Chưa tìm thấy sản phẩm nào tương tự trên TWINL lúc này.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
