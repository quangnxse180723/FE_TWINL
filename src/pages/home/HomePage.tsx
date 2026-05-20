import womenHero from '../../assets/images/hero-women.png'
import menHero from '../../assets/images/hero-men.png'
import '../../styles/pages/home.css'

export default function HomePage() {
  const womenItems = [
    { name: 'Áo khoác da, cổ bẻ', price: '199.000 đ', size: 'S', tone: 'warm' },
    { name: 'Áo khoác hai hàng cúc', price: '189.000 đ', size: 'XS', tone: 'cool' },
    { name: 'Áo khoác blazer dáng ôm', price: '179.000 đ', size: 'S', tone: 'dark' },
    { name: 'Áo khoác vai rộng', price: '179.000 đ', size: 'XS', tone: 'neutral' },
    { name: 'Áo khoác nhung lụa', price: '179.000 đ', size: 'M', tone: 'green' },
    { name: 'Áo khoác da màu đen', price: '179.000 đ', size: 'S', tone: 'night' },
  ]

  const menItems = [
    { name: 'Áo khoác dáng ngắn', price: '199.000 đ', size: 'M', tone: 'charcoal' },
    { name: 'Áo khoác vải cổ Đức', price: '189.000 đ', size: 'L', tone: 'blue' },
    { name: 'Áo khoác Crane', price: '179.000 đ', size: 'S', tone: 'sand' },
    { name: 'Áo khoác da đen', price: '179.000 đ', size: 'L', tone: 'graphite' },
    { name: 'Áo khoác gió', price: '179.000 đ', size: 'M', tone: 'navy' },
    { name: 'Áo khoác da nâu', price: '179.000 đ', size: 'M', tone: 'brown' },
  ]

  const brands = ['ZARA', 'HM', 'HERMES', 'GUCCI', 'CHANEL']

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

      <section className="home__section">
        <div className="home__section-header">
          <h4>Áo khoác Nữ</h4>
          <button type="button" className="home__section-link">Xem các sản phẩm tương tự</button>
        </div>
        <div className="home__card-grid">
          {womenItems.map((item, index) => (
            <article key={`${item.name}-${index}`} className="home__card">
              <div className={`home__card-media home__card-media--${item.tone}`}>
                <span>{item.name.split(' ')[0]}</span>
              </div>
              <div className="home__card-body">
                <h5>{item.name}</h5>
                <p>Size: {item.size}</p>
                <strong>{item.price}</strong>
              </div>
            </article>
          ))}
        </div>
        <div className="home__section-footer">
          <button type="button" className="home__section-button">Xem bộ sưu tập</button>
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-header">
          <h4>Áo khoác Nam</h4>
          <button type="button" className="home__section-link">Xem các sản phẩm tương tự</button>
        </div>
        <div className="home__card-grid">
          {menItems.map((item, index) => (
            <article key={`${item.name}-${index}`} className="home__card">
              <div className={`home__card-media home__card-media--${item.tone}`}>
                <span>{item.name.split(' ')[0]}</span>
              </div>
              <div className="home__card-body">
                <h5>{item.name}</h5>
                <p>Size: {item.size}</p>
                <strong>{item.price}</strong>
              </div>
            </article>
          ))}
        </div>
        <div className="home__section-footer">
          <button type="button" className="home__section-button">Xem bộ sưu tập</button>
        </div>
      </section>

      <section className="home__section home__section--brands">
        <div className="home__section-header">
          <h4>Thương hiệu</h4>
          <button type="button" className="home__section-link">Xem các sản phẩm tương tự</button>
        </div>
        <div className="home__brand-grid">
          {brands.map((brand) => (
            <div key={brand} className="home__brand-card">
              {brand}
            </div>
          ))}
        </div>
        <div className="home__section-footer">
          <button type="button" className="home__section-button">Xem bộ sưu tập</button>
        </div>
      </section>
    </section>
  )
}
