import { useEffect, useMemo, useState } from 'react'
import { userApi } from '../../services/api'
import { push } from './Toast'
import ConfirmModal from './ConfirmModal'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function UserTable({ onEdit, refreshSignal }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirm, setConfirm] = useState(null) // { type, payload }

  const load = async () => {
    setLoading(true)
    try {
      const data = await userApi.getAll()
      setUsers(data || [])
    } catch (err) {
      push('Không tải được danh sách người dùng', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal])

  const filtered = useMemo(() => {
    let out = users
    if (roleFilter) out = out.filter((u) => (u.role || '') === roleFilter)
    if (statusFilter === 'active') out = out.filter((u) => u.isActive)
    if (statusFilter === 'inactive') out = out.filter((u) => !u.isActive)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter(
        (u) =>
          (u.email || '').toLowerCase().includes(q) ||
          (u.fullName || '').toLowerCase().includes(q) ||
          (u.phone || '').toLowerCase().includes(q)
      )
    }
    return out
  }, [users, search, roleFilter, statusFilter])

  const doDelete = async (id) => {
    try {
      await userApi.remove(id)
      push('Đã xóa người dùng', 'success')
      await load()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Xóa thất bại'
      push(msg, 'error')
    }
  }

  const doToggleActive = async (user) => {
    try {
      await userApi.update(user.id, { isActive: !user.isActive })
      push(`Đã ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản`, 'success')
      await load()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Thao tác thất bại'
      push(msg, 'error')
    }
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="px-6 py-4 border-b border-ink-200 bg-white flex items-center gap-3 flex-wrap">
        <h1 className="font-display text-2xl text-ink-900 mr-auto">Người dùng</h1>

        <input
          type="text"
          placeholder="Tìm theo email, tên, SĐT…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900 w-64"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900"
        >
          <option value="">Tất cả vai trò</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>

        <button
          onClick={() => onEdit(null)}
          className="px-4 py-2 text-sm font-medium bg-ink-900 text-white rounded-xs hover:bg-ink-800 transition-colors"
        >
          + Thêm người dùng
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-ivory-100 border-b border-ink-300 z-10">
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink-600 font-mono">
              <th className="px-4 py-2.5">Họ tên</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Số điện thoại</th>
              <th className="px-4 py-2.5 text-center">Vai trò</th>
              <th className="px-4 py-2.5 text-center">Trạng thái</th>
              <th className="px-4 py-2.5">Ngày tạo</th>
              <th className="px-4 py-2.5 text-right w-44">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-500">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-500">
                  Không có người dùng nào.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-ink-200 hover:bg-ivory-50 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-ink-900 leading-snug">{u.fullName}</div>
                    <div className="text-[11px] text-ink-500 font-mono">{u.id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-700">{u.email}</td>
                  <td className="px-4 py-2.5 text-ink-700">{u.phone || '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono rounded-xs border ${
                        u.role === 'Admin'
                          ? 'border-champagne-500 text-champagne-600 bg-champagne-50'
                          : 'border-ink-400 text-ink-500 bg-ink-50'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono rounded-xs border ${
                        u.isActive
                          ? 'border-sage-600 text-sage-600 bg-sage-50'
                          : 'border-red-400 text-red-600 bg-red-50'
                      }`}
                    >
                      {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-700 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onEdit(u)}
                      className="px-2.5 py-1 text-xs border border-ink-300 text-ink-700 hover:bg-ink-900 hover:text-white hover:border-ink-900 rounded-xs transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => doToggleActive(u)}
                      className={`ml-1 px-2.5 py-1 text-xs border rounded-xs transition-colors ${
                        u.isActive
                          ? 'border-amber-400 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500'
                          : 'border-sage-400 text-sage-700 hover:bg-sage-500 hover:text-white hover:border-sage-500'
                      }`}
                    >
                      {u.isActive ? 'Khóa' : 'Mở'}
                    </button>
                    <button
                      onClick={() => setConfirm({ type: 'one', payload: u })}
                      className="ml-1 px-2.5 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xs transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-2 border-t border-ink-200 bg-ivory-100 text-xs text-ink-500 font-mono flex items-center justify-between">
        <span>
          Tổng: <strong className="text-ink-900">{filtered.length}</strong> người dùng
          {search && <span className="ml-2">(lọc từ {users.length})</span>}
        </span>
        <span>Hiển thị tất cả · không phân trang</span>
      </div>

      <ConfirmModal
        open={confirm?.type === 'one'}
        title="Xóa người dùng"
        message={
          <>
            Bạn có chắc muốn xóa <strong>"{confirm?.payload?.fullName}"</strong> (
            {confirm?.payload?.email})? Hành động này không thể hoàn tác.
          </>
        }
        confirmText="Xóa"
        danger
        onConfirm={() => {
          doDelete(confirm.payload.id)
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}