import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import productsApi, { type Product } from '../../api/products/productsApi'
import { PATHS } from '../../routes/paths'
import bannerThethao from '../../assets/images/banner-thethao.png'
import '../../styles/pages/category.css'

export default function SportCategoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [page, setPage] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, selectedGender, selectedSize, sortBy, page])

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = {
        category: 'Thể thao',
        page,
        sizePage: 12,
      }
      if (selectedGender) params.gender = selectedGender
      if (selectedCategory) params.search = selectedCategory
      if (selectedSize) params.size = selectedSize
      if (sortBy === 'price_asc') params.minPrice = 0
      if (sortBy === 'price_desc') params.maxPrice = 999999999

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
        <img src={bannerThethao} alt="Sport" />
        <div className="category__hero-content">
          <h1>Thể Thao</h1>
          <p>Trang phục năng động cho mọi hoạt động</p>
        </div>
      </div>

      <div className="category__container">
        <aside className="category__filters">
          <h3>Bộ lọc</h3>

          <div className="category__filter-group">
            <label>Giới tính</label>
            <select value={selectedGender} onChange={(e) => { setSelectedGender(e.target.value); setPage(0) }}>
              <option value="">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Trẻ em">Trẻ em</option>
            </select>
          </div>

          <div className="category__filter-group">
            <label>Danh mục</label>
            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(0) }}>
              <option value="">Tất cả</option>
              <option value="Áo khoác">Áo khoác</option>
              <option value="Áo">Áo</option>
              <option value="Quần">Quần</option>
              <option value="Giày">Giày</option>
              <option value="Phụ kiện">Phụ kiện</option>
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
              setSelectedGender('')
              setSelectedCategory('')
              setSelectedSize('')
              setSortBy('')
              setPage(0)
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
              <button type="button" onClick={() => { setSelectedGender(''); setSelectedCategory(''); setSelectedSize('') }}>
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
