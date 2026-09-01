import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarBlank,
  ChartDonut,
  PiggyBank,
  TrendUp,
  Wallet as WalletIcon,
} from '@phosphor-icons/react'
import { subMonths, subDays, startOfMonth, endOfMonth, format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { getByCategory, getSummary, getTrend, getWalletRecap } from '../api/analytics'
import { getTransactions } from '../api/transactions'
import { formatRupiah } from '../lib/format'
import DateRangePicker from '../components/DateRangePicker'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import Skeleton from '../components/Skeleton'
import SlideOver from '../components/SlideOver'
import SpotlightCard from '../components/SpotlightCard'
import StatCard from '../components/StatCard'

const PIE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#2dd4bf', '#14b8a6', '#0d9488', '#5eead4', '#99f6e4']

const tooltipStyle = {
  background: '#111514',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '12px',
  color: '#e7ebe9',
}

type Preset = 'thisMonth' | 'lastMonth' | '3m' | '6m' | '12m' | 'custom'

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'thisMonth', label: 'Bulan ini' },
  { key: 'lastMonth', label: 'Bulan lalu' },
  { key: '3m', label: '3 bln' },
  { key: '6m', label: '6 bln' },
  { key: '12m', label: '12 bln' },
]

interface Range {
  from: string
  to: string
  label: string
}

function resolveRange(preset: Preset, from?: Date, to?: Date): Range {
  const now = new Date()
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd')
  switch (preset) {
    case 'lastMonth': {
      const prev = subMonths(now, 1)
      return { from: fmt(startOfMonth(prev)), to: fmt(endOfMonth(prev)), label: format(prev, 'MMMM yyyy', { locale: id }) }
    }
    case '3m':
      return { from: fmt(startOfMonth(subMonths(now, 2))), to: fmt(now), label: '3 bulan terakhir' }
    case '6m':
      return { from: fmt(startOfMonth(subMonths(now, 5))), to: fmt(now), label: '6 bulan terakhir' }
    case '12m':
      return { from: fmt(startOfMonth(subMonths(now, 11))), to: fmt(now), label: '12 bulan terakhir' }
    case 'custom':
      return {
        from: fmt(from ?? subDays(now, 30)),
        to: fmt(to ?? now),
        label: `${format(from ?? subDays(now, 30), 'dd MMM yyyy', { locale: id })} — ${format(to ?? now, 'dd MMM yyyy', { locale: id })}`,
      }
    default:
      return { from: fmt(startOfMonth(now)), to: fmt(now), label: 'Bulan ini' }
  }
}

function formatTrendDate(date: string) {
  const d = parseISO(date)
  return date.length === 10 ? format(d, 'dd MMM', { locale: id }) : format(d, 'MMM yyyy', { locale: id })
}

function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return null
  return Math.round(((current - prev) / Math.abs(prev)) * 100)
}

