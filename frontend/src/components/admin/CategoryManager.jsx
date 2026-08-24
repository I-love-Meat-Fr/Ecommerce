import { useState, useEffect } from 'react'
import { categoryApi } from '../../services/api'
import { push } from './Toast'

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // null = create, Category = edit
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchCategories = () => {
    setLoading(true)
    categoryApi.getAll()
      .then(setCategories)
      .catch(() => push('Không tải được danh mục', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormDesc('')
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setFormName(cat.name)
    setFormDesc(cat.description || '')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formName.trim()) {
      push('Tên danh mục bắt buộc', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await categoryApi.update(editing.id, { name: formName.trim(), description: formDesc?.trim() || '' })
        push('Đã cập nhật danh mục', 'success')
      } else {
        await categoryApi.create({ name: formName.trim(), description: formDesc?.trim() || '' })
        push('Đã tạo danh mục mới', 'success')
      }
      setShowForm(false)
      fetchCategories()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Lưu thất bại'
      push(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await categoryApi.remove(id)
      push('Đã xóa danh mục', 'success')
      setConfirmDelete(null)
      fetchCategories()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Xóa thất bại'
      push(msg, 'error')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Danh mục sản phẩm</h2>
          <p className="text-xs text-ink-500 mt-0.5 font-mono">{categories.length} danh mục</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium bg-ink-900 text-white hover:bg-ink-800 transition-colors rounded-xs"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-12 shimmer rounded-xs" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-ink-500">
          <p className="font-display text-lg">Chưa có danh mục nào</p>
          <p className="text-xs mt-1">Tạo danh mục đầu tiên để quản lý sản phẩm</p>
        </div>
      ) : (
        <div className="border border-ink-200 rounded-xs overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ivory-100 border-b border-ink-200">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-ink-600 font-mono">Tên danh mục</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-ink-600 font-mono hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-ink-600 font-mono hidden md:table-cell">Mô tả</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-ink-600 font-mono">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-ivory-50 transition-colors group">
                  <td className="px-4 py-3 font-medium text-ink-900">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-500 hidden md:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3 text-xs text-ink-500 hidden md:table-cell">{cat.description || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="px-3 py-1 text-xs border border-ink-300 hover:border-ink-900 hover:bg-ink-900 hover:text-white rounded-xs transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setConfirmDelete(cat)}
                        className="px-3 py-1 text-xs border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xs transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="bg-white border border-ink-300 rounded-xs shadow-elevated w-full max-w-md animate-fade-up"
          >
            <div className="px-5 py-4 border-b border-ink-200 flex items-center">
              <h3 className="font-display text-xl text-ink-900">
                {editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="ml-auto text-ink-500 hover:text-ink-900 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
                  Tên danh mục <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Cây Giống Hoa"
                  autoFocus
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-600 font-mono mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Mô tả ngắn về danh mục (tùy chọn)"
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900 resize-none"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-ink-200 flex justify-end gap-2 bg-ivory-50">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2 text-sm border border-ink-300 text-ink-700 hover:bg-ink-100 rounded-xs transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-ink-900 text-white hover:bg-ink-800 rounded-xs transition-colors disabled:opacity-50"
              >
                {saving ? 'Đang lưu…' : editing ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm">
          <div className="bg-white border border-ink-300 rounded-xs shadow-elevated w-full max-w-sm animate-fade-up p-6">
            <h3 className="font-display text-xl text-ink-900 mb-2">Xóa danh mục?</h3>
            <p className="text-sm text-ink-600 mb-6">
              Danh mục <strong>"{confirmDelete.name}"</strong> sẽ bị xóa vĩnh viễn. Sản phẩm đang dùng danh mục này sẽ không bị xóa nhưng sẽ mất liên kết danh mục.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm border border-ink-300 text-ink-700 hover:bg-ink-100 rounded-xs transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-xs transition-colors"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
