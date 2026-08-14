import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { CalendarBlank, CaretDown, X } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function DateRangePicker({
  from,
  to,
  onChange,
  onClear,
}: {
  from?: Date
  to?: Date
  onChange: (from: Date | undefined, to: Date | undefined) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        !triggerRef.current?.contains(t) &&
        !popRef.current?.contains(t)
      )
        setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    setOpen((o) => {
      const next = !o
      if (next && triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect()
        setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
      }
      return next
    })
  }

  const label = from && to
    ? `${format(from, 'dd MMM yyyy', { locale: id })} — ${format(to, 'dd MMM yyyy', { locale: id })}`
    : from
      ? `${format(from, 'dd MMM yyyy', { locale: id })} — …`
      : 'Dari — Sampai'

  const selected: DateRange = { from, to }
  const active = Boolean(from || to)

  return (
    <div className="date-range-picker relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-xl border bg-white/5 px-3 py-2 text-left text-sm transition-colors hover:border-line-strong focus:border-brand focus:outline-none ${
          open ? 'border-brand' : 'border-line'
        } ${active ? 'pr-8' : ''}`}
      >
        <CalendarBlank size={16} className="shrink-0 text-fg-muted" />
        <span className={active ? 'text-fg-primary' : 'text-fg-muted'}>{label}</span>
        {!active && (
          <CaretDown
            size={14}
            className={`ml-auto text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {active && (
        <button
          type="button"
          aria-label="Bersihkan filter tanggal"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-fg-muted transition-colors hover:bg-white/10 hover:text-fg-primary"
        >
          <X size={14} />
        </button>
      )}
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="date-range-picker fixed z-50 rounded-xl border border-line-strong bg-ink-900 p-2 shadow-card"
            style={{ top: pos.top, right: pos.right }}
          >
            <DayPicker
              mode="range"
              locale={id}
              selected={selected}
              onSelect={(r) => {
                if (r?.from && r?.to) {
                  onChange(r.from, r.to)
                  setOpen(false)
                }
              }}
              numberOfMonths={1}
            />
          </div>,
          document.body,
        )}
    </div>
  )
}
