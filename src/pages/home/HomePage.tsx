import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { ArrowRight, ShieldCheck, RefreshCcw, Star, Users, TrendingUp, Sparkles } from 'lucide-react'
import type { RootState } from '../../store'
import { PATHS } from '../../routes/paths'
import '../../styles/pages/home.css'

export default function HomePage() {
  
  const user = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()

  const handleSellClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      toast.info('Vui lòng đăng nhập để bán đồ')
      navigate(PATHS.login)
    } else {
      navigate(PATHS.sellerDashboard)
    }
  }

  return (
    <div className="hp">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section id="home-hero" className="hp-hero dark-section">
        <div className="hp-hero__bg" aria-hidden="true" />
        <div className="hp-hero__content">
          <span className="hp-hero__eyebrow">
            <Sparkles size={14} /> {'Thời trang bền vững'}
          </span>
          <h1 className="hp-hero__title">
            <span style={{ whiteSpace: 'nowrap' }}>{'Thời trang đẳng cấp,'}</span><br />
            <em>{'giá trị trường tồn'}</em>
          </h1>
          <p className="hp-hero__sub">
            {'Khám phá hàng nghìn món đồ cao cấp đã qua sử dụng — được xác thực, giao dịch an toàn qua hệ thống ký quỹ độc quyền của TWINL.'}
          </p>
          <div className="hp-hero__actions">
            <Link to={PATHS.women} className="hp-btn hp-btn--primary">
              {'Khám phá ngay'} <ArrowRight size={16} />
            </Link>
            <button type="button" onClick={handleSellClick} className="hp-btn hp-btn--ghost">
              {'Bán đồ của bạn'}
            </button>
          </div>
          <div className="hp-hero__stats">
            <div className="hp-hero__stat">
              <strong>10K+</strong><span>{'Sản phẩm'}</span>
            </div>
            <div className="hp-hero__stat-divider" />
            <div className="hp-hero__stat">
              <strong>98%</strong><span>{'Hài lòng'}</span>
            </div>
            <div className="hp-hero__stat-divider" />
            <div className="hp-hero__stat">
              <strong>5★</strong><span>{'Đánh giá'}</span>
            </div>
          </div>
        </div>
        <div className="hp-hero__visual">
          <div className="hp-hero__img-stack">
            <div className="hp-hero__img-card hp-hero__img-card--back">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"
                alt="Fashion"
              />
            </div>
            <div className="hp-hero__img-card hp-hero__img-card--front">
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80"
                alt="Fashion"
              />
              <div className="hp-hero__img-tag">
                <ShieldCheck size={14} />
                <span>{'Đã xác thực'}</span>
              </div>
            </div>
          </div>
          <div className="hp-hero__floating-card">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <div>
              <p>{'Giao dịch thành công!'}</p>
              <span>{'Đơn hàng #TW2026 đã hoàn tất'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────────────────── */}
      <section className="hp-trust">
        <div className="hp-trust__inner">
          <div className="hp-trust__item">
            <ShieldCheck size={24} className="hp-trust__icon" />
            <div>
              <h4>{'Ký quỹ an toàn'}</h4>
              <p>{'Tiền được giữ cho đến khi bạn hài lòng'}</p>
            </div>
          </div>
          <div className="hp-trust__sep" />
          <div className="hp-trust__item">
            <RefreshCcw size={24} className="hp-trust__icon" />
            <div>
              <h4>{'Hoàn tiền 48h'}</h4>
              <p>{'Không vừa ý? Đổi trả ngay lập tức'}</p>
            </div>
          </div>
          <div className="hp-trust__sep" />
          <div className="hp-trust__item">
            <Star size={24} className="hp-trust__icon" />
            <div>
              <h4>{'AI xác thực hàng'}</h4>
              <p>{'Mỗi sản phẩm được kiểm tra bởi AI'}</p>
            </div>
          </div>
          <div className="hp-trust__sep" />
          <div className="hp-trust__item">
            <Users size={24} className="hp-trust__icon" />
            <div>
              <h4>{'Cộng đồng tin cậy'}</h4>
              <p>{'Hơn 10,000 thành viên đang giao dịch'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY BANNER ──────────────────────────────────── */}
      <section className="hp-categories">
        <div className="hp-categories__inner">
          <Link to={PATHS.women} className="hp-cat-card hp-cat-card--women">
            <div className="hp-cat-card__bg" />
            <div className="hp-cat-card__body">
              <span className="hp-cat-card__tag">{'New arrivals'}</span>
              <h2>{'Thời trang Nữ'}</h2>
              <p>{'Hàng trăm thiết kế độc đáo'}</p>
              <span className="hp-cat-card__cta">{'Xem ngay'} <ArrowRight size={14} /></span>
            </div>
          </Link>
          <div className="hp-cat-card-col">
            <Link to={PATHS.men} className="hp-cat-card hp-cat-card--men">
              <div className="hp-cat-card__bg" />
              <div className="hp-cat-card__body">
                <span className="hp-cat-card__tag">{'Trending'}</span>
                <h2>{'Thời trang Nam'}</h2>
                <span className="hp-cat-card__cta">{'Xem ngay'} <ArrowRight size={14} /></span>
              </div>
            </Link>
            <Link to={PATHS.sport} className="hp-cat-card hp-cat-card--sport">
              <div className="hp-cat-card__bg" />
              <div className="hp-cat-card__body">
                <span className="hp-cat-card__tag">{'Active & Fit'}</span>
                <h2>{'Thể thao'}</h2>
                <span className="hp-cat-card__cta">{'Xem ngay'} <ArrowRight size={14} /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="hp-how">
        <div className="hp-how__inner">
          <div className="hp-how__left">
            <p className="hp-section__eyebrow">{'Quy trình'}</p>
            <h2>{'Mua sắm thông minh, giao dịch an tâm'}</h2>
            <p className="hp-how__desc">
              {'TWINL sử dụng hệ thống ký quỹ tiên tiến giúp cả người mua và người bán hoàn toàn yên tâm trong mỗi giao dịch.'}
            </p>
            <Link to={PATHS.women} className="hp-btn hp-btn--primary" style={{ display: 'inline-flex', marginTop: '24px' }}>
              {'Bắt đầu mua sắm'} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hp-how__steps">
            {[
              { num: '01', title: 'Chọn sản phẩm', desc: 'Duyệt qua hàng nghìn món đồ đã được AI kiểm tra chất lượng' },
              { num: '02', title: 'Thanh toán an toàn', desc: 'Tiền được giữ bởi TWINL cho đến khi giao dịch hoàn tất' },
              { num: '03', title: 'Nhận hàng & xác nhận', desc: 'Kiểm tra kỹ trong 48h, nếu không hài lòng hoàn tiền ngay' },
              { num: '04', title: 'Giao dịch thành công', desc: 'Người bán nhận tiền, bạn nhận hàng — cả hai cùng vui' },
            ].map((step) => (
              <div key={step.num} className="hp-how__step">
                <span className="hp-how__step-num">{step.num}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SELLER CTA ───────────────────────────────────────── */}
      <section className="hp-sell-cta dark-section">
        <div className="hp-sell-cta__inner">
          <div className="hp-sell-cta__text">
            <TrendingUp size={32} className="hp-sell-cta__icon" />
            <h2>{'Biến tủ quần áo thành thu nhập'}</h2>
            <p>
              {'Đăng bán miễn phí. Tiếp cận hàng chục nghìn khách hàng tiềm năng. Nhận tiền nhanh chóng và an toàn qua hệ thống TWINL.'}
            </p>
            <div className="hp-sell-cta__actions">
              <button type="button" onClick={handleSellClick} className="hp-btn hp-btn--white">
                {'Đăng bán ngay'} <ArrowRight size={16} />
              </button>
              <Link to={PATHS.contact} className="hp-btn hp-btn--outline-white">
                {'Tìm hiểu thêm'}
              </Link>
            </div>
          </div>
          <div className="hp-sell-cta__deco" aria-hidden="true">
            <div className="hp-sell-cta__circle hp-sell-cta__circle--1" />
            <div className="hp-sell-cta__circle hp-sell-cta__circle--2" />
            <div className="hp-sell-cta__stat-card">
              <strong>+2,400</strong>
              <span>{'Người bán mới tháng này'}</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
