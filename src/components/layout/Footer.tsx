import { Link } from 'react-router-dom'
import { PATHS } from '../../routes/paths'
import '../../styles/components/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <span className="footer__logo">Twinl</span>
          <p>Thời trang đa dạng, phong cách, cá tính.</p>
        </div>
        <div className="footer__column">
          <h4>Sản phẩm</h4>
          <a href="#">Nữ</a>
          <a href="#">Nam</a>
          <a href="#">Trẻ em</a>
          <a href="#">Thương hiệu</a>
          <a href="#">Thể thao</a>
        </div>
        <div className="footer__column">
          <h4>Giới thiệu</h4>
          <a href="#">Về chúng tôi</a>
          <Link to={PATHS.contact}>Liên hệ</Link>
          <a href="#">Quan tâm</a>
          <a href="#">Văn hóa</a>
          <a href="#">Bài viết</a>
        </div>
        <div className="footer__column">
          <h4>Hỗ trợ</h4>
          <a href="#">Getting started</a>
          <a href="#">Help center</a>
          <a href="#">Server status</a>
          <a href="#">Report a bug</a>
          <a href="#">Chat support</a>
        </div>
        <div className="footer__column">
          <h4>Tải xuống</h4>
          <a href="#">iOS</a>
          <a href="#">Android</a>
          <a href="#">Mac</a>
          <a href="#">Windows</a>
          <a href="#">Chrome</a>
        </div>
      </div>
      <div className="footer__bottom">
        <span>Copyright © 2026 Twinl - All Rights Reserved</span>
        <div className="footer__legal">
          <a href="#">Terms and Conditions</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  )
}
