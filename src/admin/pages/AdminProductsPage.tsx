import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminProductsApi } from '../api/adminProductsApi'
import { PATHS } from '../../routes/paths'
import type { AdminProduct } from '../types'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sizePage] = useState(1000)

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

  const renderRow = (product: AdminProduct) => (
    <tr key={product.id}>
      <td>
        <div className="admin-table__product">
          <div className="admin-table__image">
            {product.imageUrls?.[0] ? (
              <img src={product.imageUrls[0]} alt={product.name} />
            ) : (
              <span>{product.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="admin-table__title">{product.name}</div>
            <div className="admin-table__subtitle">SKU: {product.id}</div>
          </div>
        </div>
      </td>
      <td>{product.category}</td>
      <td>{formatPrice(product.price)}</td>
      <td>{product.stock}</td>
      <td>
        <div className="admin-table__actions">
          <button type="button" onClick={() => navigate(PATHS.adminProductEdit.replace(':id', String(product.id)))}>✏️</button>
          <button type="button" onClick={() => handleDelete(product.id)}>🗑️</button>
        </div>
      </td>
    </tr>
  )

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p>Danh sách tất cả sản phẩm trong cửa hàng của bạn.</p>
        </div>
        <Link to={PATHS.adminProductNew} className="admin-primary">+ Thêm sản phẩm</Link>
      </div>

      <div className="admin-panel">
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
        ) : data && data.content.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>{data.content.map(renderRow)}</tbody>
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
