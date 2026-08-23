import { useEffect, useState } from 'react'
import { userApi } from '../../services/api'
import { push } from './Toast'

function buildEmptyUser() {
  return {
    email: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'User',
    isActive: true,
    password: '',
  }
}

export default function UserFormModal({ open, user, currentAdminId, onClose, onSaved }) {
  const isEdit = Boolean(user)
  const [form, setForm] = useState(buildEmptyUser())
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState('')

  useEffect(() => {
    if (!open) return
    setErrors({})
    setResetMode(false)
    setNewPassword('')
    setResetError('')
    if (user) {
      setForm({
        email: user.email || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'User',
        isActive: user.isActive ?? true,
        password: '',
      })
    } else {
      setForm(buildEmptyUser())
    }
  }, [open, user])

  if (!open) return null

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email bắt buộc'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ'
    if (!form.fullName.trim()) e.fullName = 'Họ tên bắt buộc'
    if (!isEdit && (!form.password || form.password.length < 6))
      e.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    setBusy(true)
    try {
      if (isEdit) {
        await userApi.update(user.id, {
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          role: form.role,
          isActive: form.isActive,
        })
        push('Đã cập nhật người dùng', 'success')
      } else {
        await userApi.create({
          email: form.email.trim(),
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          role: form.role,
          isActive: form.isActive,
          password: form.password,
        })
        push('Đã tạo người dùng mới', 'success')
      }
      onSaved?.()
      onClose?.()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Lưu thất bại'
      push(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  const submitReset = async () => {
    setResetError('')
    if (!newPassword || newPassword.length < 6) {
      setResetError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }
    setBusy(true)
    try {
      await userApi.adminResetPassword(user.id, newPassword)
      push('Đã đặt lại mật khẩu', 'success')
      setResetMode(false)
      setNewPassword('')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đặt lại mật khẩu thất bại'
      setResetError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-ink-300 rounded-xs shadow-elevated w-full max-w-2xl my-8 animate-fade-up">
        <div className="p-5 border-b border-ink-200 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-1">— Người dùng</p>
            <h3 className="font-display text-xl text-ink-900">
              {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 text-sm"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                disabled={isEdit}
                onChange={(e) => update('email', e.target.value)}
                className="input-editorial disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="email@florist.vn"
              />
              {errors.email && <p className="text-xs text-red-600 mt-2">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className="input-editorial"
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && (
                <p className="text-xs text-red-600 mt-2">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="input-editorial"
                placeholder="0987 654 321"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                Vai trò
              </label>
              <select
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                className="input-editorial"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                Địa chỉ
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="input-editorial resize-none"
                placeholder="Chưa cập nhật"
              />
            </div>

            {!isEdit && (
              <div className="md:col-span-2">
                <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="input-editorial"
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-2">{errors.password}</p>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => update('isActive', e.target.checked)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-ink-700">
                  Tài khoản đang hoạt động (có thể đăng nhập)
                </span>
              </label>
            </div>

            {isEdit && user.id !== currentAdminId && (
              <div className="md:col-span-2 pt-5 border-t border-ivory-300">
                {!resetMode ? (
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs text-ink-600 hover:text-ink-900 underline underline-offset-4"
                  >
                    Đặt lại mật khẩu cho người dùng này
                  </button>
                ) : (
                  <div className="space-y-3 bg-ivory-100 p-4 border border-ink-200 rounded-xs">
                    <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-editorial"
                      placeholder="Tối thiểu 6 ký tự"
                      autoComplete="new-password"
                    />
                    {resetError && (
                      <p className="text-xs text-red-600">{resetError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={submitReset}
                        disabled={busy}
                        className="px-3 py-1.5 text-xs bg-ink-900 text-white rounded-xs hover:bg-ink-800 transition-colors disabled:opacity-50"
                      >
                        {busy ? 'Đang lưu…' : 'Đặt lại'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResetMode(false)
                          setNewPassword('')
                          setResetError('')
                        }}
                        className="px-3 py-1.5 text-xs border border-ink-300 text-ink-700 rounded-xs hover:bg-ink-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-ink-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm border border-ink-300 text-ink-700 hover:bg-ink-50 rounded-xs transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="px-4 py-2 text-sm font-medium bg-ink-900 hover:bg-ink-800 text-white rounded-xs transition-colors disabled:opacity-50"
          >
            {busy ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo người dùng'}
          </button>
        </div>
      </div>
    </div>
  )
}