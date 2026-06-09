import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import { userApi } from '../../api/users/userApi'
import { updateUser } from '../../store/slices/authSlice'
import { updateAuthUser } from '../../utils/authStorage'
import { API_BASE_URL } from '../../config/constants'
import type { RootState } from '../../store'
import '../../styles/pages/profile.css'
import type { UserProfile } from '../../types/user'

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
  const [isEditing, setIsEditing] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [wardCode, setWardCode] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [provinceId, setProvinceId] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  useEffect(() => {
    if (!user) {
      navigate(PATHS.login)
    }
  }, [navigate, user])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await userApi.getMe()
        setProfile(data)
        syncFormState(data)
      } catch {
        setError('Không thể tải thông tin hồ sơ. Hãy thử lại.')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
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
    } catch {
      setSaveError('Không thể cập nhật hồ sơ. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      syncFormState(profile)
    }
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
    } catch {
      setUploadError('Vui lòng tải ảnh dưới 10 MB. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <section className="profile">
      <div className="profile__card">
        <div className="profile__header">
          <div>
            <p className="profile__eyebrow">Tài khoản của bạn</p>
            <h1>Hồ sơ người dùng</h1>
          </div>
          <div className="profile__avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt={fullName || 'User'} />
            ) : (
              <span>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
        </div>

        <div className="profile__upload">
          <label className="profile__upload-label">
            {isUploading ? 'Đang tải ảnh...' : 'Tải ảnh đại diện'}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
          </label>
          {uploadError ? <div className="profile__error">{uploadError}</div> : null}
        </div>

        {isLoading ? (
          <div className="profile__loading">Đang tải thông tin...</div>
        ) : error ? (
          <div className="profile__error">{error}</div>
        ) : (
          <div className="profile__content">
            <div className="profile__grid">
              <div className="profile__item">
                <span>Tên hiển thị</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                ) : (
                  <strong>{fullName || 'Chưa cập nhật'}</strong>
                )}
              </div>
              <div className="profile__item">
                <span>Email</span>
                {isEditing ? (
                  <input type="text" value={renderValue(profile?.email)} disabled />
                ) : (
                  <strong>{renderValue(profile?.email)}</strong>
                )}
              </div>
              <div className="profile__item">
                <span>Số điện thoại</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                ) : (
                  <strong>{renderValue(profile?.phone)}</strong>
                )}
              </div>
              <div className="profile__item">
                <span>Địa chỉ</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                ) : (
                  <strong>{renderValue(profile?.address)}</strong>
                )}
              </div>
              <div className="profile__item">
                <span>Mã Phường/Xã (Ward Code)</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={wardCode}
                    onChange={(event) => setWardCode(event.target.value)}
                  />
                ) : (
                  <strong>{renderValue(profile?.wardCode)}</strong>
                )}
              </div>
              <div className="profile__item">
                <span>Mã Quận/Huyện (District ID)</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={districtId}
                    onChange={(event) => setDistrictId(event.target.value)}
                  />
                ) : (
                  <strong>{renderValue(profile?.districtId?.toString())}</strong>
                )}
              </div>
              <div className="profile__item">
                <span>Mã Tỉnh/Thành (Province ID)</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={provinceId}
                    onChange={(event) => setProvinceId(event.target.value)}
                  />
                ) : (
                  <strong>{renderValue(profile?.provinceId?.toString())}</strong>
                )}
              </div>
              <div className="profile__item">
                <span>Giới tính</span>
                {isEditing ? (
                  <select value={gender} onChange={(event) => setGender(event.target.value)}>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <strong>{renderValue(profile?.gender)}</strong>
                )}
              </div>
              <div className="profile__item">
                <span>Ngày sinh</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={normalizeDate(dateOfBirth)}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                  />
                ) : (
                  <strong>{formatDate(profile?.dateOfBirth ?? null)}</strong>
                )}
              </div>
            </div>

            {saveError ? <div className="profile__error">{saveError}</div> : null}

            <div className={`profile__actions${isEditing ? ' profile__actions--edit' : ''}`}>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="profile__button"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    type="button"
                    className="profile__button profile__button--secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Hủy sửa
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="profile__button"
                  onClick={() => setIsEditing(true)}
                >
                  Sửa thông tin
                </button>
              )}
            </div>

            <div className="profile__actions">
              <button
                type="button"
                className="profile__button profile__button--secondary"
                onClick={() => navigate(PATHS.orders)}
              >
                Lịch sử đơn hàng mua
              </button>
              <button
                type="button"
                className="profile__button"
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', marginLeft: '12px' }}
                onClick={() => navigate(PATHS.sellerDashboard)}
              >
                Kênh Người Bán (Ký gửi)
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
