import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import outfitSetsApi, { type OutfitSet } from '../../../api/outfitSetsApi'
import { PATHS } from '../../../routes/paths'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v).replace('₫', 'đ')

export default function AdminOutfitSetsPage() {
  const navigate = useNavigate()
  const [sets, setSets] = useState<OutfitSet[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSets = () => {
    outfitSetsApi.adminGetAll()
      .then((res: { data: OutfitSet[] }) => setSets(res.data))
      .catch(() => toast.error('Không thể tải danh sách bộ set'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSets() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa bộ set "${name}"?`)) return
    try {
      await outfitSetsApi.delete(id)
      toast.success('Đã xóa bộ set')
      fetchSets()
    } catch {
      toast.error('Xóa thất bại')
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await outfitSetsApi.toggleActive(id)
      fetchSets()
    } catch {
      toast.error('Thao tác thất bại')
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontFamily: "'Cormorant Garamond', serif" }}>Quản lý Bộ Phối Đồ</h1>
          <p style={{ color: '#666', marginTop: 4, fontSize: 14 }}>Tối đa 6 bộ set đang hiển thị cùng lúc</p>
        </div>
        <Link to={PATHS.adminOutfitSetNew}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#0d0d0d', color: '#fff', padding: '12px 20px',
            textDecoration: 'none', fontSize: 13, fontWeight: 600
          }}>
          <Plus size={16} /> Tạo bộ set mới
        </Link>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : sets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
          Chưa có bộ set nào.{' '}
          <Link to={PATHS.adminOutfitSetNew}>Tạo ngay</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {sets.map(set => (
            <div key={set.id} style={{
              background: '#fff', border: '1px solid #efefef',
              padding: '20px 24px', display: 'flex',
              alignItems: 'center', gap: 20,
              opacity: set.active ? 1 : 0.5
            }}>
              {/* Cover image */}
              <div style={{ width: 80, height: 80, background: '#f0ede8', flexShrink: 0, overflow: 'hidden' }}>
                {set.coverImageUrl
                  ? <img src={set.coverImageUrl} alt={set.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%', gap: 1 }}>
                      {set.items.slice(0, 4).map(item => (
                        <div key={item.id} style={{ background: '#e5e0d8', overflow: 'hidden' }}>
                          {item.productImageUrl && <img src={item.productImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#0d0d0d' }}>
                  {set.name}
                  {!set.active && <span style={{ marginLeft: 8, fontSize: 12, background: '#f1f5f9', color: '#64748b', padding: '2px 8px' }}>Ẩn</span>}
                </div>
                {set.styleTag && <div style={{ fontSize: 12, color: '#d4af37', letterSpacing: 1, marginTop: 4 }}>{set.styleTag}</div>}
                <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 13, color: '#555' }}>
                  <span>{set.itemCount} sản phẩm</span>
                  <span>Tổng: {formatPrice(set.totalPrice)}</span>
                  <span>Giảm 2 món: {set.discountTwoItems}%</span>
                  <span>Giảm full: {set.discountThresholdLow}–{set.discountThresholdHigh}%</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleToggle(set.id)}
                  style={{ padding: '8px 12px', border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', color: '#555' }}
                  title={set.active ? 'Ẩn bộ set' : 'Hiện bộ set'}
                >
                  {set.active ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => navigate(PATHS.adminOutfitSetEdit.replace(':id', String(set.id)))}
                  style={{ padding: '8px 12px', border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', color: '#555' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(set.id, set.name)}
                  style={{ padding: '8px 12px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', color: '#dc2626' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
