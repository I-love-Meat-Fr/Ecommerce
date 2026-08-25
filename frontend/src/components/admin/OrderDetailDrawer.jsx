import { useState, useEffect } from 'react'
import { orderApi } from '../../services/api'
import SafeImage from '../SafeImage'

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Chờ xác nhận' },
  { value: 'Processing', label: 'Đang xử lý' },
  { value: 'Shipped', label: 'Đang giao' },
  { value: 'Delivered', label: 'Đã giao' },
  { value: 'Cancelled', label: 'Đã hủy' },
]

const STATUS_STEP = ['Pending', 'Processing', 'Shipped', 'Delivered']

const STATUS_LABELS = {
  Pending: { label: 'Chờ xác nhận', cls: 'text-amber-600' },
  Processing: { label: 'Đang xử lý', cls: 'text-blue-600' },
  Shipped: { label: 'Đang giao', cls: 'text-indigo-600' },
  Delivered: { label: 'Đã giao', cls: 'text-green-600' },
  Cancelled: { label: 'Đã hủy', cls: 'text-red-600' },
}

const PAYMENT_LABELS = {
  COD: 'Thanh toán khi nhận hàng',
  Online: 'Thanh toán trực tuyến',
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function OrderDetailDrawer({ order, onClose, onUpdated }) {
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [statusForm, setStatusForm] = useState({ status: '', note: '' })
  const [updating, setUpdating] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  useEffect(() => {
    if (!order) return
    setStatusForm({ status: order.status, note: '' })
    setLoadingLogs(true)
    orderApi.getStatusLogs(order.id)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoadingLogs(false))
  }, [order])

  if (!order) return null

  const statusIndex = STATUS_STEP.indexOf(order.status)
  const isCancelled = order.status === 'Cancelled'

  const handleUpdateStatus = async () => {
    if (statusForm.status === order.status) return
    setUpdating(true)
    try {
      await orderApi.updateStatus(order.id, statusForm.status, statusForm.note || null)
      onUpdated?.()
      onClose()
    } catch {
      // error handled by interceptor
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 bg-ivory-50">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-0.5">Chi tiết đơn hàng</p>
            <h2 className="font-display text-xl text-ink-900 font-mono">{order.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-400 hover:text-ink-900 transition-colors"
            aria-label="Đóng"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Timeline */}
          {!isCancelled && (
            <div className="bg-ivory-50 border border-ivory-300 p-5">
              <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-4 font-mono">
                Tiến trình đơn hàng
              </p>
              <div className="relative">
                {/* Connector line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-ink-200" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-ink-900 transition-all"
                  style={{ width: `${(statusIndex / (STATUS_STEP.length - 1)) * 100}%` }}

                />
                <div className="relative flex justify-between">
                  {STATUS_STEP.map((step, i) => {
                    const isDone = i <= statusIndex
                    const isCurrent = i === statusIndex
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold transition-colors z-10 ${
                          isDone
                            ? 'bg-ink-900 border-ink-900 text-white'
                            : 'bg-white border-ink-300 text-ink-400'
                        }`}>
                          {i + 1}
                        </div>
                        <p className={`text-[10px] mt-2 text-center font-medium leading-tight max-w-[60px] ${
                          isCurrent ? 'text-ink-900' : isDone ? 'text-ink-700' : 'text-ink-400'
                        }`}>
                          {STATUS_LABELS[step]?.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-1">Trạng thái</p>
              <p className={`font-medium ${STATUS_LABELS[order.status]?.cls}`}>
                {STATUS_LABELS[order.status]?.label}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-1">Thanh toán</p>
              <p className="font-medium text-ink-900">
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-1">Ngày đặt</p>
              <p className="font-medium text-ink-900 text-sm">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-1">Mã khách</p>
              <p className="font-medium text-ink-900 text-xs font-mono break-all">
                {order.userId}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-1">Địa chỉ giao hàng</p>
            <p className="text-sm text-ink-900 font-light leading-relaxed">
              {order.shippingAddress || '—'}
            </p>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-3 font-mono">
              Sản phẩm ({order.items?.length || 0})
            </p>
            <div className="space-y-3">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex gap-3 p-3 bg-ivory-50 border border-ivory-200">
                  <div className="w-12 h-12 border border-ivory-300 bg-white flex-shrink-0 overflow-hidden">
                    <SafeImage
                      src={item.productId}
                      alt={item.productName}
                      fallbackSeed={item.productId}
                      imgClassName="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display text-ink-900 truncate">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-[10px] text-ink-500 uppercase tracking-wide">{item.variantName}</p>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-ink-500">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                      <p className="text-sm font-display text-ink-900">
                        {formatPrice(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-ivory-300 flex justify-between items-baseline">
              <span className="font-display text-base text-ink-900">Tổng cộng</span>
              <span className="font-display text-2xl text-ink-900">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Status Change Form */}
          {!isCancelled && (
            <div className="bg-ivory-50 border border-ivory-300 p-5">
              <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-3 font-mono">
                Cập nhật trạng thái
              </p>
              <div className="space-y-3">
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900"
                >
                  {STATUS_OPTIONS.filter((o) => o.value !== 'Cancelled').map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={statusForm.note}
                  onChange={(e) => setStatusForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Ghi chú (tùy chọn)"
                  className="w-full px-3 py-2 text-sm border border-ink-300 rounded-xs bg-white focus:outline-none focus:border-ink-900"
                />
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || statusForm.status === order.status}
                  className="w-full py-2.5 text-sm font-medium bg-ink-900 text-white rounded-xs hover:bg-ink-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {updating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </button>
              </div>
            </div>
          )}

          {/* Status Logs */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-3 font-mono">
              Lịch sử thay đổi
            </p>
            {loadingLogs ? (
              <p className="text-sm text-ink-400 italic">Đang tải...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-ink-400 italic">Chưa có lịch sử.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-3.5 top-2 bottom-2 w-px bg-ivory-300" />
                <div className="space-y-4">
                  {logs.map((log, i) => (
                    <div key={log.id || i} className="flex gap-3 pl-0">
                      <div className="relative z-10 w-7 h-7 rounded-full border-2 border-ivory-300 bg-white flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-ink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {log.fromStatus && (
                            <>
                              <span className={`text-xs font-medium ${STATUS_LABELS[log.fromStatus]?.cls || 'text-ink-600'}`}>
                                {STATUS_LABELS[log.fromStatus]?.label || log.fromStatus}
                              </span>
                              <span className="text-xs text-ink-400">→</span>
                            </>
                          )}
                          <span className={`text-xs font-medium ${STATUS_LABELS[log.toStatus]?.cls || 'text-ink-600'}`}>
                            {STATUS_LABELS[log.toStatus]?.label || log.toStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-400 mt-0.5 font-mono">
                          {formatDate(log.changedAt)}
                        </p>
                        {log.note && (
                          <p className="text-xs text-ink-600 mt-1 italic">{log.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
