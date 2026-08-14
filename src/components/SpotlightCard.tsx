import { useRef, type MouseEvent, type ReactNode } from 'react'

export default function SpotlightCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={`relative overflow-hidden rounded-2xl border border-line bg-surface-card backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-line-strong ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background:
            'radial-gradient(240px circle at var(--mx,50%) var(--my,50%), rgba(16,185,129,0.12), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
