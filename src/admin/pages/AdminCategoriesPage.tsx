import React, { useEffect, useState } from 'react'
import { categoriesApi } from '../../api/categories/categoriesApi'
import type { Category } from '../../api/categories/categoriesApi'
import { toast } from 'react-toastify'

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    parentId: ''
  })

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoriesApi.list()
      setCategories(data)
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi tải danh mục')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        parentId: formData.parentId ? Number(formData.parentId) : null
      }
      if (editingCat) {
        await categoriesApi.update(editingCat.id, payload)
        toast.success('Cập nhật thành công')
      } else {
        await categoriesApi.create(payload)
        toast.success('Thêm thành công')
      }
      setShowModal(false)
      fetchCategories()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return
    try {
      await categoriesApi.delete(id)
      toast.success('Xóa thành công')
      fetchCategories()
    } catch (err: any) {
      toast.error('Không thể xóa vì danh mục đang được sử dụng')
    }
  }

  const openModal = (cat?: Category, parentId?: number) => {
    if (cat) {
      setEditingCat(cat)
      setFormData({ name: cat.name, parentId: cat.parentId ? String(cat.parentId) : (parentId ? String(parentId) : '') })
    } else {
      setEditingCat(null)
      setFormData({ name: '', parentId: parentId ? String(parentId) : '' })
    }
    setShowModal(true)
  }

  // Flatten the hierarchy for display
  const flattenCategories = () => {
    const result: { cat: Category; level: number; parentName?: string }[] = []
    categories.forEach(c => {
      result.push({ cat: c, level: 0 })
      if (c.children) {
        c.children.forEach((child: Category) => {
          result.push({ cat: child, level: 1, parentName: c.name })
        })
      }
    })
    return result
  }

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Quản lý danh mục</h1>
          <p>Danh sách cấu trúc danh mục sản phẩm.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__filters">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            disabled
          />
          <button type="button" className="admin-secondary" onClick={() => fetchCategories()}>
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="admin-state">Đang tải danh mục...</div>
        ) : categories.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Danh mục cha</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {flattenCategories().map(({ cat, level, parentName }) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td style={{ paddingLeft: level === 1 ? '30px' : '15px', fontWeight: level === 0 ? '600' : 'normal', color: level === 0 ? '#111827' : '#4b5563' }}>
                    {level === 1 && <span style={{ color: '#9ca3af', marginRight: '8px' }}>↳</span>}
                    {cat.name}
                  </td>
                  <td>{parentName ? <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{parentName}</span> : '-'}</td>
                  <td>
                    <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                      {level === 0 && (
                        <button type="button" onClick={() => openModal(undefined, cat.id)} title="Thêm danh mục con">➕</button>
                      )}
                      <button type="button" onClick={() => openModal(cat, cat.parentId || undefined)} title="Sửa">✏️</button>
                      <button type="button" onClick={() => handleDelete(cat.id)} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-state">Chưa có danh mục nào.</div>
        )}
      </div>

      {showModal && (
        <div className="modal" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%'
          }}>
            <h2 style={{ marginBottom: '16px' }}>{editingCat ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Tên danh mục <span style={{ color: 'red' }}>*</span></label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Danh mục cha</label>
                <select
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  disabled={!!editingCat && categories.some(c => c.id === editingCat.id)} // Nếu là danh mục gốc thì ko cho chọn cha (tránh loop)
                >
                  <option value="">-- Không có (Danh mục gốc) --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '4px', border: 'none', background: '#000', color: '#fff', cursor: 'pointer' }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
