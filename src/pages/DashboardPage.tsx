import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowDownRight, ArrowUpRight, Plus, Receipt, TrendUp, Wallet } from '@phosphor-icons/react'
import { getByCategory, getMonthlyTrend, getSummary } from '../api/analytics'
import { getWallets } from '../api/wallets'
import { getTransactions } from '../api/transactions'
import { formatRupiah } from '../lib/format'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import Skeleton from '../components/Skeleton'
import SpotlightCard from '../components/SpotlightCard'
import StatCard from '../components/StatCard'

const PIE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#2dd4bf', '#14b8a6']

const tooltipStyle = {
  background: '#111514',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '12px',
  color: '#e7ebe9',
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const summaryQ = useQuery({ queryKey: ['summary'], queryFn: getSummary })
  const breakdownQ = useQuery({ queryKey: ['by-category'], queryFn: getByCategory })
  const walletsQ = useQuery({ queryKey: ['wallets'], queryFn: getWallets })
  const trendQ = useQuery({ queryKey: ['monthly-trend'], queryFn: () => getMonthlyTrend(6) })
  const transactionsQ = useQuery({ queryKey: ['transactions'], queryFn: () => getTransactions() })

  const loading = summaryQ.isLoading || walletsQ.isLoading || breakdownQ.isLoading
  const hasError =
    summaryQ.isError || walletsQ.isError || breakdownQ.isError || trendQ.isError

  if (loading) return <DashboardSkeleton />

  if (hasError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <ErrorBanner
          message="Gagal memuat data. Coba lagi."
          onRetry={() => {
            summaryQ.refetch()
            walletsQ.refetch()
            breakdownQ.refetch()
            trendQ.refetch()
          }}
        />
      </div>
    )
  }

  const wallets = walletsQ.data ?? []
  const breakdown = breakdownQ.data ?? []
  const summary = summaryQ.data
  const trend = (trendQ.data ?? []).map((m) => ({ ...m, net: m.income - m.expense }))
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
  const totalExpense = breakdown.reduce((sum, b) => sum + b.amount, 0)
  const top = breakdown.reduce<{ category: string; amount: number } | null>(
    (max, b) => (max === null || b.amount > max.amount ? b : max),
    null,
  )
  const topPct = top && totalExpense > 0 ? Math.round((top.amount / totalExpense) * 100) : 0
  const recent = (transactionsQ.data?.items ?? [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan keuanganmu"
        action={
          <Link
            to="/transactions"
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" /> Catat
          </Link>
        }
      />

      <SpotlightCard className="p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-fg-secondary">
              <Wallet size={16} /> Saldo Total
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-fg-primary sm:text-4xl">
              {formatRupiah(totalBalance)}
            </p>
            {summary && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-fg-secondary">
                {summary.net >= 0 ? (
                  <ArrowUpRight className="text-brand-bright" size={16} />
                ) : (
                  <ArrowDownRight className="text-danger" size={16} />
                )}
                Net bulan ini{' '}
                <span
                  className={`font-medium tabular-nums ${
                    summary.net >= 0 ? 'text-brand-bright' : 'text-danger'
                  }`}
                >
                  {formatRupiah(summary.net)}
                </span>
              </p>
            )}
          </div>
        </div>
      </SpotlightCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Pemasukan bulan ini"
          value={formatRupiah(summary?.income ?? 0)}
          tone="income"
          icon={<ArrowUpRight size={18} />}
        />
        <StatCard
          label="Pengeluaran bulan ini"
          value={formatRupiah(summary?.expense ?? 0)}
          tone="expense"
          icon={<ArrowDownRight size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SpotlightCard className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg-primary">
            <span className="text-brand-bright">◔</span> Pengeluaran per Kategori
          </h3>
          {breakdown.length === 0 ? (
            <EmptyState
              title="Belum ada pengeluaran bulan ini"
              description="Catat transaksi pertamamu."
            />
          ) : (
            <>
              {top && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand-dim px-4 py-3">
                  <span className="text-sm text-fg-primary">
                    Pengeluaran terbesar: <span className="font-medium">{top.category}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-brand-bright">
                    {topPct}%
                  </span>
                </div>
              )}
              <div className="relative">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {breakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatRupiah(Number(v))} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-fg-secondary">Total</span>
                  <span className="text-lg font-semibold tabular-nums">
                    {formatRupiah(totalExpense)}
                  </span>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {breakdown.map((b, i) => (
                  <li key={b.category} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-fg-secondary">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {b.category}
                    </span>
                    <span className="font-medium tabular-nums">{formatRupiah(b.amount)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SpotlightCard>

        <SpotlightCard className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg-primary">
            <TrendUp className="text-brand-bright" size={18} /> Tren Net 6 Bulan
          </h3>
          {trend.length === 0 ? (
            <EmptyState title="Belum ada data tren" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip formatter={(v) => formatRupiah(Number(v))} contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#netGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SpotlightCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SpotlightCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-fg-primary">
              <Receipt className="text-brand-bright" size={18} /> Transaksi Terakhir
            </h3>
            <Link to="/transactions" className="text-sm font-medium text-brand-bright hover:underline">
              Lihat semua
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="Belum ada transaksi" description="Catat transaksi pertamamu." />
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg-primary">{t.categoryName}</p>
                    <p className="truncate text-xs text-fg-muted">{t.walletName}</p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      t.type === 0 ? 'text-brand-bright' : 'text-danger'
                    }`}
                  >
                    {t.type === 0 ? '+' : '-'}
                    {formatRupiah(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SpotlightCard>

        <SpotlightCard className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg-primary">
            <Wallet className="text-brand-bright" size={18} /> Distribusi Saldo
          </h3>
          {wallets.length === 0 ? (
            <EmptyState title="Belum ada dompet" />
          ) : (
            <ul className="space-y-4">
              {wallets.map((w) => {
                const pct = totalBalance > 0 ? Math.round((w.balance / totalBalance) * 100) : 0
                return (
                  <li key={w.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-fg-primary">{w.name}</span>
                      <span className="tabular-nums text-fg-secondary">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs tabular-nums text-fg-muted">{formatRupiah(w.balance)}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </SpotlightCard>
      </div>
    </div>
  )
}
