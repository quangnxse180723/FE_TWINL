import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { adminUsersApi } from '../api/adminUsersApi'
import type { AdminUser, AdminUserCreatePayload, AdminUserUpdatePayload } from '../types'

type FormMode = 'create' | 'edit' | 'view' | null

type UserFormState = {
  displayName: string
  email: string
  password: string
  role: 'USER' | 'STAFF'
  phone: string
  address: string
  gender: string
  dateOfBirth: string
}

type RoleFilter = 'ALL' | 'ADMIN' | 'STAFF' | 'USER'

const emptyFormState: UserFormState = {
  displayName: '',
  email: '',
  password: '',
  role: 'USER',
  phone: '',
  address: '',
  gender: '',
  dateOfBirth: '',
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formState, setFormState] = useState<UserFormState>(emptyFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: (payload: AdminUserCreatePayload) => adminUsersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      handleCloseForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUserUpdatePayload }) =>
      adminUsersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      handleCloseForm()
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminUsersApi.updateStatus(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const handleOpenCreate = () => {
    setFormMode('create')
    setEditingUser(null)
    setFormState(emptyFormState)
    setFormError(null)
  }

  const handleOpenView = (user: AdminUser) => {
    setFormMode('view')
    setEditingUser(user)
    setFormError(null)
  }

  const handleOpenEdit = (user: AdminUser) => {
    const role = user.roles?.includes('STAFF') ? 'STAFF' : 'USER'
    setFormMode('edit')
    setEditingUser(user)
    setFormState({
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      password: '',
      role,
      phone: user.phone ?? '',
      address: user.address ?? '',
      gender: user.gender ?? '',
      dateOfBirth: user.dateOfBirth ?? '',
    })
    setFormError(null)
  }

  const handleCloseForm = () => {
    setFormMode(null)
    setEditingUser(null)
    setFormState(emptyFormState)
    setFormError(null)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const normalizeOptional = (value: string) => {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!formState.displayName.trim()) {
      setFormError('Vui lòng nhập tên hiển thị.')
      return
    }

    if (formMode === 'create') {
      if (!formState.email.trim()) {
        setFormError('Vui lòng nhập email.')
        return
      }
      if (!formState.password.trim()) {
        setFormError('Vui lòng nhập mật khẩu.')
        return
      }

      const payload: AdminUserCreatePayload = {
        displayName: formState.displayName.trim(),
        email: formState.email.trim(),
        password: formState.password.trim(),
        role: formState.role,
        phone: normalizeOptional(formState.phone),
        address: normalizeOptional(formState.address),
        gender: normalizeOptional(formState.gender),
        dateOfBirth: normalizeOptional(formState.dateOfBirth),
      }

      await createMutation.mutateAsync(payload)
      return
    }

    if (formMode === 'edit' && editingUser) {
      const payload: AdminUserUpdatePayload = {
        displayName: formState.displayName.trim(),
        role: formState.role,
        phone: normalizeOptional(formState.phone),
        address: normalizeOptional(formState.address),
        gender: normalizeOptional(formState.gender),
        dateOfBirth: normalizeOptional(formState.dateOfBirth),
      }

      await updateMutation.mutateAsync({ id: editingUser.id, payload })
    }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.roles?.includes('ADMIN')) {
      return
    }

    const isActive = user.active !== false
    const nextActive = !isActive
    const label = nextActive ? 'mở khóa' : 'chặn'
    if (!window.confirm(`Bạn có chắc muốn ${label} tài khoản này?`)) {
      return
    }

    await statusMutation.mutateAsync({ id: user.id, active: nextActive })
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const filteredUsers = data?.filter((user) => {
    if (roleFilter === 'ALL') {
      return true
    }
    return user.roles?.includes(roleFilter)
  })

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Quản lý tài khoản</h1>
          <p>Xem, chỉnh sửa và quản lý quyền truy cập của người dùng hệ thống.</p>
        </div>
        <div className="admin-header__actions">
          <select
            className="admin-secondary"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="USER">USER</option>
          </select>
          <button type="button" className="admin-primary" onClick={handleOpenCreate}>
            + Thêm người dùng
          </button>
        </div>
      </div>

      {formMode === 'view' && editingUser && (
        <div className="admin-panel" style={{ animation: 'slideDown 0.3s ease' }}>
          <div className="admin-panel__header">
            <h3>Chi tiết tài khoản</h3>
            <button type="button" className="admin-secondary" onClick={handleCloseForm}>
              Đóng
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>Tên hiển thị</p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 500, fontSize: '16px' }}>{editingUser.displayName || '--'}</p>
              
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>Email</p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 500, fontSize: '16px', color: '#1a7a3e' }}>{editingUser.email}</p>
              
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>Vai trò</p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 500 }}>
                <span className="admin-pill">{editingUser.roles?.join(', ') || 'USER'}</span>
              </p>

              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>Trạng thái</p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 500 }}>
                <span className={`admin-status ${editingUser.active === false ? 'admin-status--blocked' : 'admin-status--active'}`}>
                  {editingUser.active === false ? 'Đã chặn' : 'Hoạt động'}
                </span>
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>Số điện thoại</p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 500, fontSize: '16px' }}>{editingUser.phone || '--'}</p>
              
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>Địa chỉ</p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 500, fontSize: '16px' }}>{editingUser.address || '--'}</p>

              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>Giới tính</p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 500, fontSize: '16px' }}>{editingUser.gender || '--'}</p>

              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>Ngày sinh</p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 500, fontSize: '16px' }}>{editingUser.dateOfBirth || '--'}</p>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
            {!editingUser.roles?.includes('ADMIN') && (
              <button type="button" className="admin-primary" onClick={() => handleOpenEdit(editingUser)}>
                Chỉnh sửa tài khoản
              </button>
            )}
          </div>
        </div>
      )}

      {(formMode === 'create' || formMode === 'edit') && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3>{formMode === 'create' ? 'Thêm người dùng' : 'Chỉnh sửa tài khoản'}</h3>
            <button type="button" className="admin-secondary" onClick={handleCloseForm}>
              Đóng
            </button>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__section">
              <h3>Thông tin tài khoản</h3>
              <label>
                Tên hiển thị
                <input
                  name="displayName"
                  value={formState.displayName}
                  onChange={handleChange}
                  placeholder="Nhập tên hiển thị"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  disabled={formMode === 'edit'}
                  placeholder="example@email.com"
                />
              </label>
              {formMode === 'create' && (
                <label>
                  Mật khẩu
                  <input
                    type="password"
                    name="password"
                    value={formState.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </label>
              )}
              <label>
                Vai trò
                <select name="role" value={formState.role} onChange={handleChange}>
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                </select>
              </label>
            </div>

            <div className="admin-form__section">
              <h3>Thông tin bổ sung</h3>
              <label>
                Số điện thoại
                <input name="phone" value={formState.phone} onChange={handleChange} />
              </label>
              <label>
                Địa chỉ
                <input name="address" value={formState.address} onChange={handleChange} />
              </label>
              <label>
                Giới tính
                <select name="gender" value={formState.gender} onChange={handleChange}>
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </label>
              <label>
                Ngày sinh
                <input type="date" name="dateOfBirth" value={formState.dateOfBirth} onChange={handleChange} />
              </label>
              {formError && <div className="admin-state admin-state--error">{formError}</div>}
              <div className="admin-form__actions">
                <button type="submit" className="admin-primary" disabled={isSubmitting}>
                  {formMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
                <button type="button" className="admin-secondary" onClick={handleCloseForm}>
                  Hủy
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="admin-panel">
        {isLoading ? (
          <div className="admin-state">Đang tải người dùng...</div>
        ) : isError ? (
          <div className="admin-state admin-state--error">Không thể tải danh sách người dùng.</div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => handleOpenView(user)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <td>
                    <div className="admin-table__user">
                      <div className="admin-table__avatar">
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="admin-table__title">{user.displayName}</div>
                        <div className="admin-table__subtitle">ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className="admin-pill">{user.roles?.[0] ?? 'USER'}</span></td>
                  <td>
                    <span
                      className={`admin-status ${user.active === false ? 'admin-status--blocked' : 'admin-status--active'}`}
                    >
                      {user.active === false ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {user.roles?.includes('ADMIN') ? (
                        <span className="admin-note"> </span>
                    ) : (
                      <div className="admin-table__actions">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(user); }} 
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }} 
                          title="Chặn/Mở"
                        >
                          {user.active === false ? '✅' : '🚫'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-state">Chưa có người dùng.</div>
        )}
      </div>
    </section>
  )
}
