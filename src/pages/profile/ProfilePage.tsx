import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
import { useTranslation } from 'react-i18next'
import '../../styles/pages/profile.css'
import type { UserProfile } from '../../types/user'

export default function ProfilePage() {
  const { t } = useTranslation()
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

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isEditing, setIsEditing] = useState(false)

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
        setError(t('profile.update_failed'))
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
    if (!value) return t('profile.not_updated')
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString('vi-VN')
  }

  const renderValue = (value: string | null | undefined) => value?.trim() ? value : t('profile.not_updated')

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
      toast.success(t('profile.update_success'))
    } catch {
      setSaveError(t('profile.update_failed'))
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
      toast.success('Đổi mật khẩu thành công')
      setIsChangingPassword(false)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  return (
    <section className="profile">
      <div className="profile__card">
        <div className="profile__header">
          <div>
            <p className="profile__eyebrow">{t('profile.eyebrow')}</p>
            <h1>{t('profile.title')}</h1>
          </div>
          <div className="profile__avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt={fullName || 'User'} />
            ) : (
              <span>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
        </div>

        <div className="profile__upload" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label className="profile__upload-label">
            {isUploading ? t('profile.uploading') : t('profile.avatar')}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
          </label>
          <button 
             type="button" 
             className="profile__upload-label" 
             style={{ cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', marginLeft: '10px' }}
             onClick={() => setIsChangingPassword(!isChangingPassword)}
          >
             {t('profile.change_pwd')}
          </button>
          {uploadError && <div className="profile__error">{uploadError}</div>}
        </div>

        {isChangingPassword && (
          <form className="profile__form" style={{ marginTop: '24px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }} onSubmit={handleChangePassword}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>{t('profile.change_pwd')}</h3>
            {passwordError && <div className="profile__error" style={{ marginBottom: '16px' }}>{passwordError}</div>}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>{t('profile.current_pwd')}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showOldPassword ? 'text' : 'password'} 
                  required 
                  value={passwordData.oldPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))} 
                  placeholder="Nhập mật khẩu hiện tại" 
                  style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>{t('profile.new_pwd')}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showNewPassword ? 'text' : 'password'} 
                  required 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} 
                  placeholder="Nhập mật khẩu mới" 
                  style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>{t('profile.confirm_new_pwd')}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  required 
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                  placeholder="Nhập lại mật khẩu mới" 
                  style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="profile__actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => setIsChangingPassword(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '500', cursor: 'pointer' }}
              >
                {t('profile.cancel')}
              </button>
              <button 
                type="submit" 
                disabled={isSubmittingPassword}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '500', cursor: 'pointer', opacity: isSubmittingPassword ? 0.7 : 1 }}
              >
                {isSubmittingPassword ? '...' : t('profile.save_pwd')}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="profile__loading">{t('profile.loading')}</div>
        ) : error ? (
          <div className="profile__error">{error}</div>
        ) : (
          <div className="profile__content">
            <div className="profile__grid">
              <div className="profile__item">
                <span>{t('profile.display_name')}</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                ) : (
                  <strong>{fullName || t('profile.not_updated')}</strong>
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
                <span>{t('profile.phone')}</span>
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
                <span>{t('profile.address')}</span>
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
                <span>{t('profile.province')}</span>
                {isEditing ? (
                  <select
                    value={provinceId}
                    onChange={(event) => {
                      setProvinceId(event.target.value)
                      setDistrictId('') // reset district when province changes
                      setWardCode('') // reset ward
                    }}
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong>
                    {provinces.find((p) => p.code.toString() === profile?.provinceId?.toString())?.name ||
                      renderValue(profile?.provinceId?.toString())}
                  </strong>
                )}
              </div>
              <div className="profile__item">
                <span>{t('profile.district')}</span>
                {isEditing ? (
                  <select
                    value={districtId}
                    onChange={(event) => {
                      setDistrictId(event.target.value)
                      setWardCode('') // reset ward
                    }}
                    disabled={!provinceId}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong>
                    {districts.find((d) => d.code.toString() === profile?.districtId?.toString())?.name ||
                      renderValue(profile?.districtId?.toString())}
                  </strong>
                )}
              </div>
              <div className="profile__item">
                <span>{t('profile.ward')}</span>
                {isEditing ? (
                  <select
                    value={wardCode}
                    onChange={(event) => setWardCode(event.target.value)}
                    disabled={!districtId}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong>
                    {wards.find((w) => w.code.toString() === profile?.wardCode?.toString())?.name ||
                      renderValue(profile?.wardCode)}
                  </strong>
                )}
              </div>
              <div className="profile__item">
                <span>{t('profile.gender')}</span>
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
                <span>{t('profile.dob')}</span>
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
                    {isSaving ? '...' : t('profile.save')}
                  </button>
                  <button
                    type="button"
                    className="profile__button profile__button--secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    {t('profile.cancel_edit')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="profile__button"
                  onClick={() => setIsEditing(true)}
                >
                  {t('profile.edit')}
                </button>
              )}
            </div>

            <div className="profile__actions">
              <button
                type="button"
                className="profile__button profile__button--secondary"
                onClick={() => navigate(PATHS.orders)}
              >
                {t('profile.orders')}
              </button>
              <button
                type="button"
                className="profile__button"
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', marginLeft: '12px' }}
                onClick={() => navigate(PATHS.sellerDashboard)}
              >
                {t('profile.seller_channel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
