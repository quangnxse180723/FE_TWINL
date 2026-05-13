import '../../styles/components/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__brand">Twinl</p>
      <div className="footer__links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Contact Us</a>
      </div>
      <p className="footer__copy">(c) 2026 Twinl. All rights reserved.</p>
    </footer>
  )
}
