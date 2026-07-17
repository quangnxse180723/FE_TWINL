import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import outfitSetsApi, { type OutfitSet } from '../../../api/outfitSetsApi'
import productsApi, { type Product } from '../../../api/products/productsApi'
import { PATHS } from '../../../routes/paths'
import { Plus, X, GripVertical } from 'lucide-react'
import { toast } from 'react-toastify'

interface ItemEntry {
  productId: number
  productName: string
  productBrand: string
  productPrice: number
  productImageUrl?: string
  role: string
  displayOrder: number
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v).replace('₫', 'đ')

export default function AdminOutfitSetFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [styleTag, setStyleTag] = useState('')
  const [discountTwo, setDiscountTwo] = useState(5)
  const [discountLow, setDiscountLow] = useState(8)
  const [discountHigh, setDiscountHigh] = useState(10)
  const [active, setActive] = useState(true)
  const [items, setItems] = useState<ItemEntry[]>([])

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(isEdit)

  // Load admin products (no seller = system products)
  useEffect(() => {
    productsApi.getProducts({ sizePage: 100 })
      .then(res => {
        const adminProducts = res.data.content.filter((p: Product) => !p.sellerId)
        setAllProducts(adminProducts)
      })
      .catch(() => toast.error('Không thể tải sản phẩm'))
  }, [])

  // Load existing set if editing
  useEffect(() => {
    if (!isEdit || !id) return
    outfitSetsApi.getById(Number(id))
      .then((res: { data: OutfitSet }) => {
        const s: OutfitSet = res.data
        setName(s.name)
        setDescription(s.description || '')
        setCoverImageUrl(s.coverImageUrl || '')
        setStyleTag(s.styleTag || '')
        setDiscountTwo(s.discountTwoItems)
        setDiscountLow(s.discountThresholdLow)
        setDiscountHigh(s.discountThresholdHigh)
        setActive(s.active)
        setItems(s.items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          productBrand: i.productBrand,
          productPrice: i.productPrice,
          productImageUrl: i.productImageUrl,
          role: i.role || '',
          displayOrder: i.displayOrder,
        })))
      })
      .catch(() => toast.error('Không thể tải bộ set'))
      .finally(() => setLoadingExisting(false))
  }, [id, isEdit])

  const addProduct = (product: Product) => {
    if (items.find(i => i.productId === product.id)) {
      toast.warn('Sản phẩm này đã có trong bộ set')
      return
    }
    setItems(prev => [...prev, {
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      productPrice: product.price,
      productImageUrl: product.imageUrls?.[0],
      role: '',
      displayOrder: prev.length,
    }])
    setShowProductPicker(false)
    setProductSearch('')
  }

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId)
      .map((i, idx) => ({ ...i, displayOrder: idx })))
  }

  const updateItemRole = (productId: number, role: string) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, role } : i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Vui lòng nhập tên bộ set'); return }
    if (items.length === 0) { toast.error('Vui lòng thêm ít nhất 1 sản phẩm'); return }

    setSaving(true)
    try {
      const payload = {
        name, description, coverImageUrl, styleTag,
        discountTwoItems: discountTwo,
        discountThresholdLow: discountLow,
        discountThresholdHigh: discountHigh,
        active,
        items: items.map(i => ({ productId: i.productId, role: i.role, displayOrder: i.displayOrder }))
      }
      if (isEdit) {
        await outfitSetsApi.update(Number(id), payload)
        toast.success('Đã cập nhật bộ set!')
      } else {
        await outfitSetsApi.create(payload)
        toast.success('Đã tạo bộ set mới!')
      }
      navigate(PATHS.adminOutfitSets)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  ).filter(p => !items.find(i => i.productId === p.id))

  if (loadingExisting) return <div style={{ padding: 32 }}>Đang tải...</div>

  const totalPrice = items.reduce((sum, i) => sum + i.productPrice, 0)

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, margin: '0 0 8px' }}>
        {isEdit ? 'Chỉnh sửa Bộ Set' : 'Tạo Bộ Set Mới'}
      </h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>
        Phối từ các sản phẩm trong kho hệ thống
      </p>

      <form onSubmit={handleSubmit}>
        {/* Basic info */}
        <section style={{ background: '#fff', border: '1px solid #efefef', padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px', borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
            Thông tin cơ bản
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Tên bộ set *</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="VD: Summer Chill Set" required />
            </div>
            <div>
              <label style={labelStyle}>Phong cách (Style tag)</label>
              <input style={inputStyle} value={styleTag} onChange={e => setStyleTag(e.target.value)} placeholder="VD: Casual, Streetwear..." />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Mô tả</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={description}
                onChange={e => setDescription(e.target.value)} placeholder="Mô tả phong cách, cách phối..." />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>URL ảnh bìa (để trống để dùng ảnh mosaic tự động)</label>
              <input style={inputStyle} value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="active" checked={active} onChange={e => setActive(e.target.checked)} />
            <label htmlFor="active" style={{ fontSize: 14, cursor: 'pointer' }}>Hiển thị bộ set này</label>
          </div>
        </section>

        {/* Discount config */}
        <section style={{ background: '#fff', border: '1px solid #efefef', padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px', borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
            Cài đặt Giảm giá
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Giảm khi mua 2 món (%)</label>
              <input type="number" style={inputStyle} value={discountTwo} min={0} max={50}
                onChange={e => setDiscountTwo(Number(e.target.value))} />
              <span style={{ fontSize: 12, color: '#888' }}>Mặc định: 5%</span>
            </div>
            <div>
              <label style={labelStyle}>Giảm nguyên bộ - Thấp (%)</label>
              <input type="number" style={inputStyle} value={discountLow} min={0} max={50}
                onChange={e => setDiscountLow(Number(e.target.value))} />
              <span style={{ fontSize: 12, color: '#888' }}>Khi tổng &lt; 500,000đ</span>
            </div>
            <div>
              <label style={labelStyle}>Giảm nguyên bộ - Cao (%)</label>
              <input type="number" style={inputStyle} value={discountHigh} min={0} max={50}
                onChange={e => setDiscountHigh(Number(e.target.value))} />
              <span style={{ fontSize: 12, color: '#888' }}>Khi tổng ≥ 500,000đ</span>
            </div>
          </div>
        </section>

        {/* Product items */}
        <section style={{ background: '#fff', border: '1px solid #efefef', padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              Sản phẩm trong bộ ({items.length} món · Tổng: {formatPrice(totalPrice)})
            </h2>
            <button type="button" onClick={() => setShowProductPicker(!showProductPicker)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0d0d0d', color: '#fff', border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
              <Plus size={14} /> Thêm sản phẩm
            </button>
          </div>

          {/* Product picker */}
          {showProductPicker && (
            <div style={{ border: '1px solid #e5e5e5', marginBottom: 20, padding: 16, background: '#fafafa' }}>
              <input style={{ ...inputStyle, marginBottom: 12 }} placeholder="Tìm kiếm sản phẩm..."
                value={productSearch} onChange={e => setProductSearch(e.target.value)} autoFocus />
              <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredProducts.length === 0
                  ? <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Không tìm thấy sản phẩm</p>
                  : filteredProducts.slice(0, 20).map(p => (
                    <div key={p.id} onClick={() => addProduct(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#fff', border: '1px solid #efefef', cursor: 'pointer' }}>
                      <div style={{ width: 48, height: 48, background: '#f0ede8', flexShrink: 0, overflow: 'hidden' }}>
                        {p.imageUrls?.[0] && <img src={p.imageUrls[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{p.brand}</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{formatPrice(p.price)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: 13 }}>
              Chưa có sản phẩm nào. Bấm "Thêm sản phẩm" để bắt đầu.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item, idx) => (
                <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', border: '1px solid #efefef', background: '#fff' }}>
                  <span style={{ color: '#ccc', cursor: 'grab' }}><GripVertical size={16} /></span>
                  <span style={{ fontSize: 12, color: '#aaa', width: 20 }}>#{idx + 1}</span>
                  <div style={{ width: 60, height: 60, background: '#f0ede8', flexShrink: 0, overflow: 'hidden' }}>
                    {item.productImageUrl && <img src={item.productImageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{item.productName}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{item.productBrand} · {formatPrice(item.productPrice)}</div>
                  </div>
                  <input
                    style={{ ...inputStyle, width: 140, marginBottom: 0, padding: '6px 10px' }}
                    placeholder="Vai trò (áo, quần...)"
                    value={item.role}
                    onChange={e => updateItemRole(item.productId, e.target.value)}
                  />
                  <button type="button" onClick={() => removeItem(item.productId)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving}
            style={{ background: '#0d0d0d', color: '#fff', border: 'none', padding: '14px 32px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật bộ set' : 'Tạo bộ set')}
          </button>
          <button type="button" onClick={() => navigate(PATHS.adminOutfitSets)}
            style={{ background: '#fff', color: '#555', border: '1px solid #e5e5e5', padding: '14px 24px', fontSize: 14, cursor: 'pointer' }}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#444',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e5e5e5', padding: '10px 14px',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 0,
  fontFamily: 'Inter, sans-serif'
}
