import { useState, useEffect, useMemo } from 'react'
import { orderApi } from '../../services/api'
import { push } from './Toast'
import SafeImage from '../SafeImage'

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Chờ xác nhận' },
  { value: 'Processing', label: 'Đang xử lý' },
  { value: 'Shipped', label: 'Đang giao' },
  { value: 'Delivered', label: 'Đã giao' },
  { value: 'Cancelled', label: 'Đã hủy' },
]

const STATUS_LABELS = {
  Pending: { label: 'Chờ xác nhận', cls: 'bg-amber-50 border-amber-400 text-amber-700' },
  Processing: { label: 'Đang xử lý', cls: 'bg-blue-50 border-blue-400 text-blue-700' },
  Shipped: { label: 'Đang giao', cls: 'bg-indigo-50 border-indigo-400 text-indigo-700' },
  Delivered: { label: 'Đã giao', cls: 'bg-green-50 border-green-400 text-green-700' },
  Cancelled: { label: 'Đã hủy', cls: 'bg-red-50 border-red-400 text-red-700' },
}

const PAYMENT_LABELS = {
  COD: { label: 'COD', cls: 'bg-ivory-100 border-ink-300 text-ink-700' },
  Online: { label: 'Online', cls: 'bg-sage-50 border-sage-400 text-sage-700' },
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function OrderTable({ refreshSignal, onViewOrder }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const data = await orderApi.getAll()
      setOrders(data || [])
      setSelected([])
    } catch {
      push('Không tải được danh sách đơn hàng', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [refreshSignal])

  const filtered = useMemo(() => {
    let list = orders
    if (statusFilter) {
      list = list.filter((o) => o.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (o) =>
          (o.id || '').toLowerCase().includes(q) ||
          (o.shippingAddress || '').toLowerCase().includes(q) ||
          (o.userId || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, search, statusFilter])

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="px-6 py-4 border-b border-ink-200 bg-white flex items-center gap-3 flex-wrap">
        <h1 className="font-display text-2xl text-ink-900 mr-auto">Đơn hàng</h1>
        <span className="text-sm text-ink-500 font-mono">{filtered.length} đơn</span>

        <input
          type="text"
          placeholder="Tìm theo mã, địa chỉ…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900 w-56"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={load}
          className="px-4 py-2 text-sm border border-ink-300 text-ink-700 hover:bg-ink-50 rounded-xs transition-colors"
        >
          Tải lại
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-ivory-100 border-b border-ink-300 z-10">
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink-600 font-mono">
              <th className="px-4 py-2.5 w-10">
                <input type="checkbox" className="cursor-pointer" disabled />
              </th>
              <th className="px-4 py-2.5">Mã đơn</th>
              <th className="px-4 py-2.5">Khách hàng</th>
              <th className="px-4 py-2.5 text-right">Tổng tiền</th>
              <th className="px-4 py-2.5">Thanh toán</th>
              <th className="px-4 py-2.5">Trạng thái</th>
              <th className="px-4 py-2.5">Ngày đặt</th>
              <th className="px-4 py-2.5 text-right w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-ink-500">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-ink-500">
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
            {!loading && filtered.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.Pending
              const payInfo = PAYMENT_LABELS[order.paymentMethod] || PAYMENT_LABELS.COD
              const itemCount = order.items?.length || 0
              return (
                <tr
                  key={order.id}
                  className="border-b border-ink-200 hover:bg-ivory-50 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(order.id)}
                      onChange={() => toggleOne(order.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-mono font-medium text-ink-900 text-xs">{order.id}</div>
                    <div className="text-[11px] text-ink-400">{itemCount} sản phẩm</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-ink-900 font-medium truncate max-w-[180px]">
                      {order.shippingAddress || '—'}
                    </div>
                    <div className="text-[11px] text-ink-400 font-mono truncate max-w-[180px]">
                      {order.userId}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-ink-900 font-medium">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono rounded-xs border ${payInfo.cls}`}>
                      {payInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono rounded-xs border ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-600 text-xs">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="px-2.5 py-1 text-xs border border-ink-300 text-ink-700 hover:bg-ink-900 hover:text-white hover:border-ink-900 rounded-xs transition-colors"
                    >
                      Chi tiết
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
          Tổng: <strong className="text-ink-900">{filtered.length}</strong> đơn
          {search && <span className="ml-2">(lọc từ {orders.length})</span>}
        </span>
        <span>Hiển thị tất cả · không phân trang</span>
      </div>
    </div>
  )
}
