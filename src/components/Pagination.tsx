import { CaretLeft, CaretRight } from '@phosphor-icons/react'

function pageList(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const p of pages) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line p-4">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:border-line-strong hover:text-fg-primary disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg-secondary"
      >
        <CaretLeft size={14} /> Sebelumnya
      </button>
      <div className="flex items-center gap-1">
        {pageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-fg-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-8 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-brand text-ink-950'
                  : 'text-fg-secondary hover:bg-white/5 hover:text-fg-primary'
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:border-line-strong hover:text-fg-primary disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg-secondary"
      >
        Berikutnya <CaretRight size={14} />
      </button>
    </div>
  )
}
