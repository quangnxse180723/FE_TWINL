import womenHero from '../../assets/images/hero-women.svg'
import menHero from '../../assets/images/hero-men.svg'
import '../../styles/pages/home.css'

export default function HomePage() {
  return (
    <section className="home">
      <div className="home__hero">
        <div className="home__panel">
          <img src={womenHero} alt="Women" />
          <h2>Nữ</h2>
        </div>
        <div className="home__panel home__panel--dark">
          <img src={menHero} alt="Men" />
          <h2>Nam</h2>
        </div>
      </div>
      <div className="home__cta">
        <h3>Mua với giá rẻ hơn, thời trang đẳng cấp hơn!</h3>
        <button type="button" className="home__cta-btn">Săn ngay</button>
      </div>
    </section>
  )
}
