import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { adminProductsApi } from '../api/adminProductsApi'
import { categoriesApi } from '../../api/categories/categoriesApi'
import { colorsApi } from '../../api/colors/colorsApi'
import { PATHS } from '../../routes/paths'
import type { AdminProductPayload } from '../types'

const emptyForm: AdminProductPayload = {
  name: '',
  description: '',
  price: 0,
  categoryId: 0,
  brand: '',
  gender: '',
  imageUrls: [],
  status: 'ACTIVE',
  style: '',
  stock: 0,
  sizes: [],
  colorIds: [],
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<AdminProductPayload>(emptyForm)
  const [sizes, setSizes] = useState('')
  const [colorIds, setColorIds] = useState<number[]>([])
  const [uploadError, setUploadError] = useState('')
  const [formError, setFormError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const isEdit = Boolean(id)

  const { data } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminProductsApi.getById(id ?? ''),
    enabled: isEdit,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  const { data: colors = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: () => colorsApi.list(),
  })

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        description: data.description ?? '',
        price: data.price,
        categoryId: data.categoryId ?? 0,
        brand: data.brand,
        gender: data.gender ?? '',
        imageUrls: data.imageUrls ?? [],
        status: data.status ?? 'ACTIVE',
        style: data.style ?? '',
        stock: data.stock,
        sizes: data.sizes ?? [],
        colorIds: data.colorIds ?? [],
      })
      setSizes((data.sizes ?? []).join(', '))
      setColorIds(data.colorIds ?? [])
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload: AdminProductPayload) =>
      isEdit ? adminProductsApi.update(id ?? '', payload) : adminProductsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      navigate(PATHS.adminProducts)
    },
  })

  const handleChange = (field: keyof AdminProductPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.categoryId) {
      setFormError('Vui lòng chọn danh mục trước khi lưu.')
      return
    }
    if (!form.imageUrls || form.imageUrls.length < 3 || form.imageUrls.length > 6) {
      setUploadError('Vui lòng tải từ 3 đến 6 ảnh sản phẩm.')
      return
    }

    mutation.mutate({
      ...form,
      colorIds,
      sizes: sizes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    })
  }

  const handleUploadImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    if (files.length < 3 || files.length > 6) {
      setUploadError('Vui lòng chọn từ 3 đến 6 ảnh.')
      event.target.value = ''
      return
    }

    try {
      setIsUploading(true)
      setUploadError('')
      const urls = await adminProductsApi.uploadImages(files)
      setForm((prev) => ({ ...prev, imageUrls: urls }))
    } catch {
      setUploadError('Không thể tải ảnh lên. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>{isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h1>
          <p>Thiết lập thông tin cơ bản và hình ảnh cho sản phẩm.</p>
        </div>
        <div className="admin-form__actions">
          <button type="button" className="admin-secondary" onClick={() => navigate(PATHS.adminProducts)}>
            Hủy bỏ
          </button>
          <button type="submit" form="admin-product-form" className="admin-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <form id="admin-product-form" className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__section">
          <h3>Thông tin cơ bản</h3>
          <label>
            Tên sản phẩm
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              required
            />
          </label>
          <label>
            Mô tả sản phẩm
            <textarea
              value={form.description ?? ''}
              onChange={(event) => handleChange('description', event.target.value)}
            />
          </label>
          <label>
            Ảnh sản phẩm (3-6 ảnh)
            <div className="admin-upload">
              <label className="admin-upload__box">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadImages}
                  disabled={isUploading}
                />
                <span>{isUploading ? 'Đang tải ảnh...' : 'Tải ảnh lên'}</span>
              </label>
              <div className="admin-upload__grid">
                {(form.imageUrls ?? []).map((url) => (
                  <div key={url} className="admin-upload__thumb">
                    <img src={url} alt="Product" />
                  </div>
                ))}
              </div>
              {uploadError ? <div className="admin-state admin-state--error">{uploadError}</div> : null}
            </div>
          </label>
          <label>
            Phong cách
            <input
              type="text"
              value={form.style ?? ''}
              onChange={(event) => handleChange('style', event.target.value)}
              placeholder="Ví dụ: Streetwear, Minimal"
            />
          </label>
        </div>
        <div className="admin-form__section">
          <h3>Giá cả & Kho hàng</h3>
          <div className="admin-form__grid">
            <label>
              Giá bán (VND)
              <input
                type="number"
                value={form.price}
                onChange={(event) => handleChange('price', Number(event.target.value))}
                required
              />
            </label>
            <label>
              Số lượng kho
              <input
                type="number"
                value={form.stock}
                onChange={(event) => handleChange('stock', Number(event.target.value))}
                required
              />
            </label>
            <label>
              Danh mục
              <select
                value={form.categoryId}
                onChange={(event) => {
                  setFormError('')
                  handleChange('categoryId', Number(event.target.value))
                }}
                required
              >
                <option value={0} disabled>Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {formError ? <div className="admin-state admin-state--error">{formError}</div> : null}
            </label>
            <label>
              Nhãn hiệu (Brand)
              <input
                type="text"
                value={form.brand}
                onChange={(event) => handleChange('brand', event.target.value)}
                required
              />
            </label>
            <label>
              Giới tính
              <select
                value={form.gender ?? ''}
                onChange={(event) => handleChange('gender', event.target.value)}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </label>
            <label>
              Tình trạng
              <select
                value={form.status ?? 'ACTIVE'}
                onChange={(event) => handleChange('status', event.target.value)}
              >
                <option value="ACTIVE">Đang bán</option>
                <option value="INACTIVE">Tạm ẩn</option>
                <option value="DRAFT">Nháp</option>
              </select>
            </label>
            <label>
              Size (phân cách bằng dấu phẩy)
              <input
                type="text"
                value={sizes}
                onChange={(event) => setSizes(event.target.value)}
              />
            </label>
            <label>
              Màu sắc
              <div className="admin-form__chips">
                {colors.map((color) => (
                  <label key={color.id} className="admin-form__chip">
                    <input
                      type="checkbox"
                      checked={colorIds.includes(color.id)}
                      onChange={() => {
                        setColorIds((prev) =>
                          prev.includes(color.id)
                            ? prev.filter((id) => id !== color.id)
                            : [...prev, color.id]
                        )
                      }}
                    />
                    <span>{color.name}</span>
                  </label>
                ))}
              </div>
            </label>
          </div>
        </div>
      </form>
    </section>
  )
}
