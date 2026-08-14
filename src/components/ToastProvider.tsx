import { useCallback, useRef, useState, type ReactNode } from 'react'
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react'
import { ToastContext, type ToastItem, type ToastType } from './toast-context'

const icons = { success: CheckCircle, error: WarningCircle, info: Info }

const styles = {
  success: 'border-brand/40 text-brand-bright',
  error: 'border-danger/40 text-danger',
  info: 'border-line-strong text-fg-secondary',
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const Icon = icons[item.type]
  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border bg-ink-900 px-4 py-3 shadow-card ${styles[item.type]}`}
    >
      <Icon size={18} className="shrink-0" />
      <p className="flex-1 text-sm text-fg-primary">{item.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="text-fg-muted transition-colors hover:text-fg-primary"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = ++idRef.current
      setToasts((t) => [...t, { id, message, type }])
      window.setTimeout(() => dismiss(id), 3500)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-xs flex-col gap-2 px-4 sm:px-0">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
