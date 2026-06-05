import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminProductsApi } from '../api/adminProductsApi'
import { PATHS } from '../../routes/paths'
import { API_BASE_URL } from '../../config/constants'
import type { AdminProduct } from '../types'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

type ProductTab = 'ALL' | 'SYSTEM' | 'SELLER';

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sizePage] = useState(1000)
  const [activeTab, setActiveTab] = useState<ProductTab>('ALL')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const queryParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      page,
      sizePage,
    }),
    [search, page, sizePage],
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-products', queryParams],
    queryFn: () => adminProductsApi.list(queryParams),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminProductsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Xóa sản phẩm này?')) {
      deleteMutation.mutate(id)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const filteredProducts = useMemo(() => {
    if (!data?.content) return [];
    if (activeTab === 'SYSTEM') return data.content.filter(p => !p.sellerId);
    if (activeTab === 'SELLER') return data.content.filter(p => p.sellerId);
    return data.content;
  }, [data, activeTab]);

  const renderRow = (product: AdminProduct) => (
    <React.Fragment key={product.id}>
      <tr style={{ cursor: 'pointer', backgroundColor: expandedId === product.id ? '#f9fafb' : 'transparent' }} onClick={() => toggleExpand(product.id)}>
        <td>
          <div className="admin-table__product">
            <div className="admin-table__image">
              {product.imageUrls?.[0] ? (
                <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `${API_BASE_URL}${product.imageUrls[0]}`} alt={product.name} />
              ) : (
                <span>{product.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="admin-table__title">{product.name}</div>
              <div className="admin-table__subtitle">SKU: {product.id} {product.sellerId && <span style={{ color: '#2563eb', fontWeight: 500 }}>• Ký gửi</span>}</div>
            </div>
          </div>
        </td>
        <td>{product.sellerName ? <span style={{ padding: '4px 8px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{product.sellerName}</span> : <span style={{ color: '#6b7280', fontSize: '12px' }}>Hệ thống</span>}</td>
        <td>{product.category}</td>
        <td>{formatPrice(product.price)}</td>
        <td>{product.stock}</td>
        <td>
          <div className="admin-table__actions" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => navigate(PATHS.adminProductEdit.replace(':id', String(product.id)))}>✏️</button>
            <button type="button" onClick={() => handleDelete(product.id)}>🗑️</button>
          </div>
        </td>
      </tr>
      {expandedId === product.id && (
        <tr>
          <td colSpan={6} style={{ backgroundColor: '#f9fafb', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px', color: '#374151' }}>
              <div>
                <p><strong>Thương hiệu:</strong> {product.brand || 'N/A'}</p>
                <p><strong>Giới tính:</strong> {product.gender || 'N/A'}</p>
                <p><strong>Phong cách:</strong> {product.style || 'N/A'}</p>
                <p><strong>Trạng thái:</strong> {product.status || 'ACTIVE'}</p>
              </div>
              <div>
                <p><strong>Kích thước:</strong> {product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'N/A'}</p>
                <p><strong>Màu sắc (IDs):</strong> {product.colorIds && product.colorIds.length > 0 ? product.colorIds.join(', ') : 'N/A'}</p>
                <p><strong>Mô tả:</strong> <span style={{ color: '#6b7280' }}>{product.description || 'Không có mô tả'}</span></p>
                {product.sellerName && (
                  <p style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                    <strong>Thông tin Seller:</strong> {product.sellerName} (ID: {product.sellerId})
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  )

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p>Danh sách tất cả sản phẩm trong hệ thống cửa hàng.</p>
        </div>
        <Link to={PATHS.adminProductNew} className="admin-primary">+ Thêm sản phẩm</Link>
      </div>

      <div className="admin-panel">
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
          <button 
            style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #d1d5db', background: activeTab === 'ALL' ? '#1f2937' : '#fff', color: activeTab === 'ALL' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setActiveTab('ALL')}
          >
            Tất cả
          </button>
          <button 
            style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #d1d5db', background: activeTab === 'SYSTEM' ? '#1f2937' : '#fff', color: activeTab === 'SYSTEM' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setActiveTab('SYSTEM')}
          >
            Sản phẩm Hệ thống
          </button>
          <button 
            style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #d1d5db', background: activeTab === 'SELLER' ? '#1f2937' : '#fff', color: activeTab === 'SELLER' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setActiveTab('SELLER')}
          >
            Sản phẩm Ký gửi
          </button>
        </div>
        <div className="admin-panel__filters">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" className="admin-secondary" onClick={() => setPage(0)}>
            Lọc
          </button>
        </div>

        {isLoading ? (
          <div className="admin-state">Đang tải sản phẩm...</div>
        ) : isError ? (
          <div className="admin-state admin-state--error">Không thể tải sản phẩm.</div>
        ) : filteredProducts.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Người bán</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>{filteredProducts.map(renderRow)}</tbody>
          </table>
        ) : (
          <div className="admin-state">Chưa có sản phẩm.</div>
        )}

        <div className="admin-pagination">
          <button type="button" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
            Trước
          </button>
          <span>Trang {data ? data.number + 1 : 1} / {data ? data.totalPages : 1}</span>
          <button
            type="button"
            onClick={() => setPage((prev) => (data && prev + 1 < data.totalPages ? prev + 1 : prev))}
            disabled={!data || page + 1 >= data.totalPages}
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  )
}
