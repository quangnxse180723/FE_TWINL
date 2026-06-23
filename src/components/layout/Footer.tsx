import { Link } from 'react-router-dom'
import { PATHS } from '../../routes/paths'
import '../../styles/components/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Top: Brand + Nav */}
        <div className="footer__top">
          {/* Brand */}
          <div className="footer__brand">
            <span className="footer__logo">Twinl</span>
            <p>Thời trang đa dạng, phong cách, cá tính.</p>

            {/* Social icons */}
            <div className="footer__social">
              <a href="https://www.facebook.com/people/TWINL/61590433408258/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer__social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/twinl_official" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer__social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://www.tiktok.com/@twinl2hand" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="footer__social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.84 4.84 0 0 1-1.01-.07z"/></svg>
              </a>
            </div>
          </div>

          {/* Nav columns */}
          <div className="footer__nav">
            <div className="footer__col">
              <h4>Sản phẩm</h4>
              <Link to={PATHS.women}>Nữ</Link>
              <Link to={PATHS.men}>Nam</Link>
              <Link to={PATHS.sport}>Thể thao</Link>
            </div>

            <div className="footer__col">
              <h4>Công ty</h4>
              <Link to={PATHS.about}>Về chúng tôi</Link>
              <Link to={PATHS.contact}>Liên hệ</Link>
            </div>

            <div className="footer__col">
              <h4>Hỗ trợ</h4>
              <Link to={PATHS.helpCenter}>Trung tâm trợ giúp</Link>
              <Link to={PATHS.returnPolicy}>Chính sách đổi trả</Link>
              <Link to={PATHS.reportBug}>Báo cáo lỗi</Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer__divider" />

        {/* Bottom */}
        <div className="footer__bottom">
          <span>© 2026 Twinl. All rights reserved.</span>
          <div className="footer__legal">
            <a href="#">Điều khoản dịch vụ</a>
            <a href="#">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
