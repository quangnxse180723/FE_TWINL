import React, { useState } from 'react'
import { sellerApi } from '../../../api/seller/sellerApi'
import { toast } from 'react-toastify'

interface DisputeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, description: string, evidenceImages: string[]) => Promise<void>
  isSubmitting: boolean
}

const REASONS = [
  'Hàng bị lỗi, hỏng hóc',
  'Hàng giao sai mô tả, sai sản phẩm',
  'Hàng giả, hàng nhái',
  'Thiếu hàng',
  'Khác'
]

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState(REASONS[0])
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả chi tiết')
      return
    }

    try {
      setUploading(true)
      let imageUrls: string[] = []
      
      if (images.length > 0) {
        const res = await sellerApi.uploadImages(images)
        imageUrls = res
      }

      await onSubmit(reason, description, imageUrls)
      
      // reset
      setReason(REASONS[0])
      setDescription('')
      setImages([])
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Yêu cầu Trả hàng / Hoàn tiền</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Lý do trả hàng <span style={{color: 'red'}}>*</span></label>
            <select 
              value={reason} 
              onChange={e => setReason(e.target.value)}
              style={inputStyle}
            >
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Mô tả chi tiết vấn đề <span style={{color: 'red'}}>*</span></label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Vui lòng mô tả chi tiết tình trạng hàng hóa..."
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Hình ảnh bằng chứng (tuỳ chọn nhưng khuyến nghị)</label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'block', marginTop: '8px' }}
            />
            {images.length > 0 && (
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                Đã chọn {images.length} ảnh
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting || uploading}
              style={cancelBtnStyle}
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || uploading}
              style={submitBtnStyle}
            >
              {uploading ? 'Đang tải ảnh...' : isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 500,
  fontSize: '14px'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '15px'
}

const btnStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none'
}

const cancelBtnStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: '#f3f4f6',
  color: '#374151'
}

const submitBtnStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: '#1a7a3e',
  color: 'white'
}
