export default function ConfirmModal({
  open,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
      <div className="bg-white border border-ink-300 rounded-xs shadow-elevated w-full max-w-md animate-fade-up">
        <div className="p-5 border-b border-ink-200">
          <h3 className="font-display text-xl text-ink-900">{title}</h3>
        </div>
        <div className="p-5 text-sm text-ink-700 font-light leading-relaxed">
          {message}
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-ink-300 text-ink-700 hover:bg-ink-50 rounded-xs transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-xs transition-colors ${
              danger
                ? 'bg-red-600 hover:bg-red-700 text-white border border-red-700'
                : 'bg-ink-900 hover:bg-ink-800 text-white border border-ink-900'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}