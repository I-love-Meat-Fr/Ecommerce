import { useEffect, useMemo, useState } from 'react'
import { productApi } from '../../services/api'
import { push } from './Toast'
import ConfirmModal from './ConfirmModal'
import SafeImage from '../SafeImage'

const CATEGORIES = ['', 'Hoa sinh nhật', 'Hoa khai trương', 'Hoa chia buồn', 'Hoa tình yêu', 'Hoa chúc mừng', 'Phụ kiện']

function formatVnd(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

function totalStock(product) {
  return (product.variants || []).reduce((sum, v) => sum + (v.availableStock ?? v.stock ?? 0), 0)
}

function minPrice(product) {
  const prices = (product.variants || []).map((v) => v.price || 0)
  return prices.length ? Math.min(...prices) : null
}

function activeVariantCount(product) {
  return (product.variants || []).filter((v) => v.isActive).length
}

export default function ProductTable({ onEdit, refreshSignal }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [confirm, setConfirm] = useState(null) // { type, payload }
  const [bulkBusy, setBulkBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await productApi.getAll(category || null)
      setProducts(data || [])
      setSelected(new Set())
    } catch (err) {
      push('Không tải được danh sách sản phẩm', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, refreshSignal])

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if ((p.name || '').toLowerCase().includes(q)) return true
      if ((p.category || '').toLowerCase().includes(q)) return true
      if ((p.id || '').toLowerCase().includes(q)) return true
      return (p.variants || []).some(
        (v) =>
          (v.sku || '').toLowerCase().includes(q) ||
          (v.name || '').toLowerCase().includes(q)
      )
    })
  }, [products, search])

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))
  const someSelected = selected.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((p) => p.id)))
    }
  }

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const doDelete = async (id) => {
    try {
      await productApi.remove(id)
      push('Đã xóa sản phẩm', 'success')
      await load()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Xóa thất bại'
      push(msg, 'error')
    }
  }

  const doBulkAction = async (action) => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    setBulkBusy(true)
    try {
      if (action === 'delete') {
        await Promise.allSettled(ids.map((id) => productApi.remove(id)))
        push(`Đã xóa ${ids.length} sản phẩm`, 'success')
      } else if (action === 'activate' || action === 'deactivate') {
        const flag = action === 'activate'
        await Promise.allSettled(
          ids.map((id) => {
            const p = products.find((x) => x.id === id)
            if (!p) return Promise.resolve()
            const updated = {
              ...p,
              variants: (p.variants || []).map((v) => ({ ...v, isActive: flag })),
            }
            return productApi.update(id, updated)
          })
        )
        push(`Đã ${flag ? 'bật' : 'tắt'} ${ids.length} sản phẩm`, 'success')
      }
      await load()
    } catch (err) {
      push('Thao tác hàng loạt thất bại', 'error')
    } finally {
      setBulkBusy(false)
      setConfirm(null)
    }
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="px-6 py-4 border-b border-ink-200 bg-white flex items-center gap-3 flex-wrap">
        <h1 className="font-display text-2xl text-ink-900 mr-auto">Sản phẩm</h1>

        <input
          type="text"
          placeholder="Tìm theo tên, SKU, danh mục…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900 w-64"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c || 'Tất cả danh mục'}
            </option>
          ))}
        </select>

        <button
          onClick={() => onEdit(null)}
          className="px-4 py-2 text-sm font-medium bg-ink-900 text-white rounded-xs hover:bg-ink-800 transition-colors"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {selected.size > 0 && (
        <div className="px-6 py-2 bg-sage-100 border-b border-sage-300 flex items-center gap-3 text-sm">
          <span className="text-sage-600 font-medium">
            Đã chọn {selected.size} sản phẩm
          </span>
          <button
            disabled={bulkBusy}
            onClick={() => setConfirm({ type: 'bulk-activate' })}
            className="px-3 py-1 text-xs border border-sage-600 text-sage-600 hover:bg-sage-600 hover:text-white rounded-xs transition-colors disabled:opacity-50"
          >
            Bật hiển thị
          </button>
          <button
            disabled={bulkBusy}
            onClick={() => setConfirm({ type: 'bulk-deactivate' })}
            className="px-3 py-1 text-xs border border-ink-500 text-ink-600 hover:bg-ink-600 hover:text-white rounded-xs transition-colors disabled:opacity-50"
          >
            Tắt hiển thị
          </button>
          <button
            disabled={bulkBusy}
            onClick={() => setConfirm({ type: 'bulk-delete' })}
            className="px-3 py-1 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-xs transition-colors disabled:opacity-50"
          >
            Xóa hàng loạt
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-ink-500 hover:text-ink-900"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-ivory-100 border-b border-ink-300 z-10">
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink-600 font-mono">
              <th className="px-4 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                  onChange={toggleAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="px-4 py-2.5 w-16">Ảnh</th>
              <th className="px-4 py-2.5">Tên sản phẩm</th>
              <th className="px-4 py-2.5">Danh mục</th>
              <th className="px-4 py-2.5 text-right">Giá từ</th>
              <th className="px-4 py-2.5 text-right">Tồn kho</th>
              <th className="px-4 py-2.5 text-center">Biến thể</th>
              <th className="px-4 py-2.5 text-center">Trạng thái</th>
              <th className="px-4 py-2.5 text-right w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-ink-500">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-ink-500">
                  Không có sản phẩm nào.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((p) => {
                const stock = totalStock(p)
                const lowStock = stock > 0 && stock < 10
                const outStock = stock === 0
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-ink-200 hover:bg-ivory-50 transition-colors ${
                      selected.has(p.id) ? 'bg-sage-50' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleOne(p.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="w-10 h-10 border border-ink-200 rounded-xs overflow-hidden bg-ivory-100">
                        <SafeImage
                          src={p.imageUrl}
                          alt={p.name}
                          fallbackSeed={p.id || p.name}
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-ink-900 leading-snug">{p.name}</div>
                      <div className="text-[11px] text-ink-500 font-mono">{p.id}</div>
                    </td>
                    <td className="px-4 py-2.5 text-ink-700">{p.category || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink-900">
                      {formatVnd(minPrice(p))}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {outStock ? (
                        <span className="text-red-600 font-medium">Hết</span>
                      ) : lowStock ? (
                        <span className="text-amber-600">{stock}</span>
                      ) : (
                        <span className="text-ink-900">{stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="font-mono text-xs text-ink-700">
                        {(p.variants || []).length}{' '}
                        <span className="text-ink-400">({activeVariantCount(p)} hiện)</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono rounded-xs border ${
                          activeVariantCount(p) > 0
                            ? 'border-sage-600 text-sage-600 bg-sage-50'
                            : 'border-ink-400 text-ink-500 bg-ink-50'
                        }`}
                      >
                        {activeVariantCount(p) > 0 ? 'Đang bán' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => onEdit(p)}
                        className="px-2.5 py-1 text-xs border border-ink-300 text-ink-700 hover:bg-ink-900 hover:text-white hover:border-ink-900 rounded-xs transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setConfirm({ type: 'one', payload: p })}
                        className="ml-1 px-2.5 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xs transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-2 border-t border-ink-200 bg-ivory-100 text-xs text-ink-500 font-mono flex items-center justify-between">
        <span>
          Tổng: <strong className="text-ink-900">{filtered.length}</strong> sản phẩm
          {search && (
            <span className="ml-2">
              (lọc từ {products.length})
            </span>
          )}
        </span>
        <span>Hiển thị tất cả · không phân trang</span>
      </div>

      <ConfirmModal
        open={confirm?.type === 'one'}
        title="Xóa sản phẩm"
        message={
          <>
            Bạn có chắc muốn xóa <strong>"{confirm?.payload?.name}"</strong>? Hành động này không thể hoàn tác.
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
      <ConfirmModal
        open={confirm?.type === 'bulk-delete'}
        title={`Xóa ${selected.size} sản phẩm`}
        message="Tất cả sản phẩm đã chọn sẽ bị xóa vĩnh viễn. Bạn chắc chứ?"
        confirmText="Xóa hết"
        danger
        onConfirm={() => doBulkAction('delete')}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm?.type === 'bulk-activate'}
        title={`Bật hiển thị ${selected.size} sản phẩm`}
        message="Tất cả biến thể của các sản phẩm đã chọn sẽ được bật."
        confirmText="Bật"
        onConfirm={() => doBulkAction('activate')}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm?.type === 'bulk-deactivate'}
        title={`Tắt hiển thị ${selected.size} sản phẩm`}
        message="Tất cả biến thể của các sản phẩm đã chọn sẽ bị ẩn khỏi cửa hàng."
        confirmText="Tắt"
        danger
        onConfirm={() => doBulkAction('deactivate')}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}