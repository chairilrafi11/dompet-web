import type { ReactNode } from 'react'
import SpotlightCard from './SpotlightCard'

const tones = {
  default: 'text-fg-primary',
  income: 'text-brand-bright',
  expense: 'text-danger',
} as const

export default function StatCard({
  label,
  value,
  icon,
  tone = 'default',
  footer,
}: {
  label: string
  value: string
  icon?: ReactNode
  tone?: keyof typeof tones
  footer?: ReactNode
}) {
  return (
    <SpotlightCard className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-fg-secondary">{label}</p>
        {icon && <span className="text-fg-muted">{icon}</span>}
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
      {footer && <div className="mt-2">{footer}</div>}
    </SpotlightCard>
  )
}
