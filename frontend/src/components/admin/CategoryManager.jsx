import { useState, useEffect, useMemo } from 'react'
import { categoryApi } from '../../services/api'
import { push } from './Toast'
import { ChevronRight, ChevronDown } from 'lucide-react'

// Build a Map<id, node> for O(1) lookups when we need to find a node's
// parent by id while rendering the tree.
function indexById(nodes, out = new Map()) {
  for (const n of nodes || []) {
    out.set(n.id, n)
    if (n.children?.length) indexById(n.children, out)
  }
  return out
}

export default function CategoryManager() {
  const [tree, setTree] = useState([])
  const [flat, setFlat] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // null = create, Category = edit
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formParentId, setFormParentId] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const fetchTree = () => {
    setLoading(true)
    categoryApi.getTree()
      .then((data) => {
        setTree(data || [])
        // Build a flat list of all nodes for the parent-picker <select>.
        const out = []
        const visit = (node, depth) => {
          out.push({ id: node.id, name: node.name, slug: node.slug, depth })
          for (const c of node.children || []) visit(c, depth + 1)
        }
        for (const root of data || []) visit(root, 0)
        setFlat(out)
      })
      .catch(() => push('Không tải được danh mục', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTree() }, [])

  const byId = useMemo(() => indexById(tree), [tree])

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormDesc('')
    setFormParentId('')
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setFormName(cat.name)
    setFormDesc(cat.description || '')
    setFormParentId(cat.parentId || '')
    setShowForm(true)
  }

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
      // Only attach parentId when explicitly chosen. The backend treats empty
      // parentId as "make this a root category".
      if (formParentId) payload.parentId = formParentId
      if (editing) {
        await categoryApi.update(editing.id, payload)
        push('Đã cập nhật danh mục', 'success')
      } else {
        await categoryApi.create(payload)
        push('Đã tạo danh mục mới', 'success')
      }
      setShowForm(false)
      fetchTree()
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
      fetchTree()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Xóa thất bại'
      push(msg, 'error')
    }
  }

  // Resolve the parent name for the delete confirmation dialog.
  const confirmDeleteParent = confirmDelete
    ? byId.get(confirmDelete.parentId)?.name || null
    : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Danh mục sản phẩm</h2>
          <p className="text-xs text-ink-500 mt-0.5 font-mono">{flat.length} danh mục · cấu trúc cây N cấp</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium bg-ink-900 text-white hover:bg-ink-800 transition-colors rounded-xs"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Tree */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-10 shimmer rounded-xs" />)}
        </div>
      ) : flat.length === 0 ? (
        <div className="text-center py-12 text-ink-500">
          <p className="font-display text-lg">Chưa có danh mục nào</p>
          <p className="text-xs mt-1">Tạo danh mục đầu tiên để quản lý sản phẩm</p>
        </div>
      ) : (
        <div className="border border-ink-200 rounded-xs overflow-hidden">
          <div className="bg-ivory-100 border-b border-ink-200 px-4 py-3">
            <div className="grid md:grid-cols-12 gap-3 text-[10px] uppercase tracking-widest text-ink-600 font-mono">
              <div className="md:col-span-5">Tên danh mục</div>
              <div className="md:col-span-3 hidden md:block">Slug</div>
              <div className="md:col-span-2 hidden md:block">Cấp</div>
              <div className="md:col-span-2 text-right">Thao tác</div>
            </div>
          </div>
          <div className="divide-y divide-ink-100">
            {tree.map((node) => (
              <TreeRow
                key={node.id}
                node={node}
                depth={0}
                expandedIds={expandedIds}
                onToggle={toggleExpanded}
                onEdit={openEdit}
                onDelete={setConfirmDelete}
                byId={byId}
              />
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
                  Danh mục cha
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs focus:outline-none focus:border-ink-900 bg-white"
                >
                  <option value="">— Gốc (không có cha) —</option>
                  {flat
                    .filter((c) => !editing || c.id !== editing.id) // can't parent yourself
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {'· '.repeat(c.depth)} {c.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-ink-400 mt-1 font-light">
                  Để trống để tạo danh mục cấp cao nhất (gốc).
                </p>
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
              Danh mục <strong>"{confirmDelete.name}"</strong>
              {confirmDeleteParent && <> (con của <em>{confirmDeleteParent}</em>)</>}{' '}
              sẽ bị xóa vĩnh viễn. Sản phẩm đang dùng danh mục này sẽ không bị xóa nhưng sẽ mất liên kết danh mục.
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

// Recursive tree row. Each level adds left padding so the hierarchy reads
// at a glance without the visual noise of nested <ul>s.
function TreeRow({ node, depth, expandedIds, onToggle, onEdit, onDelete, byId }) {
  const hasChildren = (node.children || []).length > 0
  const isExpanded = expandedIds.has(node.id)
  const parent = byId.get(node.parentId)

  return (
    <>
      <div className="px-4 py-3 hover:bg-ivory-50 transition-colors group">
        <div className="grid md:grid-cols-12 gap-3 items-center text-sm">
          <div className="md:col-span-5 flex items-center gap-2 min-w-0" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren ? (
              <button
                onClick={() => onToggle(node.id)}
                className="p-0.5 -ml-1 text-ink-500 hover:text-ink-900"
                aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4 inline-block" />
            )}
            <span className="font-medium text-ink-900 truncate">{node.name}</span>
            {hasChildren && (
              <span className="text-[10px] uppercase tracking-widest text-ink-400 font-mono">
                ({node.children.length})
              </span>
            )}
          </div>
          <div className="md:col-span-3 hidden md:block font-mono text-xs text-ink-500 truncate">
            {node.slug}
          </div>
          <div className="md:col-span-2 hidden md:block text-xs text-ink-500">
            Cấp {depth + 1}
            {parent && <span className="text-ink-400"> · con của {parent.name}</span>}
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit(node)}
              className="px-3 py-1 text-xs border border-ink-300 hover:border-ink-900 hover:bg-ink-900 hover:text-white rounded-xs transition-colors"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(node)}
              className="px-3 py-1 text-xs border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xs transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
      {hasChildren && isExpanded && node.children.map((child) => (
        <TreeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          expandedIds={expandedIds}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          byId={byId}
        />
      ))}
    </>
  )
}