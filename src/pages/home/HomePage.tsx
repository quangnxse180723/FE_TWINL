import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, Truck, Clock, CheckSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import type { RootState } from '../../store'
import productsApi from '../../api/products/productsApi'
import type { Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import '../../styles/pages/home.css'

export default function HomePage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()

  // Fetch women products
  const { data: womenData } = useQuery({
    queryKey: ['products', 'home-women'],
    queryFn: () => productsApi.getProducts({ category: 'Nữ', sizePage: 5 }),
  })
  const womenItems = womenData?.data?.content || []

  // Fetch men products
  const { data: menData } = useQuery({
    queryKey: ['products', 'home-men'],
    queryFn: () => productsApi.getProducts({ category: 'Nam', sizePage: 5 }),
  })
  const menItems = menData?.data?.content || []



  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ'
  }

  const handleSellClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      toast.info('Vui lòng đăng nhập để đăng bán.')
      navigate(PATHS.login)
    } else {
      navigate(PATHS.sellerDashboard)
    }
  }

  const renderProductCard = (item: Product) => {
    const imageUrl = item.imageUrls && item.imageUrls.length > 0 
      ? item.imageUrls[0] 
      : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80'

    return (
      <Link key={item.id} to={`/products/${item.id}`} className="home__card-link">
        <article className="home__card">
          <div className="home__card-media">
            <img src={imageUrl} alt={item.name} loading="lazy" />
          </div>
          <div className="home__card-body">
            <h5>{item.name}</h5>
            <p>Size: {item.sizes && item.sizes.length > 0 ? item.sizes[0] : 'S'}</p>
            <strong>{formatPrice(item.price)}</strong>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <section className="home">
      {/* 1. HERO SECTION (ESCROW) */}
      <div className="home-hero">
        <div className="home-hero__icon">
          <ShieldCheck size={48} color="#fff" strokeWidth={1.5} />
        </div>
        <h1 className="home-hero__title">Mua Sắm Thảnh Thơi - Giao Dịch An Toàn 100%</h1>
        <p className="home-hero__subtitle">
          TWINL giữ tiền an toàn cho đến khi bạn hài lòng với món đồ. <strong>Không</strong> lo lừa đảo, không sợ hàng lỗi.
        </p>
        <div className="home-hero__actions">
          <Link to={PATHS.women} className="btn-hero-primary">Khám phá ngay hàng tuyển chọn</Link>
          <button type="button" onClick={handleSellClick} className="btn-hero-secondary" style={{ border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}>
            Đăng bán món đồ đầu tiên
          </button>
        </div>
      </div>

      {/* 2. TRUST TIMELINE */}
      <div className="trust-timeline">
        <div className="trust-timeline__line"></div>
        <div className="trust-step">
          <div className="trust-step__icon"><Lock size={20} color="#fff" /></div>
          <h4>Thanh toán & Giữ tiền 🔒</h4>
          <p>Tiền được giữ an toàn bởi hệ thống TWINL.</p>
        </div>
        <div className="trust-step">
          <div className="trust-step__icon"><Truck size={20} color="#fff" /></div>
          <h4>Vận chuyển an tâm 🚚</h4>
          <p>Đơn hàng được theo dõi ra bảo hiểm toàn diện.</p>
        </div>
        <div className="trust-step">
          <div className="trust-step__icon"><Clock size={20} color="#fff" /></div>
          <h4>Bảo chứng 48h ⏱</h4>
          <p>Bạn có 48h để kiểm tra hàng trước khi tiền được chuyển.</p>
        </div>
        <div className="trust-step">
          <div className="trust-step__icon"><CheckSquare size={20} color="#fff" /></div>
          <h4>Hoàn tất giao dịch ✅</h4>
          <p>Giao dịch thành công, nụ cười hài lòng từ cả hai bên.</p>
        </div>
      </div>

      {/* 3. ESCROW FAQ */}
      <div className="faq-section">
        <div className="faq-box">
          <div className="faq-box__header">
            <div className="faq-icon faq-icon--blue">👤</div>
            <span>Người bán thắc mắc</span>
          </div>
          <h4>"Lỡ khách hàng cố tình phá hàng rồi đòi trả lại thì sao?"</h4>
          <p>TWINL có quy trình xác minh qua video mở/đóng gói hàng. Nếu phát hiện gian lận, người bán được đền bù 100%.</p>
        </div>
        <div className="faq-box">
          <div className="faq-box__header">
            <div className="faq-icon faq-icon--blue">🛍</div>
            <span>Người mua thắc mắc</span>
          </div>
          <h4>"Thủ tục hoàn tiền có lâu không?"</h4>
          <p>Hoàn tiền cái rụp! Ngay khi yêu cầu trả hàng được duyệt, tiền sẽ về ví TWINL hoặc tài khoản của bạn trong 24h.</p>
        </div>
      </div>

      {/* 4. PRODUCTS: NỮ */}
      <section className="home__section">
        <div className="home__section-header">
          <h4>Nữ</h4>
          <Link to={PATHS.women} className="home__section-link">Xem các sản phẩm tương tự</Link>
        </div>
        <div className="home__card-grid">
          {womenItems.map(renderProductCard)}
          {womenItems.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
              Chưa có sản phẩm nữ nào trong hệ thống
            </div>
          )}
        </div>
        {womenItems.length > 0 && (
          <div className="home__section-footer">
            <Link to={PATHS.women} className="home__section-button">Xem bộ sưu tập</Link>
          </div>
        )}
      </section>

      {/* 5. PRODUCTS: NAM */}
      <section className="home__section">
        <div className="home__section-header">
          <h4>Nam</h4>
          <Link to={PATHS.men} className="home__section-link">Xem các sản phẩm tương tự</Link>
        </div>
        <div className="home__card-grid">
          {menItems.map(renderProductCard)}
          {menItems.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
              Chưa có sản phẩm nam nào trong hệ thống
            </div>
          )}
        </div>
        {menItems.length > 0 && (
          <div className="home__section-footer">
            <Link to={PATHS.men} className="home__section-button">Xem bộ sưu tập</Link>
          </div>
        )}
      </section>

    </section>
  )
}
