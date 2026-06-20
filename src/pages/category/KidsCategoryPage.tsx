import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import productsApi, { type Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import bannerTreem from '../../assets/images/banner-treem.png'
import '../../styles/pages/category.css'

export default function KidsCategoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [conditionRange, setConditionRange] = useState<number>(50)
  const [selectedDefects, setSelectedDefects] = useState<string>('')
  const [page, setPage] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [searchKeyword, minPrice, maxPrice, selectedColor, selectedSize, conditionRange, selectedDefects, sortBy, page])

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = {
        category: 'Tráº» em',
        page,
        sizePage: 8,
      }
      if (searchKeyword) params.search = searchKeyword
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      if (selectedColor) params.color = selectedColor
      if (selectedSize) params.size = selectedSize
      if (conditionRange > 50) params.minCondition = conditionRange
      if (selectedDefects) params.defects = selectedDefects
      if (sortBy) params.sortBy = sortBy
      if (sortBy === 'price_asc') params.minPrice = params.minPrice || 0
      if (sortBy === 'price_desc') params.maxPrice = params.maxPrice || 999999999

      const response = await productsApi.getProducts(params)
      setProducts(response.data.content)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'KhÃ´ng thá»ƒ táº£i sáº£n pháº©m'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setPage(0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' Ä‘'
  }

  return (
    <section className="category">
      <div className="category__hero">
        <img src={bannerTreem} alt="Kids Fashion" />
        <div className="category__hero-content">
          <h1>Thá»i Trang Tráº» Em</h1>
          <p>Bá»™ sÆ°u táº­p Ä‘Ã¡ng yÃªu dÃ nh cho cÃ¡c bÃ©</p>
        </div>
      </div>

      <div className="category__container">
                <aside className="category__filters category__filters--stacked">
          <h3 className="category__sidebar-title">Bá»˜ Lá»ŒC</h3>
          
          <div className="category__search-wrapper">
            <input
              type="text"
              placeholder="TÃ¬m kiáº¿m sáº£n pháº©m..."
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setPage(0) }}
            />
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <h3 className="category__sidebar-title">KHOáº¢NG GIÃ (VNÄ)</h3>
          <div className="category__price-inputs">
            <input
              type="number"
              placeholder="Tá»«"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(0) }}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Äáº¿n"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(0) }}
            />
          </div>

          <h3 className="category__sidebar-title">MÃ€U Sáº®C</h3>
          <div className="category__color-grid">
            {['Tráº¯ng', 'Äen', 'Äá»', 'Xanh dÆ°Æ¡ng', 'Xanh lÃ¡', 'VÃ ng', 'Há»“ng', 'XÃ¡m', 'NÃ¢u', 'TÃ­m', 'Cam'].map((color) => {
              const colorHex = {
                'Tráº¯ng': '#ffffff', 'Äen': '#111111', 'Äá»': '#ef4444', 'Xanh dÆ°Æ¡ng': '#3b82f6',
                'Xanh lÃ¡': '#22c55e', 'VÃ ng': '#eab308', 'Há»“ng': '#ec4899', 'XÃ¡m': '#9ca3af',
                'NÃ¢u': '#78350f', 'TÃ­m': '#a855f7', 'Cam': '#f97316'
              }[color] || '#ddd';
              
              return (
                <div 
                  key={color}
                  onClick={() => { setSelectedColor(selectedColor === color ? '' : color); setPage(0) }}
                  className={`category__color-swatch ${selectedColor === color ? 'is-active' : ''}`}
                  style={{ backgroundColor: colorHex }}
                  title={color}
                />
              )
            })}
          </div>

          <h3 className="category__sidebar-title">SIZE</h3>
          <div className="category__size-grid">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <div 
                key={size}
                onClick={() => { setSelectedSize(selectedSize === size ? '' : size); setPage(0) }}
                className={`category__size-btn ${selectedSize === size ? 'is-active' : ''}`}
              >
                {size}
              </div>
            ))}
          </div>

          <h3 className="category__sidebar-title">Äá»˜ Má»šI (%)</h3>
          <div className="category__filter-group" style={{marginBottom: '24px'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="range" 
                min="50" max="100" step="5"
                value={conditionRange}
                onChange={(e) => { setConditionRange(Number(e.target.value)); setPage(0) }}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#111' }}
              />
              <span style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Tá»« {conditionRange}%</span>
            </div>
          </div>

          <h3 className="category__sidebar-title">TÃŒNH TRáº NG Lá»–I</h3>
          <div className="category__size-grid">
            {['MINT', 'MINOR_FLAW', 'STAINED', 'MISSING_BUTTON', 'TORN', 'FADED'].map((defect) => {
              const defectLabel = { MINT: 'KhÃ´ng lá»—i', MINOR_FLAW: 'Sá»n nháº¹', STAINED: 'Báº©n/á»', MISSING_BUTTON: 'Máº¥t cÃºc', TORN: 'RÃ¡ch nhá»', FADED: 'Phai mÃ u' }[defect];
              return (
                <div 
                  key={defect}
                  onClick={() => { setSelectedDefects(selectedDefects === defect ? '' : defect); setPage(0) }}
                  className={`category__size-btn ${selectedDefects === defect ? 'is-active' : ''}`}
                  style={{ fontSize: '10px' }}
                >
                  {defectLabel}
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="category__reset-btn-new"
            onClick={() => {
              setSearchKeyword('');
              setMinPrice('');
              setMaxPrice('');
              setSelectedColor('');
              setSelectedSize('');
              setSortBy('');
              setPage(0);
            }}
          >
            Äáº¶T Láº I Bá»˜ Lá»ŒC
          </button>
        </aside>

        <div className="category__main">
          <div className="category__toolbar-new">
            <span>Hiá»ƒn thá»‹ {products.length} sáº£n pháº©m</span>
            <div>
              <span style={{ marginRight: 8 }}>Sáº®P Xáº¾P:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="">Máº·c Ä‘á»‹nh</option>
                <option value="price_asc">GiÃ¡: Tháº¥p Ä‘áº¿n cao</option>
                <option value="price_desc">GiÃ¡: Cao Ä‘áº¿n tháº¥p</option>
                <option value="newest">Má»›i nháº¥t</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="category__loading">
              <p>Äang táº£i sáº£n pháº©m...</p>
            </div>
          ) : error ? (
            <div className="category__error">
              <p>{error}</p>
              <button type="button" onClick={fetchProducts}>Thá»­ láº¡i</button>
            </div>
          ) : products.length === 0 ? (
            <div className="category__empty">
              <p>KhÃ´ng cÃ³ sáº£n pháº©m nÃ o phÃ¹ há»£p</p>
              <button type="button" onClick={() => { setSearchKeyword(''); setMinPrice(''); setMaxPrice(''); setSelectedColor(''); setSelectedSize('') }}>
                Xem táº¥t cáº£ sáº£n pháº©m
              </button>
            </div>
          ) : (
            <>
              <div className="category__grid">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="category__card-new"
                    onClick={() => navigate(PATHS.productDetail.replace(':id', String(product.id)))}
                  >
                    <div className="category__card-media-new">
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <>
                          <img src={product.imageUrls[0]} alt={product.name} className="primary-img" />
                          {product.imageUrls[1] && (
                            <img src={product.imageUrls[1]} alt={product.name} className="secondary-img" />
                          )}
                        </>
                      ) : (
                        <span>{product.name.split(' ')[0]}</span>
                      )}
                      {product.conditionPercentage && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255, 255, 255, 0.9)', color: '#4f46e5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          Má»›i {product.conditionPercentage}%
                        </span>
                      )}
                    </div>
                    <div className="category__card-body-new">
                      <p className="category__card-brand-new">{product.brand && product.brand !== 'KhÃ´ng xÃ¡c Ä‘á»‹nh' ? product.brand : 'KhÃ´ng xÃ¡c Ä‘á»‹nh'}</p>
                      <h4 className="category__card-name-new">{product.name}</h4>
                      <div className="category__card-footer-new">
                        <span className="category__card-size-new">Size: {product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'Freesize'}</span>
                        <strong className="category__card-price-new">{formatPrice(product.price)}</strong>
                      </div>
                      <p style={{ fontSize: '11px', color: '#ef4444', margin: 0, fontWeight: 500 }}>
                        {product.defects && product.defects.length > 0 && !product.defects.includes('MINT') 
                          ? `Lá»—i: ${product.defects.map(d => (({ MINOR_FLAW: 'Sá»n nháº¹', STAINED: 'Báº©n/á» vÃ ng', MISSING_BUTTON: 'Máº¥t cÃºc', TORN: 'RÃ¡ch nhá»', FADED: 'Phai mÃ u' })[d] || d)).join(', ')}` 
                          : 'TÃ¬nh tráº¡ng: KhÃ´ng lá»—i'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="category__pagination">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  &larr; Trang trÆ°á»›c
                </button>
                <span>Trang {page + 1}</span>
                <button
                  type="button"
                  disabled={products.length < 8}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Trang sau &rarr;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
