import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import productsApi, { type Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import bannerNu from '../../assets/images/banner-nu.png'
import '../../styles/pages/category.css'

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
  const [page, setPage] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [searchKeyword, minPrice, maxPrice, selectedColor, selectedSize, sortBy, page])

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = {
        category: 'Nữ',
        page,
        sizePage: 12,
      }
      if (searchKeyword) params.search = searchKeyword
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      if (selectedColor) params.color = selectedColor
      if (selectedSize) params.size = selectedSize
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

  const getTone = (index: number): string => {
    const tones = ['warm', 'cool', 'dark', 'neutral', 'green', 'night', 'charcoal', 'blue', 'sand', 'graphite', 'navy', 'brown']
    return tones[index % tones.length]
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
        <aside className="category__filters">
          <h3>Bộ lọc</h3>

          <div className="category__filter-group">
            <label>Từ khóa</label>
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setPage(0) }}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div className="category__filter-group">
            <label>Khoảng giá</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" 
                placeholder="Từ (đ)" 
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(0) }}
                style={{ width: '50%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input 
                type="number" 
                placeholder="Đến (đ)" 
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(0) }}
                style={{ width: '50%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div className="category__filter-group">
            <label>Màu sắc</label>
            <select value={selectedColor} onChange={(e) => { setSelectedColor(e.target.value); setPage(0) }}>
              <option value="">Tất cả</option>
              <option value="Trắng">Trắng</option>
              <option value="Đen">Đen</option>
              <option value="Đỏ">Đỏ</option>
              <option value="Xanh dương">Xanh dương</option>
              <option value="Xanh lá">Xanh lá</option>
              <option value="Vàng">Vàng</option>
              <option value="Hồng">Hồng</option>
              <option value="Xám">Xám</option>
              <option value="Nâu">Nâu</option>
              <option value="Tím">Tím</option>
              <option value="Cam">Cam</option>
            </select>
          </div>

          <div className="category__filter-group">
            <label>Size</label>
            <select value={selectedSize} onChange={(e) => { setSelectedSize(e.target.value); setPage(0) }}>
              <option value="">Tất cả</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>

          <button
            type="button"
            className="category__reset-btn"
            onClick={() => {
              setSearchKeyword('')
              setMinPrice('')
              setMaxPrice('')
              setSelectedColor('')
              setSelectedSize('');
              setSortBy('');
              setPage(0);
            }}
          >
            Đặt lại bộ lọc
          </button>
        </aside>

        <div className="category__main">
          <div className="category__toolbar">
            <span className="category__count">{products.length} sản phẩm</span>
            <select
              className="category__sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="">Mặc định</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
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
                {products.map((product, index) => (
                  <article
                    key={product.id}
                    className="category__card"
                    onClick={() => navigate(PATHS.productDetail.replace(':id', String(product.id)))}
                  >
                    <div className={`category__card-media category__card-media--${getTone(index)}`}>
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <img src={product.imageUrls[0]} alt={product.name} />
                      ) : (
                        <span>{product.name.split(' ')[0]}</span>
                      )}
                    </div>
                    <div className="category__card-body">
                      <h4>{product.name}</h4>
                      <p className="category__card-brand">{product.brand}</p>
                      <div className="category__card-meta">
                        <span className="category__card-size">{product.sizes?.join(', ')}</span>
                      </div>
                      <strong className="category__card-price">{formatPrice(product.price)}</strong>
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
                  ← Trang trước
                </button>
                <span>Trang {page + 1}</span>
                <button
                  type="button"
                  disabled={products.length < 12}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Trang sau →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}