function Delta({
  current,
  prev,
  invert = false,
}: {
  current: number
  prev: number
  invert?: boolean
}) {
  const pct = pctChange(current, prev)
  if (pct === null) return <span className="text-xs text-fg-muted">—</span>
  const up = invert ? pct < 0 : pct >= 0
  const Icon = pct >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium tabular-nums ${
        up ? 'text-brand-bright' : 'text-danger'
      }`}
    >
      <Icon size={14} weight="bold" />
      {pct >= 0 ? '+' : ''}
      {pct}%
    </span>
  )
}

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<Preset>('thisMonth')
  const [customFrom, setCustomFrom] = useState<Date | undefined>()
  const [customTo, setCustomTo] = useState<Date | undefined>()
  const [hidden, setHidden] = useState<Set<number>>(new Set())
  const [drill, setDrill] = useState<{ categoryId: number; name: string } | null>(null)

  const range = useMemo(
    () => resolveRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  )

  const params = { from: range.from, to: range.to }

  const summaryQ = useQuery({ queryKey: ['summary', params], queryFn: () => getSummary(params) })
  const breakdownQ = useQuery({ queryKey: ['by-category', params], queryFn: () => getByCategory(params) })
  const trendQ = useQuery({ queryKey: ['trend', params], queryFn: () => getTrend(params) })
  const recapQ = useQuery({ queryKey: ['wallet-recap', params], queryFn: () => getWalletRecap(params) })
  const drillQ = useQuery({
    queryKey: ['drill', drill, params],
    queryFn: () => getTransactions({ categoryId: drill!.categoryId, dateFrom: range.from, dateTo: range.to }, 1, 50),
    enabled: drill !== null,
  })

  const summary = summaryQ.data
  const breakdown = (breakdownQ.data ?? []).map((b) => ({ ...b, hidden: hidden.has(b.categoryId) }))
  const visible = breakdown.filter((b) => !b.hidden)
  const trend = trendQ.data ?? []
  const recap = recapQ.data ?? []
  const drillTxs = drillQ.data?.items ?? []

  const toggleCategory = (categoryId: number) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const allLoading = summaryQ.isLoading || trendQ.isLoading || breakdownQ.isLoading || recapQ.isLoading
  const anyError = summaryQ.isError || trendQ.isError || breakdownQ.isError || recapQ.isError

  const retryAll = () => {
    summaryQ.refetch()
    trendQ.refetch()
    breakdownQ.refetch()
    recapQ.refetch()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analitik"
        subtitle={range.label}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    preset === p.key
                      ? 'bg-brand-dim font-medium text-brand-bright'
                      : 'text-fg-secondary hover:text-fg-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <DateRangePicker
              from={customFrom}
              to={customTo}
              onChange={(from, to) => {
                setCustomFrom(from)
                setCustomTo(to)
                setPreset('custom')
              }}
              onClear={() => {
                setCustomFrom(undefined)
                setCustomTo(undefined)
                setPreset('thisMonth')
              }}
            />
          </div>
        }
      />

      {anyError && (
        <ErrorBanner message="Gagal memuat data analitik." onRetry={retryAll} />
      )}

      {allLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Pemasukan"
              value={formatRupiah(summary?.income ?? 0)}
              tone="income"
              icon={<ArrowUpRight size={18} />}
              footer={<Delta current={summary?.income ?? 0} prev={summary?.prevIncome ?? 0} />}
            />
            <StatCard
              label="Pengeluaran"
              value={formatRupiah(summary?.expense ?? 0)}
              tone="expense"
              icon={<ArrowDownRight size={18} />}
              footer={<Delta current={summary?.expense ?? 0} prev={summary?.prevExpense ?? 0} invert />}
            />
            <StatCard
              label="Net"
              value={formatRupiah(summary?.net ?? 0)}
              icon={<TrendUp size={18} />}
              footer={<Delta current={summary?.net ?? 0} prev={summary?.prevNet ?? 0} />}
            />
            <SpotlightCard className="p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-fg-secondary">vs Periode sebelumnya</p>
                <CalendarBlank size={18} className="text-fg-muted" />
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Pemasukan</span>
                  <Delta current={summary?.income ?? 0} prev={summary?.prevIncome ?? 0} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Pengeluaran</span>
                  <Delta current={summary?.expense ?? 0} prev={summary?.prevExpense ?? 0} invert />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Net</span>
                  <Delta current={summary?.net ?? 0} prev={summary?.prevNet ?? 0} />
                </div>
              </div>
            </SpotlightCard>
          </div>

          <SpotlightCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-fg-primary">
                <TrendUp className="text-brand-bright" size={18} /> Tren Pemasukan & Pengeluaran
              </h3>
            </div>
            {trend.length === 0 ? (
              <EmptyState title="Belum ada data tren" description="Tren muncul setelah ada transaksi." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatTrendDate}
                    tick={{ fill: '#9aa4a0', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6b7672', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatTrendDate(String(label))}
                    formatter={(v, name) => [
                      formatRupiah(Number(v)),
                      name === 'income' ? 'Pemasukan' : 'Pengeluaran',
                    ]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Pemasukan"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Pengeluaran"
                    stroke="#f87171"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SpotlightCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SpotlightCard className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg-primary">
                <ChartDonut className="text-brand-bright" size={18} /> Pengeluaran per Kategori
              </h3>
              {breakdown.length === 0 ? (
                <EmptyState
                  title="Belum ada pengeluaran periode ini"
                  description="Catat transaksi pertamamu."
                />
              ) : (
                <>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={visible}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {visible.map((b, i) => (
                            <Cell key={b.categoryId} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => formatRupiah(Number(v))} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs text-fg-secondary">Total</span>
                      <span className="text-lg font-semibold tabular-nums">
                        {formatRupiah(visible.reduce((s, b) => s + b.amount, 0))}
                      </span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {breakdown.map((b, i) => (
                      <li key={b.categoryId} className="flex items-center justify-between gap-2 text-sm">
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked={!b.hidden}
                            onChange={() => toggleCategory(b.categoryId)}
                            className="h-4 w-4 shrink-0 accent-brand"
                          />
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                              background: PIE_COLORS[i % PIE_COLORS.length],
                              opacity: b.hidden ? 0.3 : 1,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setDrill({ categoryId: b.categoryId, name: b.category })}
                            className="min-w-0 truncate text-left text-fg-secondary transition-colors hover:text-fg-primary"
                            title={`Lihat transaksi ${b.category}`}
                          >
                            {b.category}
                          </button>
                        </label>
                        <span className="shrink-0 font-medium tabular-nums">{formatRupiah(b.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </SpotlightCard>

            <SpotlightCard className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg-primary">
                <PiggyBank className="text-brand-bright" size={18} /> Rekap per Dompet
              </h3>
              {recap.length === 0 ? (
                <EmptyState title="Belum ada transaksi periode ini" />
              ) : (
                <ul className="space-y-4">
                  {recap.map((r) => {
                    const pct = Math.min(100, Math.max(0, recap.reduce((s, x) => s + Math.abs(x.net), 0) === 0 ? 0 : Math.round((Math.abs(r.net) / recap.reduce((s, x) => s + Math.abs(x.net), 0)) * 100)))
                    const positive = r.net >= 0
                    return (
                      <li key={r.walletId}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-fg-primary">
                            <WalletIcon size={15} className="text-fg-muted" />
                            {r.walletName}
                          </span>
                          <span
                            className={`font-medium tabular-nums ${
                              positive ? 'text-brand-bright' : 'text-danger'
                            }`}
                          >
                            {positive ? '+' : ''}
                            {formatRupiah(r.net)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className={`h-full rounded-full transition-all ${
                              positive ? 'bg-brand' : 'bg-danger'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs tabular-nums text-fg-muted">
                          in {formatRupiah(r.income)} · out {formatRupiah(r.expense)}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </SpotlightCard>
          </div>

          <SpotlightCard className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg-primary">
              <TrendUp className="text-brand-bright" size={18} /> Perbandingan Kategori vs Periode Sebelumnya
            </h3>
            {visible.length === 0 ? (
              <EmptyState
                title="Tidak ada kategori untuk dibandingkan"
                description="Centang kembali kategori untuk melihat perbandingan."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={visible}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: '#9aa4a0', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fill: '#6b7672', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Tooltip
                      formatter={(v, name) => [formatRupiah(Number(v)), name === 'Sekarang' ? 'Periode ini' : 'Sebelumnya']}
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    />
                    <Legend />
                    <Bar dataKey="prevAmount" name="Sebelumnya" fill="#6b7672" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="amount" name="Sekarang" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs text-fg-muted">
                        <th className="pb-2 pr-3 font-medium">Kategori</th>
                        <th className="pb-2 pr-3 text-right font-medium">Periode ini</th>
                        <th className="pb-2 pr-3 text-right font-medium">Sebelumnya</th>
                        <th className="pb-2 text-right font-medium">Perubahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {visible.map((b) => (
                        <tr key={b.categoryId} className="text-fg-primary">
                          <td className="py-2 pr-3 font-medium">{b.category}</td>
                          <td className="py-2 pr-3 text-right tabular-nums">{formatRupiah(b.amount)}</td>
                          <td className="py-2 pr-3 text-right tabular-nums text-fg-muted">
                            {formatRupiah(b.prevAmount)}
                          </td>
                          <td className="py-2 text-right">
                            <Delta current={b.amount} prev={b.prevAmount} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SpotlightCard>
        </>
      )}

      <SlideOver
        open={drill !== null}
        title={drill ? `Transaksi ${drill.name}` : ''}
        onClose={() => setDrill(null)}
      >
        {drillQ.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : drillTxs.length === 0 ? (
          <EmptyState title="Tidak ada transaksi kategori ini" description="Belum ada transaksi pada periode ini." />
        ) : (
          <ul className="divide-y divide-line">
            {drillTxs.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg-primary">{t.note || t.categoryName}</p>
                  <p className="text-xs text-fg-muted">
                    {format(parseISO(t.date), 'dd MMM yyyy', { locale: id })} · {t.walletName}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-danger">
                  -{formatRupiah(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SlideOver>
    </div>
  )
}
