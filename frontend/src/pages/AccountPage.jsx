import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { userApi } from '../services/api'
import { push } from '../components/admin/Toast'

function ProfileSection({ user, onSaved }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)

  // Re-sync when the auth store updates after a save.
  useEffect(() => {
    setForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    })
  }, [user?.fullName, user?.phone, user?.address])

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const cancel = () => {
    setEditing(false)
    setErrors({})
    setForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    })
  }

  const save = async () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên'
    setErrors(e)
    if (Object.keys(e).length) return

    setBusy(true)
    try {
      await userApi.update(user.id, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      })
      push('Đã cập nhật thông tin', 'success')
      setEditing(false)
      onSaved?.()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Cập nhật thất bại'
      push(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card-editorial p-8 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="eyebrow mb-2">— Hồ sơ</p>
          <h2 className="font-display text-2xl text-ink-900">Thông tin cá nhân</h2>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-luxury-outline">
            Chỉnh sửa
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="input-editorial opacity-60 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
            Họ và tên
          </label>
          <input
            type="text"
            value={form.fullName}
            disabled={!editing}
            onChange={(e) => update('fullName', e.target.value)}
            className="input-editorial disabled:opacity-70"
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
            disabled={!editing}
            onChange={(e) => update('phone', e.target.value)}
            className="input-editorial disabled:opacity-70"
            placeholder="Chưa cập nhật"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
            Địa chỉ
          </label>
          <textarea
            rows={2}
            value={form.address}
            disabled={!editing}
            onChange={(e) => update('address', e.target.value)}
            className="input-editorial disabled:opacity-70 resize-none"
            placeholder="Chưa cập nhật"
          />
        </div>
      </div>

      {editing && (
        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-ivory-300">
          <button
            onClick={save}
            disabled={busy}
            className="btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
          <button onClick={cancel} disabled={busy} className="btn-luxury-outline">
            Hủy
          </button>
        </div>
      )}
    </div>
  )
}

function PasswordSection() {
  const { user } = useAuthStore()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const submit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!form.current) err.current = 'Vui lòng nhập mật khẩu hiện tại'
    if (!form.next || form.next.length < 6) err.next = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    if (form.next !== form.confirm) err.confirm = 'Mật khẩu xác nhận không khớp'
    setErrors(err)
    if (Object.keys(err).length) return

    setBusy(true)
    try {
      await userApi.changePassword(user.id, form.current, form.next)
      push('Đã đổi mật khẩu', 'success')
      setForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đổi mật khẩu thất bại'
      push(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="card-editorial p-8 md:p-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">— Bảo mật</p>
        <h2 className="font-display text-2xl text-ink-900">Đổi mật khẩu</h2>
      </div>

      <div className="space-y-5 max-w-md">
        <div>
          <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            value={form.current}
            onChange={(e) => update('current', e.target.value)}
            className="input-editorial"
            autoComplete="current-password"
          />
          {errors.current && <p className="text-xs text-red-600 mt-2">{errors.current}</p>}
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
            Mật khẩu mới
          </label>
          <input
            type="password"
            value={form.next}
            onChange={(e) => update('next', e.target.value)}
            className="input-editorial"
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự"
          />
          {errors.next && <p className="text-xs text-red-600 mt-2">{errors.next}</p>}
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.2em] uppercase text-ink-600 mb-2">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => update('confirm', e.target.value)}
            className="input-editorial"
            autoComplete="new-password"
          />
          {errors.confirm && <p className="text-xs text-red-600 mt-2">{errors.confirm}</p>}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="btn-luxury disabled:opacity-50 disabled:cursor-not-allowed mt-3"
        >
          {busy ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}
        </button>
      </div>
    </form>
  )
}

function AccountPage() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="bg-ivory-50 min-h-[calc(100vh-200px)] py-16 md:py-24">
      <div className="container-narrow">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">— Tài khoản</p>
            <h1 className="font-display text-4xl md:text-5xl text-ink-900">
              Xin chào, <em className="italic text-champagne-500">{user?.fullName || 'bạn'}</em>
            </h1>
            <p className="text-ink-500 font-light mt-3 text-sm">
              Vai trò: {user?.role === 'Admin' ? 'Quản trị viên' : 'Khách hàng'}
            </p>
          </div>

          <div className="space-y-6">
            <ProfileSection user={user} onSaved={refreshUser} />
            <PasswordSection />

            <div className="text-center pt-4">
              <button onClick={handleLogout} className="btn-luxury-outline">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage