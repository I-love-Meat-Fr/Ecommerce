import { useEffect, useState } from 'react'

let pushToast = null

export function push(message, type = 'info') {
  if (pushToast) pushToast(message, type)
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    pushToast = (message, type) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3500)
    }
    return () => {
      pushToast = null
    }
  }, [])

  const styles = {
    success: 'bg-sage-600 text-white border-sage-700',
    error: 'bg-red-600 text-white border-red-700',
    info: 'bg-ink-900 text-white border-ink-700',
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-2.5 border shadow-elevated rounded-xs text-sm font-medium min-w-[260px] max-w-md animate-fade-in ${styles[t.type] || styles.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}