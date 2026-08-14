import { useEffect, useRef, useState } from 'react'
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
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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

  const label = from && to
    ? `${format(from, 'dd MMM yyyy', { locale: id })} — ${format(to, 'dd MMM yyyy', { locale: id })}`
    : from
      ? `${format(from, 'dd MMM yyyy', { locale: id })} — …`
      : 'Dari — Sampai'

  const selected: DateRange = { from, to }
  const active = Boolean(from || to)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-xl border bg-white/5 px-3 py-2 text-left text-sm transition-colors hover:border-line-strong focus:border-brand focus:outline-none ${
          open ? 'border-brand' : 'border-line'
        } ${active ? 'pr-8' : ''}`}
      >
        <CalendarBlank size={16} className="shrink-0 text-fg-muted" />
        <span className={active ? 'text-fg-primary' : 'text-fg-muted'}>{label}</span>
        <CaretDown
          size={14}
          className={`ml-auto text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {active && (
        <button
          type="button"
          aria-label="Bersihkan filter tanggal"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-fg-muted transition-colors hover:bg-white/10 hover:text-fg-primary"
        >
          <X size={14} />
        </button>
      )}
      {open && (
        <div className="absolute right-0 z-20 mt-1 rounded-xl border border-line-strong bg-ink-900 p-2 shadow-card">
          <DayPicker
            mode="range"
            locale={id}
            selected={selected}
            onSelect={(r) => {
              onChange(r?.from, r?.to)
              if (r?.from && r?.to) setOpen(false)
            }}
            numberOfMonths={1}
          />
        </div>
      )}
    </div>
  )
}
