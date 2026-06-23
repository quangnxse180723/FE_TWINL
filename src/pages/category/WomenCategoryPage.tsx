import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import productsApi, { type Product } from '../../api/products/productsApi';
import { PATHS } from '../../routes/paths'
import bannerNu from '../../assets/images/banner-nu.png'

export default function WomenCategoryPage() {
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
  const location = useLocation()
  
  // Read category from URL initially
  const queryParams = new URLSearchParams(location.search)
  const initialCategory = queryParams.get('category') || ''
  
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)

  // Update selectedCategory if URL changes
  useEffect(() => {
    const currentParam = new URLSearchParams(location.search).get('category') || ''
    setSelectedCategory(currentParam)
  }, [location.search])

  useEffect(() => {
    fetchProducts()
  }, [searchKeyword, minPrice, maxPrice, selectedColor, selectedSize, conditionRange, selectedDefects, sortBy, page, selectedCategory])

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = {
        category: 'Nữ',
        page,
        sizePage: 8,
      }
      if (selectedCategory) params.category = selectedCategory
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
      const message = err instanceof Error ? err.message : 'Không thể tải sản phẩm'
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
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  return (
    <section className="category">
      <div className="category__hero">
        <img src={bannerNu} alt="Women's Fashion" />
        <div className="category__hero-content">
          <h1>Thời Trang Nữ</h1>
          <p>Khám phá bộ sưu tập thời trang nữ đa dạng</p>
        </div>
      </div>

      <div className="category__container">
                <aside className="category__filters category__filters--stacked">
          <h3 className="category__sidebar-title">BỘ LỌC</h3>
          
          <div className="category__search-wrapper">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setPage(0) }}
            />
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <h3 className="category__sidebar-title">KHOẢNG GIÁ (VNĐ)</h3>
          <div className="category__price-inputs">
            <input
              type="number"
              placeholder="Từ"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(0) }}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Đến"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(0) }}
            />
          </div>

          <h3 className="category__sidebar-title">MÀU SẮC</h3>
          <div className="category__color-grid">
            {['Trắng', 'Đen', 'Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Hồng', 'Xám', 'Nâu', 'Tím', 'Cam'].map((color) => {
              const colorHex = {
                'Trắng': '#ffffff', 'Đen': '#111111', 'Đỏ': '#ef4444', 'Xanh dương': '#3b82f6',
                'Xanh lá': '#22c55e', 'Vàng': '#eab308', 'Hồng': '#ec4899', 'Xám': '#9ca3af',
                'Nâu': '#78350f', 'Tím': '#a855f7', 'Cam': '#f97316'
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

          <h3 className="category__sidebar-title">ĐỘ MỚI (%)</h3>
          <div className="category__filter-group" style={{marginBottom: '24px'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="range" 
                min="50" max="100" step="5"
                value={conditionRange}
                onChange={(e) => { setConditionRange(Number(e.target.value)); setPage(0) }}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#111' }}
              />
              <span style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Từ {conditionRange}%</span>
            </div>
          </div>

          <h3 className="category__sidebar-title">TÌNH TRẠNG LỖI</h3>
          <div className="category__size-grid">
            {['MINT', 'MINOR_FLAW', 'STAINED', 'MISSING_BUTTON', 'TORN', 'FADED'].map((defect) => {
              const defectLabel = { MINT: 'Không lỗi', MINOR_FLAW: 'Sờn nhẹ', STAINED: 'Bẩn/Ố', MISSING_BUTTON: 'Mất cúc', TORN: 'Rách nhỏ', FADED: 'Phai màu' }[defect];
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
              setSelectedCategory('');
              setPage(0);
            }}
          >
            ĐẶT LẠI BỘ LỌC
          </button>
        </aside>

        <div className="category__main">
          <div className="category__toolbar-new">
            <span>Hiển thị {products.length} sản phẩm</span>
            <div>
              <span style={{ marginRight: 8 }}>SẮP XẾP:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="">Mặc định</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="category__loading">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="category__error">
              <p>{error}</p>
              <button type="button" onClick={fetchProducts}>Thử lại</button>
            </div>
          ) : products.length === 0 ? (
            <div className="category__empty">
              <p>Không có sản phẩm nào phù hợp</p>
              <button type="button" onClick={() => { setSearchKeyword(''); setMinPrice(''); setMaxPrice(''); setSelectedColor(''); setSelectedSize('') }}>
                Xem tất cả sản phẩm
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
                          Mới {product.conditionPercentage}%
                        </span>
                      )}
                    </div>
                    <div className="category__card-body-new">
                      <p className="category__card-brand-new">{product.brand && product.brand !== 'Không xác định' ? product.brand : 'Không xác định'}</p>
                      <h4 className="category__card-name-new">{product.name}</h4>
                      <div className="category__card-footer-new">
                        <span className="category__card-size-new">Size: {product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'Freesize'}</span>
                        <strong className="category__card-price-new">{formatPrice(product.price)}</strong>
                      </div>
                      <p style={{ fontSize: '11px', color: '#ef4444', margin: 0, fontWeight: 500 }}>
                        {product.defects && product.defects.length > 0 && !product.defects.includes('MINT') 
                          ? `Lỗi: ${product.defects.map(d => (({ MINOR_FLAW: 'Sờn nhẹ', STAINED: 'Bẩn/Ố vàng', MISSING_BUTTON: 'Mất cúc', TORN: 'Rách nhỏ', FADED: 'Phai màu' })[d] || d)).join(', ')}` 
                          : 'Tình trạng: Không lỗi'}
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
                  &larr; Trang trước
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