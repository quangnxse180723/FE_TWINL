import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, EyeOff, User, ShoppingBag, KeyRound, MapPin, Pencil, Camera, Store, ChevronDown, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PATHS } from '../../routes/paths'
import { userApi } from '../../api/users/userApi'
import { updateUser } from '../../store/slices/authSlice'
import { updateAuthUser } from '../../utils/authStorage'
import { API_BASE_URL } from '../../config/constants'
import { useVNLocations } from '../../hooks/useVNLocations'
import type { RootState } from '../../store'

import '../../styles/pages/profile.css'
import type { UserProfile } from '../../types/user'

type ActiveTab = 'info' | 'orders' | 'password'

export default function ProfilePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [activeTab, setActiveTab] = useState<ActiveTab>('info')
  const passwordSectionRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [wardCode, setWardCode] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [provinceId, setProvinceId] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  const { provinces, districts, wards } = useVNLocations(provinceId, districtId)

  useEffect(() => {
    if (!user) navigate(PATHS.login)
  }, [navigate, user])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await userApi.getMe()
        setProfile(data)
        syncFormState(data)
      } catch {
        setError('Không thể tải thông tin hồ sơ.')
      } finally {
        setIsLoading(false)
      }
    }
    if (user) fetchProfile()
  }, [user])

  const fullName = useMemo(() => profile?.displayName ?? user?.displayName ?? '', [profile, user])

  const avatarSrc = useMemo(() => {
    const avatarUrl = profile?.avatarUrl ?? user?.avatarUrl
    if (!avatarUrl) return null
    if (avatarUrl.startsWith('http')) return avatarUrl
    return `${API_BASE_URL}${avatarUrl}`
  }, [profile, user])

  const formatDate = (value: string | null) => {
    if (!value) return 'Chưa cập nhật'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString('vi-VN')
  }

  const renderValue = (value: string | null | undefined) => value?.trim() ? value : 'Chưa cập nhật'

  const normalizeDate = (value: string) => {
    if (!value) return ''
    if (value.length >= 10) return value.slice(0, 10)
    return value
  }

  const syncFormState = (data: UserProfile) => {
    setDisplayName(data.displayName ?? '')
    setPhone(data.phone ?? '')
    setAddress(data.address ?? '')
    setWardCode(data.wardCode ?? '')
    setDistrictId(data.districtId ? String(data.districtId) : '')
    setProvinceId(data.provinceId ? String(data.provinceId) : '')
    setGender(data.gender ?? '')
    setDateOfBirth(data.dateOfBirth ?? '')
  }

  const handleSave = async () => {
    if (!profile) return
    try {
      setIsSaving(true)
      setSaveError('')
      const payload = {
        displayName: displayName.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        wardCode: wardCode.trim() || null,
        districtId: districtId ? Number(districtId) : null,
        provinceId: provinceId ? Number(provinceId) : null,
        gender: gender.trim() || null,
        dateOfBirth: dateOfBirth || null,
      }
      const updated = await userApi.updateMe(payload)
      setProfile(updated)
      syncFormState(updated)
      dispatch(updateUser({ ...updated }))
      updateAuthUser({ ...updated })
      setIsEditing(false)
      toast.success('Cập nhật hồ sơ thành công!')
    } catch {
      setSaveError('Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) syncFormState(profile)
    setSaveError('')
    setIsEditing(false)
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      setUploadError('')
      const updated = await userApi.uploadAvatar(file)
      setProfile(updated)
      dispatch(updateUser({ ...updated }))
      updateAuthUser({ ...updated })
      toast.success('Cập nhật ảnh đại diện thành công!')
    } catch {
      setUploadError('Vui lòng tải ảnh dưới 10 MB.')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }
    setIsSubmittingPassword(true)
    setPasswordError('')
    try {
      await userApi.changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword })
      toast.success('Đổi mật khẩu thành công!')
      setIsChangingPassword(false)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  const provinceLabel = provinces.find(p => p.code.toString() === profile?.provinceId?.toString())?.name || renderValue(profile?.provinceId?.toString())
  const districtLabel = districts.find(d => d.code.toString() === profile?.districtId?.toString())?.name || renderValue(profile?.districtId?.toString())
  const wardLabel = wards.find(w => w.code.toString() === profile?.wardCode?.toString())?.name || renderValue(profile?.wardCode)

  return (
    <div className="profile-page">
      <div className="profile-layout">

        {/* ── SIDEBAR ──────────────────────────────── */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar__avatar-block">
            <div className="profile-sidebar__avatar">
              {avatarSrc
                ? <img src={avatarSrc} alt={fullName || 'User'} />
                : <span>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
              }
            </div>
            <div className="profile-sidebar__name">{fullName || 'Người dùng'}</div>
            <div className="profile-sidebar__since">Thành viên từ 2023</div>
          </div>

          <nav className="profile-sidebar__nav">
            <button
              className={`profile-sidebar__nav-item${activeTab === 'info' ? ' active' : ''}`}
              onClick={() => {
                setActiveTab('info')
                setIsChangingPassword(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <User size={16} /> Thông tin cá nhân
            </button>
            <button
              className={`profile-sidebar__nav-item${activeTab === 'orders' ? ' active' : ''}`}
              onClick={() => navigate(PATHS.orders)}
            >
              <ShoppingBag size={16} /> Đơn hàng của tôi
            </button>
            <button
              className={`profile-sidebar__nav-item${activeTab === 'password' ? ' active' : ''}`}
              onClick={() => {
                setActiveTab('password')
                setIsChangingPassword(true)
                setTimeout(() => {
                  const el = passwordSectionRef.current
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 100
                    window.scrollTo({ top, behavior: 'smooth' })
                  }
                }, 50)
              }}
            >
              <KeyRound size={16} /> Đổi mật khẩu
            </button>
          </nav>

          <button className="profile-sidebar__seller-btn" onClick={() => navigate(PATHS.sellerDashboard)}>
            <Store size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Trở thành người bán
          </button>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────── */}
        <main className="profile-main">

          {/* Profile Info Card */}
          <div className="profile-card">
            <div className="profile-card__header">
              <div className="profile-card__title">
                <User size={18} />
                Thông Tin Cá Nhân
              </div>
              {!isEditing && (
                <button className="profile-btn-edit" onClick={() => setIsEditing(true)}>
                  <Pencil size={14} /> Chỉnh sửa
                </button>
              )}
            </div>

            <div className="profile-card__body">
              {/* Avatar row */}
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  {avatarSrc
                    ? <img src={avatarSrc} alt={fullName || 'User'} />
                    : <span>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
                  }
                </div>
                <div className="profile-avatar-info">
                  <h2>{fullName || 'Người dùng'}</h2>
                  <p>{profile?.email || 'Chưa có email'}</p>
                  <div className="profile-avatar-actions">
                    <label className="profile-btn-upload">
                      <Camera size={14} />
                      {isUploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}
                      <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                    </label>
                  </div>
                  {uploadError && <div className="profile-upload-error">{uploadError}</div>}
                </div>
              </div>

              {/* Form */}
              {isLoading ? (
                <div className="profile-loading">Đang tải thông tin...</div>
              ) : error ? (
                <div className="profile-error-msg">{error}</div>
              ) : (
                <>
                  {/* Section: Thông tin cơ bản */}
                  <div className="profile-section-title">
                    <User size={14} /> Thông tin cơ bản
                  </div>
                  <div className="profile-form-grid">
                    <div className="profile-form-group">
                      <label>Tên hiển thị</label>
                      {isEditing
                        ? <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nhập tên hiển thị" />
                        : <div className="profile-field-view">{fullName || <span className="muted">Chưa cập nhật</span>}</div>
                      }
                    </div>

                    <div className="profile-form-group">
                      <label>Email</label>
                      <div className="profile-field-view">
                        {renderValue(profile?.email)}
                        <Lock size={14} className="lock-icon" style={{ marginLeft: 'auto', color: '#ccc' }} />
                      </div>
                    </div>

                    <div className="profile-form-group">
                      <label>Ngày sinh</label>
                      {isEditing
                        ? <input type="date" value={normalizeDate(dateOfBirth)} onChange={e => setDateOfBirth(e.target.value)} />
                        : <div className="profile-field-view">{formatDate(profile?.dateOfBirth ?? null)}</div>
                      }
                    </div>

                    <div className="profile-form-group">
                      <label>Giới tính</label>
                      {isEditing
                        ? (
                          <div className="profile-select-wrapper">
                            <select value={gender} onChange={e => setGender(e.target.value)}>
                              <option value="">Chọn giới tính</option>
                              <option value="Nam">Nam</option>
                              <option value="Nữ">Nữ</option>
                              <option value="Khác">Khác</option>
                            </select>
                            <ChevronDown size={16} className="profile-select-arrow" />
                          </div>
                        )
                        : <div className="profile-field-view">{renderValue(profile?.gender)}</div>
                      }
                    </div>
                  </div>

                  {/* Section: Liên hệ & Địa chỉ */}
                  <div className="profile-section-title">
                    <MapPin size={14} /> Liên Hệ & Địa Chỉ
                  </div>
                  <div className="profile-form-grid">
                    <div className="profile-form-group">
                      <label>Số điện thoại</label>
                      {isEditing
                        ? <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại" />
                        : <div className="profile-field-view">{renderValue(profile?.phone)}</div>
                      }
                    </div>

                    <div className="profile-form-group full-width">
                      <label>Địa chỉ chi tiết</label>
                      {isEditing
                        ? <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Số nhà, tên đường, khu vực..." />
                        : <div className="profile-field-view">{renderValue(profile?.address)}</div>
                      }
                    </div>

                    <div className="profile-form-group">
                      <label>Tỉnh/Thành phố</label>
                      {isEditing
                        ? (
                          <div className="profile-select-wrapper">
                            <select value={provinceId} onChange={e => { setProvinceId(e.target.value); setDistrictId(''); setWardCode('') }}>
                              <option value="">Chọn Tỉnh/Thành</option>
                              {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                            </select>
                            <ChevronDown size={16} className="profile-select-arrow" />
                          </div>
                        )
                        : <div className="profile-field-view">{provinceLabel}</div>
                      }
                    </div>

                    <div className="profile-form-group">
                      <label>Quận/Huyện</label>
                      {isEditing
                        ? (
                          <div className="profile-select-wrapper">
                            <select value={districtId} onChange={e => { setDistrictId(e.target.value); setWardCode('') }} disabled={!provinceId}>
                              <option value="">Chọn Quận/Huyện</option>
                              {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                            </select>
                            <ChevronDown size={16} className="profile-select-arrow" />
                          </div>
                        )
                        : <div className="profile-field-view">{districtLabel}</div>
                      }
                    </div>

                    <div className="profile-form-group">
                      <label>Phường/Xã</label>
                      {isEditing
                        ? (
                          <div className="profile-select-wrapper">
                            <select value={wardCode} onChange={e => setWardCode(e.target.value)} disabled={!districtId}>
                              <option value="">Chọn Phường/Xã</option>
                              {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                            </select>
                            <ChevronDown size={16} className="profile-select-arrow" />
                          </div>
                        )
                        : <div className="profile-field-view">{wardLabel}</div>
                      }
                    </div>
                  </div>

                  {saveError && <div className="profile-error-msg" style={{ marginTop: 16 }}>{saveError}</div>}

                  {isEditing && (
                    <div className="profile-actions">
                      <button className="profile-btn-cancel" onClick={handleCancel} disabled={isSaving}>
                        Hủy Thay Đổi
                      </button>
                      <button className="profile-btn-save" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Đang lưu...' : 'Lưu Cập Nhật'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          {(isChangingPassword || activeTab === 'password') && (
            <div className="profile-card" ref={passwordSectionRef}>
              <div className="profile-card__header">
                <div className="profile-card__title">
                  <KeyRound size={18} />
                  Đổi Mật Khẩu
                </div>
              </div>
              <div className="profile-card__body">
                <form className="profile-password-form" onSubmit={handleChangePassword}>
                  {passwordError && <div className="profile-error-msg">{passwordError}</div>}

                  <div className="profile-form-group">
                    <label>Mật khẩu hiện tại</label>
                    <div className="profile-password-input-wrap">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        required
                        value={passwordData.oldPassword}
                        onChange={e => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button type="button" className="profile-password-eye" onClick={() => setShowOldPassword(!showOldPassword)}>
                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label>Mật khẩu mới</label>
                    <div className="profile-password-input-wrap">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      />
                      <button type="button" className="profile-password-eye" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <div className="profile-password-input-wrap">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button type="button" className="profile-password-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button
                      type="button"
                      className="profile-btn-cancel"
                      onClick={() => { setIsChangingPassword(false); setActiveTab('info'); setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError('') }}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="profile-btn-save" disabled={isSubmittingPassword}>
                      {isSubmittingPassword ? 'Đang lưu...' : 'Lưu Mật Khẩu'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
