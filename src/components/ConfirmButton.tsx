import { useState } from 'react'
import { Trash } from '@phosphor-icons/react'

export default function ConfirmButton({
  onConfirm,
  busy = false,
  className = '',
}: {
  onConfirm: () => void
  busy?: boolean
  className?: string
}) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        aria-label="Hapus"
        onClick={() => setConfirming(true)}
        className={`rounded-lg border border-line p-2 text-fg-secondary transition-colors hover:border-danger/40 hover:text-danger ${className}`}
      >
        <Trash size={16} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={busy}
        onClick={() => {
          setConfirming(false)
          onConfirm()
        }}
        className="rounded-lg bg-danger px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-danger/80 disabled:opacity-60"
      >
        Yakin
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:bg-white/5"
      >
        Batal
      </button>
    </div>
  )
}
