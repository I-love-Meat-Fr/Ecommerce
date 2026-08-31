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
  const [formSort, setFormSort] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAll = () => {
    setLoading(true)
    categoryApi.getAll()
      .then((data) => setCategories(data || []))
      .catch(() => push('Không tải được danh mục', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormDesc('')
    setFormSort('')
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setFormName(cat.name)
    setFormDesc(cat.description || '')
    setFormSort(String(cat.sortOrder || 0))
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
      const payload = {
        name: formName.trim(),
        description: formDesc?.trim() || '',
      }
      if (editing) {
        await categoryApi.update(editing.id, payload)
        push('Đã cập nhật danh mục', 'success')
      } else {
        await categoryApi.create(payload)
        push('Đã tạo danh mục mới', 'success')
      }
      setShowForm(false)
      fetchAll()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Lưu thất bại'
      push(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await categoryApi.remove(id)
      push('Đã xóa danh mục', 'success')
      setConfirmDelete(null)
      fetchAll()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Xóa thất bại'
      push(msg, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Danh mục sản phẩm</h2>
          <p className="text-xs text-ink-500 mt-0.5 font-mono">{categories.length} danh mục · danh sách phẳng</p>
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
          {[1, 2, 3].map(i => <div key={i} className="h-10 shimmer rounded-xs" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-ink-500">
          <p className="font-display text-lg">Chưa có danh mục nào</p>
          <p className="text-xs mt-1">Tạo danh mục đầu tiên để quản lý sản phẩm</p>
        </div>
      ) : (
        <div className="border border-ink-200 rounded-xs overflow-hidden">
          <div className="bg-ivory-100 border-b border-ink-200 px-4 py-3">
            <div className="grid grid-cols-12 gap-3 text-[10px] uppercase tracking-widest text-ink-600 font-mono">
              <div className="col-span-5">Tên danh mục</div>
              <div className="col-span-4 hidden md:block">Slug</div>
              <div className="col-span-1 hidden md:block text-center">Thứ tự</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>
          </div>
          <div className="divide-y divide-ink-100">
            {categories.map((cat) => (
              <div key={cat.id} className="px-4 py-3 hover:bg-ivory-50 transition-colors">
                <div className="grid grid-cols-12 gap-3 items-center text-sm">
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-sage-400 flex-shrink-0" />
                    <span className="font-medium text-ink-900 truncate">{cat.name}</span>
                  </div>
                  <div className="col-span-4 hidden md:block font-mono text-xs text-ink-500 truncate">
                    {cat.slug}
                  </div>
                  <div className="col-span-1 hidden md:block text-center text-xs text-ink-400 font-mono">
                    {cat.sortOrder ?? 0}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
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
                </div>
                {cat.description && (
                  <p className="mt-1 text-xs text-ink-500 font-light pl-4 truncate">
                    {cat.description}
                  </p>
                )}
              </div>
            ))}
          </div>
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
                  placeholder="Ví dụ: Monstera Deliciosa"
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
              Danh mục <strong>"{confirmDelete.name}"</strong> sẽ bị xóa vĩnh viễn.
              Sản phẩm đang dùng danh mục này sẽ không bị xóa nhưng sẽ mất liên kết danh mục.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm border border-ink-300 text-ink-700 hover:bg-ink-100 rounded-xs transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-xs transition-colors disabled:opacity-50"
              >
                {deleting ? 'Đang xóa…' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}